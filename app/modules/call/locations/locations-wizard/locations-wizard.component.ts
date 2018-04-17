import {
  CallLocationSettingsService, LocationSettingsOptionsService,
  CallLocationSettingsData, LocationSettingsOptions,
  LocationCallerId, HIDDEN,
} from '../shared';
import { InternalNumberRange } from 'modules/call/shared/internal-number-range';
import {
  PstnModel, PstnService, PstnCarrier, SWIVEL,
} from 'modules/huron/pstn';

import { Notification } from 'modules/core/notifications';

export class LocationsWizardComponent {
  public controller = LocationsWizardController;
  public template = require('modules/call/locations/locations-wizard/locations-wizard.component.html');
  public bindings = {
    onKeyPressFn: '&',
  };
}

const PAGE_ESA: number = 5;

enum PageNumbers {
  PAGE1 = 1,
  PAGE2 = 2,
  PAGE3 = 3,
  PAGE4 = 4,
  PAGE5 = 5,
}

class LocationsWizardController implements ng.IComponentController {
  private static readonly PAGE_TRANSITION_TIMEOUT: number = 10;

  public ftsw: boolean = false; //Used for child components
  public form: ng.IFormController;
  public index: number = 0;
  public animation: string;
  public namePlaceholder: string;
  public validationMessages: {required, uniqueAsyncValidator};
  public callLocationSettingsData: CallLocationSettingsData;
  public locationSettingsOptions: LocationSettingsOptions;
  public showRoutingPrefix: boolean = true;
  public loading: boolean = false;
  public processing: boolean = false;
  public isRoutingPrefixValid: boolean;

  private lastIndex = 5;
  public onKeyPressFn: Function;

  /* @ngInject */
  constructor(
    private $q: ng.IQService,
    private $timeout: ng.ITimeoutService,
    private $element: ng.IRootElementService,
    private $scope: ng.IScope,
    private $state: ng.ui.IStateService,
    private $translate: ng.translate.ITranslateService,
    private $modal,
    private Authinfo,
    private Orgservice,
    private LocationSettingsOptionsService: LocationSettingsOptionsService,
    private CallLocationSettingsService: CallLocationSettingsService,
    private PstnService: PstnService,
    private PstnModel: PstnModel,
    private Notification: Notification,
  ) {
    this.namePlaceholder = this.$translate.instant('locations.namePlaceholder');
    this.validationMessages = {
      required: this.$translate.instant('common.invalidRequired'),
      uniqueAsyncValidator: this.$translate.instant('locations.usedLocation'),
    };
  }

  public $onInit(): void {
    this.$scope.$watch((): number => {
      return this.index;
    }, (newIndex: number, oldIndex: number) => {
      if (newIndex !== oldIndex && (newIndex === PageNumbers.PAGE2 || newIndex === PageNumbers.PAGE4)) {
        this.$timeout(() => {
          this.$element.find('#selectMain').focus();
        }, 100);
      } else if (newIndex !== oldIndex && newIndex === PageNumbers.PAGE5) {
        this.$timeout(() => {
          this.$element.find('#emergencyServiceBtn').focus();
        }, 100);
      } else if (newIndex !== oldIndex && newIndex === PageNumbers.PAGE3) {
        this.$timeout(() => {
          this.$element.find('#dialingPrefix').focus();
        }, 100);
      } else if (newIndex !== oldIndex && newIndex === PageNumbers.PAGE1) {
        this.$timeout(() => {
          this.$element.find('#locationCallerIdToggleSwitch').focus();
        }, 100);
      }
    });

    this.loading = true;
    this.Orgservice.getOrg(_.noop, null, { basicInfo: true }).then( data => {
      if (data.countryCode) {
        this.PstnModel.setCountryCode(data.countryCode);
      }
    });
    this.PstnService.getCustomerV2(this.Authinfo.getOrgId()).then(() => {
      this.PstnModel.setCustomerId(this.Authinfo.getOrgId());
      this.PstnModel.setCustomerExists(true);

      this.PstnService.listCustomerCarriers(this.Authinfo.getOrgId()).then(carriers => {
        if (_.get(carriers, '[0].apiImplementation') !== SWIVEL) {
          this.PstnModel.setProvider(_.get<PstnCarrier>(carriers, '[0]'));
        } else {
          this.lastIndex = 4;
        }
      }).catch(() => this.lastIndex = 4);
    }).catch(() => this.lastIndex = 4);

    this.$q.resolve(this.initComponent()).finally(() => this.loading = false);
  }

  private initComponent() {
    return this.LocationSettingsOptionsService.getOptions()
      .then(locationOptions => this.locationSettingsOptions = locationOptions)
      .then(() => {
        return this.CallLocationSettingsService.get(undefined, true) // Calling with parameter indicating new location to prevent default location ESA being populated.
          .then(locationSettings => {
            locationSettings.location.uuid = undefined;
            locationSettings.location.name = '';
            locationSettings.location.defaultLocation = false;
            locationSettings.location.callerId = null;
            this.callLocationSettingsData = locationSettings;
            this.showRoutingPrefix = this.setShowRoutingPrefix(locationSettings.customerVoice.routingPrefixLength);
          });
      })
      .catch(response => {
        this.Notification.errorResponse(response);
      });
  }

  public onTimeZoneChanged(timeZone: string) {
    this.callLocationSettingsData.location.timeZone = timeZone;
  }

