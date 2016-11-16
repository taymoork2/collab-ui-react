import { CallParkService, CallPark, ICallParkRangeItem, CallParkMember, FallbackDestination } from 'modules/huron/features/callPark/services';
import { HuronSiteService } from 'modules/huron/sites';
import { Notification } from 'modules/core/notifications';

class CallParkCtrl implements ng.IComponentController {
  private static readonly DEFAULT_EXTENSION_LENGTH: string  = '4';
  private static readonly PAGE_TRANSITION_TIMEOUT: number = 10;

  // setup assistant specific data
  public pageIndex: number = 0;
  public animation: string = 'slide-left';

  // edit mode specific data
  public title: string;
  public huronFeaturesUrl: string = 'huronfeatures';

  // common data
  public form: ng.IFormController;
  public callParkId: string;
  public callPark: CallPark;
  public range: ICallParkRangeItem;
  public selectedMembers: Array<string> = [];
  public extensionLength: string = CallParkCtrl.DEFAULT_EXTENSION_LENGTH;
  public isLoading: boolean = false;
  public saveInProcess: boolean = false;

  /* @ngInject */
  constructor(
    private $modal,
    private $state: ng.ui.IStateService,
    private $stateParams,
    private $timeout: ng.ITimeoutService,
    private $window: ng.IWindowService,
    private CallParkService: CallParkService,
    private HuronSiteService: HuronSiteService,
    private Notification: Notification,
    private $translate: ng.translate.ITranslateService,
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
      this.HuronSiteService.getSite(sites[0].uuid).then(site => {
        this.extensionLength = site.extensionLength;
      });
    });
  }

  public setCallParkName(name: string): void {
    this.callPark.name = name;
    this.checkForChanges();
  }

  public setCallParkRange(range: ICallParkRangeItem): void {
    this.range = range;
    this.callPark.startRange = range.startRange;
    this.callPark.endRange = range.endRange;
    this.form.$setDirty();
    this.checkForChanges();
  }

  public setCallParkMembers(members: Array<CallParkMember>): void {
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

  public onCallParkFallbackDestinationMemberRemoved() {
    this.form.$setDirty();
  }

  public cancelModal(): void {
    this.$modal.open({
      templateUrl: 'modules/huron/features/callPark/callParkCancelModal.html',
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
    });
  }

  public evalKeyPress($keyCode): void {
    switch ($keyCode) {
      case 27:
      //escape key
        this.cancelModal();
        break;
      case 39:
      //right arrow
        if (this.nextButton(this.pageIndex) === true) {
          this.nextPage();
        }
        break;
      case 37:
      //left arrow
        if (this.previousButton(this.pageIndex) === true) {
          this.previousPage();
        }
        break;
      default:
        break;
    }
  }

  public enterNextPage($keyCode): boolean | undefined {
    if ($keyCode === 13 && this.nextButton(this.pageIndex) === true) {
      switch (this.pageIndex) {
        case 0 :
          if (!_.isUndefined(_.get(this.callPark, 'name'))) {
            this.nextPage();
          }
          break;
        case 1 :
          if (this.form.$valid) {
            this.nextPage();
          }
          break;
        default : return false;
      }
    }
  }

  public nextButton($index): boolean {
    let buttonStates = {
      0: () => {
        return !_.isUndefined(_.get(this.callPark, 'name'));
      },
      1: () => {
        return this.form.$valid;
      },
      2: () => {
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
      if (this.pageIndex === 2) {
        this.createCallPark();
      } else {
        this.pageIndex++;
        if (this.pageIndex === 2) {
          this.applyElement(this.$window.document.getElementsByClassName('btn--circle btn--primary btn--right'), 'saveCallPark', 'add');
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
      this.applyElement(this.$window.document.getElementsByClassName('btn--circle btn--primary btn--right'), 'saveCallPark', 'remove');
      this.applyElement(this.$window.document.getElementsByClassName('helptext-btn--right'), 'active', 'remove');
    }, CallParkCtrl.PAGE_TRANSITION_TIMEOUT);
  }

  public applyElement(element: HTMLCollectionOf<Element>, appliedClass, method): boolean | undefined {
    let domElement: Element = _.get<Element>(element, '[0]');
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
  public templateUrl = 'modules/huron/features/callPark/callPark.html';
  public bindings = {};
}
