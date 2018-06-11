import { CallParkService, CallPark, ICallParkRangeItem } from 'modules/call/features/call-park';
import { CallFeatureMember } from 'modules/call/features/shared/call-feature-members/call-feature-member';
import { FallbackDestination } from 'modules/call/features/shared/call-feature-fallback-destination';
import { HuronSiteService } from 'modules/huron/sites';
import { Notification } from 'modules/core/notifications';
import { LocationsService, LocationListItem } from 'modules/call/locations';
import { AccessibilityService, KeyCodes } from 'modules/core/accessibility';

class CallParkCtrl implements ng.IComponentController {
  private static readonly DEFAULT_EXTENSION_LENGTH: number  = 4;
  private static readonly PAGE_TRANSITION_TIMEOUT: number = 10;

  // setup assistant specific data
  public pageIndex: number = 0;
  public animation: string = 'slide-left';

  // edit mode specific data
  public title: string;
  public huronFeaturesUrl: string = 'huronfeatures';
  public memberProperties: string[] = ['name', 'number'];

  // common data
  public form: ng.IFormController;
  public callParkId: string;
  public callPark: CallPark;
  public range: ICallParkRangeItem;
  public selectedMembers: string[] = [];
  public extensionLength: number = CallParkCtrl.DEFAULT_EXTENSION_LENGTH;
  public isLoading: boolean = false;
  public saveInProcess: boolean = false;
  public hasLocation: boolean = false;
  public customerLocations: LocationListItem[];
  public defaultLocation: LocationListItem;

  private readonly FEATURE_NAME: string = '[name="editCallFeatureName"]';

  /* @ngInject */
  constructor(
    private $element: ng.IRootElementService,
    private $modal,
    private $state: ng.ui.IStateService,
    private $stateParams,
    private $timeout: ng.ITimeoutService,
    private $window: ng.IWindowService,
    private AccessibilityService: AccessibilityService,
    private CallParkService: CallParkService,
    private HuronSiteService: HuronSiteService,
    private Notification: Notification,
    private $translate: ng.translate.ITranslateService,
    private FeatureToggleService,
    private LocationsService: LocationsService,
  ) {
    this.callParkId = _.get<string>(this.$stateParams.feature, 'id');
    this.title = _.get<string>(this.$stateParams.feature, 'cardName');
  }

  public $onInit(): void {
    if (this.$state.current.name === 'callparkedit' && !this.callParkId) {
      this.$state.go(this.huronFeaturesUrl);
    }
    this.isLoading = true;
    this.CallParkService.getCallPark(this.callParkId).then( callPark => {
      this.callPark = callPark;
      this.range = {
        startRange: _.get<string>(callPark, 'startRange', ''),
        endRange: _.get<string>(callPark, 'endRange', ''),
      };
      if (!this.callPark.uuid) {
        this.nextButton(this.pageIndex);
      }
    })
      .finally( () => this.isLoading = false);

    this.HuronSiteService.listSites().then(sites => {
      this.HuronSiteService.getSite(_.get<string>(sites[0], 'uuid')).then(site => {
        this.extensionLength = site.extensionLength;
      });
    });

    this.FeatureToggleService.supports(this.FeatureToggleService.features.hI1484).then((supports) => {
      this.hasLocation = supports;
      //get locations and default location
      this.LocationsService.getLocationList().then(locations => {
        this.customerLocations = locations;
        this.defaultLocation = locations[0];
      });
    });
  }

  public setCallParkName(name: string): void {
    this.callPark.name = name;
    this.checkForChanges();
  }

  public setCallParkLocation(location: LocationListItem): void {
    if (this.callPark.location) {
      this.setCallParkRange(<ICallParkRangeItem>{
        startRange: '',
        endRange: '',
      });
      this.setCallParkMembers([]);
    }
    this.callPark.location = location;
    this.checkForChanges();
  }

  public setCallParkRange(range: ICallParkRangeItem): void {
    this.range = range;
    this.callPark.startRange = range.startRange;
    this.callPark.endRange = range.endRange;
    this.form.$setDirty();
    this.checkForChanges();
  }

  public setCallParkMembers(members: CallFeatureMember[]): void {
    this.callPark.members = members;
    this.form.$setDirty();
    this.callPark.members.length > 0 ? this.form.$invalid = false : this.form.$invalid = true;
    this.checkForChanges();
  }

  public setCallParkFallbackDestination(fbDestination: FallbackDestination) {
    this.callPark.fallbackDestination = fbDestination;
    this.form.$setDirty();
    this.checkForChanges();
  }

  public setCallParkFallbackTimer(seconds: number) {
    this.callPark.fallbackTimer = seconds;
    this.checkForChanges();
  }

  public cancelModal(): void {
    this.$modal.open({
      template: require('modules/call/features/call-park/call-park-cancel-modal.html'),
      type: 'dialog',
    });
  }

  public onCancel(): void {
    this.callPark = this.CallParkService.getOriginalConfig();
    this.range = <ICallParkRangeItem>{
      startRange: this.callPark.startRange || '',
      endRange: this.callPark.endRange || '',
    };
    this.resetForm();
    this.AccessibilityService.setFocus(this.$element, this.FEATURE_NAME);
  }