  public onPreferredLanguageChanged(preferredLanguage: string): void {
    this.callLocationSettingsData.location.preferredLanguage = preferredLanguage;
  }

  public onDefaultCountryChanged(defaultCountry: string): void {
    this.callLocationSettingsData.location.tone = defaultCountry;
  }

  public onRoutingPrefixChanged(routingPrefix: string): void {
    this.callLocationSettingsData.location.routingPrefix = routingPrefix;
    if (!_.isNull(this.callLocationSettingsData.location.routingPrefix)) {
      this.isRoutingPrefixValid = true;
      this.filterExtensionRangesByRoutingPrefix(routingPrefix);
    } else if (this.showRoutingPrefix) {
      this.isRoutingPrefixValid = false;
    }
  }

  public onExtensionRangeChanged(extensionRanges: InternalNumberRange[]): void {
    this.callLocationSettingsData.internalNumberRanges = extensionRanges;
  }

  public onSteeringDigitChanged(steeringDigit: string): void {
    this.callLocationSettingsData.location.steeringDigit = steeringDigit;
  }

  public onCallerIdChanged(callerId: LocationCallerId): void {
    this.callLocationSettingsData.location.callerId = callerId;
  }

  public onRegionCodeChanged(regionCode: string, useSimplifiedNationalDialing: boolean): void {
    this.callLocationSettingsData.location.regionCodeDialing.regionCode = regionCode;
    this.callLocationSettingsData.location.regionCodeDialing.simplifiedNationalDialing = useSimplifiedNationalDialing;
  }

  public filterExtensionRangesByRoutingPrefix(routingPrefix) {
    return this.CallLocationSettingsService.getLocationExtensionRanges(routingPrefix)
      .then(numberRanges => this.callLocationSettingsData.internalNumberRanges = _.cloneDeep(numberRanges));
  }

  public resetAddr() {
    this.callLocationSettingsData.address.reset();
  }

  public getLastIndex(): number {
    return this.lastIndex;
  }

  public getPageIndex(): number {
    return this.index;
  }

  public previousButton(): any {
    if (this.index === 0) {
      return HIDDEN;
    }
    return true;
  }

  public evalEscKeyPress($event: KeyboardEvent): void {
    const keycode = $event.which;
    switch (keycode) {
      case 27:
      //escape key
        this.cancelModal();
        $event.preventDefault();
        $event.stopPropagation();
        break;
      default:
        break;
    }
  }

  public evalKeyPress($event: KeyboardEvent): void {
    const keycode = $event.which;
    switch (keycode) {
      case 13:
      case 39:
      //right arrow
        if (this.nextButton() === true) {
          this.nextPage();
        }
        break;
      case 37:
      //left arrow
        if (this.previousButton() === true) {
          this.previousPage();
        }
        break;
      default:
        break;
    }
  }

  public nextButton(): any {
    if (this.form && this.form.$valid && (this.index === PAGE_ESA)) {
      //Must be valid if ESA is being set/changed
      if (this.PstnModel.isCustomerExists()) {
        return this.callLocationSettingsData.address.validated;
      }
    }
    return this.form && this.form.$valid;
  }

  public previousPage(): void {
    this.animation = 'slide-right';
    this.$timeout(() => {
      if (this.index === this.getLastIndex()) {
        //Change the green arrow button to a blue one
        const arrowButton = this.$element.find('button.btn--circle.btn--primary.btn--right');
        arrowButton.removeClass('btn--cta');
        //Hide helpText
        const helpText = this.$element.find('div.btn-helptext.helptext-btn--right');
        helpText.removeClass('active');
        helpText.removeClass('enabled');
      }
      this.index--;
    }, LocationsWizardController.PAGE_TRANSITION_TIMEOUT);
  }

  public nextPage(): void {
    this.animation = 'slide-left';
    this.$timeout(() => {
      this.index++;
      if (this.index === this.getLastIndex()) {
        //Change the blue arrow button to a green one
        const arrowButton = this.$element.find('button.btn--circle.btn--primary.btn--right');
        arrowButton.addClass('btn--cta');
        //Show helpText
        const helpText = this.$element.find('div.btn-helptext.helptext-btn--right');
        helpText.addClass('active');
        helpText.addClass('enabled');
      }
      if (this.index === this.getLastIndex() + 1) {
        this.saveLocation();
        this.index--;
      }
    }, LocationsWizardController.PAGE_TRANSITION_TIMEOUT);
  }

  public nextText(): string {
    return this.$translate.instant('common.create');
  }

  private saveLocation(): ng.IPromise<void> {
    this.processing = true;
    return this.CallLocationSettingsService.save(this.callLocationSettingsData)
      .then(() => this.$state.go('call-locations'))
      .finally(() => {
        this.processing = false;
      });
  }

  private setShowRoutingPrefix(routingPrefixLength: number | null): boolean {
    if (_.isNull(routingPrefixLength) || routingPrefixLength === 0) {
      this.isRoutingPrefixValid = true;
      return false;
    } else {
      this.isRoutingPrefixValid = false;
      return true;
    }
  }

  public cancelModal(): void {
    this.$modal.open({
      template: require('modules/call/locations/locations-wizard/locations-wizard-cancel-modal.html'),
      type: 'dialog',
    });
  }
}
