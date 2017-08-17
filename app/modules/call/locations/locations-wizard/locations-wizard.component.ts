import { CallLocationSettingsService, LocationSettingsOptionsService, CallLocationSettingsData, LocationSettingsOptions, LocationCallerId, HIDDEN, LocationListItem } from 'modules/call/locations/shared';
import { PstnModel, PstnService, PstnAddressService, Address, PstnCarrier, SWIVEL } from 'modules/huron/pstn';
import { InternalNumberRange } from 'modules/call/shared/internal-number-range';
import { Notification } from 'modules/core/notifications';

export class LocationsWizardComponent {
  public controller = LocationsWizardController;
  public templateUrl = 'modules/call/locations/locations-wizard/locations-wizard.component.html';
  public bindings = {};
}

const PAGE_ESA: number = 6;

class LocationsWizardController implements ng.IComponentController {
  private static readonly PAGE_TRANSITION_TIMEOUT: number = 10;

  public ftsw: boolean = false; //Used for child components
  public addressFound: boolean;
  public form: ng.IFormController;
  public index: number = 0;
  public animation: string;
  public showEmergencyServiceAddress: boolean;
  public addressValidated: boolean = false;
  public addressValidating: boolean = false;
  public namePlaceholder: string;
  public callLocationSettingsData: CallLocationSettingsData;
  public locationSettingsOptions: LocationSettingsOptions;
  public showRoutingPrefix: boolean = true;
  public loading: boolean = false;
  public processing: boolean = false;
  public validationMessages: Object;
  public address: Address = new Address();
  public defaultLocation: LocationListItem;
  public isRoutingPrefixValid: boolean;

  private lastIndex = 5;

  /* @ngInject */
  constructor(
    private $q: ng.IQService,
    private $timeout: ng.ITimeoutService,
    private $element: ng.IRootElementService,
    private $state: ng.ui.IStateService,
    private $translate: ng.translate.ITranslateService,
    private $modal,
    private Authinfo,
    private Orgservice,
    private LocationSettingsOptionsService: LocationSettingsOptionsService,
    private CallLocationSettingsService: CallLocationSettingsService,
    private PstnAddressService: PstnAddressService,
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
    this.loading = true;
    this.Orgservice.getOrg(_.noop, null, { basicInfo: true }).then( data => {
      if (data.countryCode) {
        this.PstnModel.setCountryCode(data.countryCode);
      }
    });

    this.PstnService.getCustomer(this.Authinfo.getOrgId()).then(() => {
      this.PstnModel.setCustomerId(this.Authinfo.getOrgId());
      this.PstnModel.setCustomerExists(true);

      this.PstnService.listCustomerCarriers(this.Authinfo.getOrgId()).then(carriers => {
        if (_.get(carriers, '[0].apiImplementation') !== SWIVEL) {
          this.PstnModel.setProvider(_.get<PstnCarrier>(carriers, '[0]'));
          this.showEmergencyServiceAddress = true;
        } else {
          this.lastIndex = 5;
        }
      }).catch(() => this.lastIndex = 5);
    });

    this.$q.resolve(this.initComponent()).finally(() => this.loading = false);
  }

  private initComponent() {
    return this.LocationSettingsOptionsService.getOptions()
      .then(locationOptions => this.locationSettingsOptions = locationOptions)
      .then(() => {
        return this.CallLocationSettingsService.get('')
          .then(locationSettings => {
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

  public onDateFormatChanged(dateFormat: string): void {
    this.callLocationSettingsData.location.dateFormat = dateFormat;
  }

  public onTimeFormatChanged(timeFormat: string): void {
    this.callLocationSettingsData.location.timeFormat = timeFormat;
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

  public validateAddress() {
    this.addressValidating = true;
    this.PstnAddressService.lookup(this.PstnModel.getProviderId(), this.address)
      .then((address: Address) => {
        if (address) {
          this.address = address;
          this.addressValidated = true;
          this.addressFound = true;
        } else {
          this.Notification.error('pstnSetup.serviceAddressNotFound');
        }
      })
      .catch(error => this.Notification.errorResponse(error))
      .finally(() => {
        this.addressValidating = false;
      });
  }

  public filterExtensionRangesByRoutingPrefix(routingPrefix) {
    return this.CallLocationSettingsService.getLocationExtensionRanges(routingPrefix)
      .then(numberRanges => this.callLocationSettingsData.internalNumberRanges = numberRanges);
  }

  public resetAddr() {
    this.address = new Address();
    this.addressValidated = false;
    this.addressFound = false;
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

  public nextButton(): any {
    if (this.index === PAGE_ESA) {
      //You may change your ESA, but it is not required to create a location
      if (this.form && this.form.$valid) {
        //Must be valid if ESA is being set/changed
        return this.addressValidated;
      }
      return true;
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
      templateUrl: 'modules/call/locations/locations-wizard/locations-wizard-cancel-modal.html',
      type: 'dialog',
    });
  }
}