  public createCallPark(): void {
    this.saveInProcess = true;
    this.CallParkService.createCallPark(this.callPark)
      .then( () => {
        this.$state.go('huronfeatures');
      })
      .catch( (response) => {
        this.Notification.errorWithTrackingId(response);
      })
      .finally( () => this.saveInProcess = false);
  }

  public save(): void {
    this.saveInProcess = true;
    this.CallParkService.updateCallPark(this.callPark.uuid, this.callPark)
      .then( () => {
        this.Notification.success('callPark.successUpdate', { callParkName: this.callPark.name } );
        this.title = this.callPark.name || '';
      })
      .catch( (response) => {
        this.Notification.errorWithTrackingId(response);
      })
      .finally( () => {
        this.saveInProcess = false;
        this.resetForm();
        this.AccessibilityService.setFocus(this.$element, this.FEATURE_NAME);
      });
  }

  public evalKeyPress($keyCode): void {
    switch ($keyCode) {
      case KeyCodes.ESCAPE:
        this.cancelModal();
        break;
      case KeyCodes.RIGHT:
        if (this.nextButton(this.pageIndex)) {
          this.nextPage();
        }
        break;
      case KeyCodes.LEFT:
        if (this.previousButton(this.pageIndex)) {
          this.previousPage();
        }
        break;
      default:
        break;
    }
  }

  public enterNextPage($keyCode): boolean | undefined {
    if ($keyCode === KeyCodes.ENTER && this.nextButton(this.pageIndex)) {
      this.nextPage();
    } else {
      return false;
    }
  }

  public nextButton($index): boolean {
    const buttonStates = {
      0: () => {
        return !_.isUndefined(_.get(this.callPark, 'name'));
      },
      1: () => {
        if (this.showLocation()) {
          return this.callPark.location;
        } else {
          return this.form.$valid;
        }
      },
      2: () => {
        if (this.showLocation()) {
          return this.form.$valid;
        } else {
          if (_.get(this.callPark, 'members', []).length !== 0) {
            this.applyElement(this.$window.document.getElementsByClassName('helptext-btn--right'), 'enabled', 'add');
            return true;
          } else {
            this.applyElement(this.$window.document.getElementsByClassName('helptext-btn--right'), 'enabled', 'remove');
            return false;
          }
        }
      },
      3: () => {
        if (_.get(this.callPark, 'members', []).length !== 0) {
          this.applyElement(this.$window.document.getElementsByClassName('helptext-btn--right'), 'enabled', 'add');
          return true;
        } else {
          this.applyElement(this.$window.document.getElementsByClassName('helptext-btn--right'), 'enabled', 'remove');
          return false;
        }
      },
      default: () => {
        return false;
      },
    };
    return buttonStates[$index]() || buttonStates['default']();
  }

  public nextPage(): void {
    this.animation = 'slide-left';
    this.$timeout( () => {
      if ((this.pageIndex === 2 && !this.showLocation()) || (this.pageIndex === 3 && this.showLocation()))  {
        this.createCallPark();
      } else {
        this.pageIndex++;
        if ((this.pageIndex === 2 && !this.showLocation()) || (this.pageIndex === 3 && this.showLocation())) {
          this.applyElement(this.$window.document.getElementsByClassName('btn--circle btn--primary btn--right'), 'save-call-feature', 'add');
          this.applyElement(this.$window.document.getElementsByClassName('helptext-btn--right'), 'active', 'add');
        }
      }
    }, CallParkCtrl.PAGE_TRANSITION_TIMEOUT);
  }

  public previousButton($index): string | boolean {
    if ($index === 0) {
      return 'hidden';
    }
    return true;
  }

  public previousPage(): void {
    this.animation = 'slide-right';
    this.$timeout( () => {
      this.pageIndex--;
      this.applyElement(this.$window.document.getElementsByClassName('btn--circle btn--primary btn--right'), 'save-call-feature', 'remove');
      this.applyElement(this.$window.document.getElementsByClassName('helptext-btn--right'), 'active', 'remove');
    }, CallParkCtrl.PAGE_TRANSITION_TIMEOUT);
  }

  public applyElement(element: HTMLCollectionOf<Element>, appliedClass, method): boolean | undefined {
    const domElement: Element = _.get<Element>(element, '[0]');
    if (domElement) {
      switch (method) {
        case 'add':
          domElement.classList.add(appliedClass);
          break;
        case 'remove':
          domElement.classList.remove(appliedClass);
          break;
        case 'default':
          return true;
      }
    }
  }

  public createHelpText(): string {
    return this.$translate.instant('callPark.createHelpText');
  }

  public showLocation() {
    return this.hasLocation && this.customerLocations.length > 1;
  }

  private checkForChanges(): void {
    if (this.CallParkService.matchesOriginalConfig(this.callPark)) {
      this.resetForm();
    }
  }

  private resetForm(): void {
    this.form.$setPristine();
    this.form.$setUntouched();
  }

}

export class CallParkComponent implements ng.IComponentOptions {
  public controller = CallParkCtrl;
  public template = require('modules/call/features/call-park/call-park.component.html');
  public bindings = {};
}
