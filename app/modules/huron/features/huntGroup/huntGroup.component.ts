import { HuntGroup, HuntMethod, HuntGroupNumber, HuntGroupService } from 'modules/huron/features/huntGroup/services';
import { CallFeatureMember } from 'modules/huron/features/components/callFeatureMembers/callFeatureMember';
import { FallbackDestination } from 'modules/huron/features/components/callFeatureFallbackDestination/services';
import { Notification } from 'modules/core/notifications';

class HuntGroupCtrl implements ng.IComponentController {
  private static readonly PAGE_TRANSITION_TIMEOUT: number = 10;

  // setup assistant specific data
  public pageIndex: number = 0;
  public animation: string = 'slide-left';

   // edit mode specific data
  public title: string;
  public huronFeaturesUrl: string = 'huronfeatures';
  public memberProperties: Array<string> = ['name', 'number'];

  //common data
  public form: ng.IFormController;
  public huntGroupId: string;
  public huntGroup: HuntGroup;
  public isLoading: boolean = false;
  public saveInProcess: boolean = false;
  public dragAndDropEnabled: boolean;

  /* @ngInject */
  constructor(
    private $modal,
    private $state: ng.ui.IStateService,
    private $stateParams,
    private $timeout: ng.ITimeoutService,
    private $window: ng.IWindowService,
    private HuntGroupService: HuntGroupService,
    private Notification: Notification,
  ) {
    this.huntGroupId = _.get<string>(this.$stateParams.feature, 'id');
    this.title = _.get<string>(this.$stateParams.feature, 'cardName');
  }

  public $onInit(): void {
    if (this.$state.current.name === 'huntgroupedit' && !this.huntGroupId) {
      this.$state.go(this.huronFeaturesUrl);
    }
    this.isLoading = true;
    this.HuntGroupService.getHuntGroup(this.huntGroupId).then( huntGroup => {
      this.huntGroup = huntGroup;
      this.dragAndDropEnabled = this.isDragAndDropEnabled();
      if (!this.huntGroup.uuid) {
        this.nextButton(this.pageIndex);
      }
    })
    .finally( () => this.isLoading = false);
  }

  public setHuntGroupName(name: string): void {
    this.huntGroup.name = name;
    this.checkForChanges();
  }

  public setHuntGroupNumbers(numbers: Array<HuntGroupNumber>): void {
    this.huntGroup.numbers = numbers;
    this.form.$setDirty();
    this.huntGroup.numbers.length > 0 ? this.form.$invalid = false : this.form.$invalid = true;
    this.checkForChanges();
  }

  public setHuntGroupMethod(method: HuntMethod): void {
    this.huntGroup.huntMethod = method;
    this.dragAndDropEnabled = this.isDragAndDropEnabled();
    this.form.$setDirty();
    this.checkForChanges();
  }

  public setMaxRingSecs(seconds: string): void {
    this.huntGroup.maxRingSecs = seconds;
    this.checkForChanges();
  }

  public setMaxWaitMins(minutes: string): void {
    this.huntGroup.maxWaitMins = minutes;
    this.checkForChanges();
  }

  public setHuntGroupFallbackDestination(fbDestination: FallbackDestination) {
    this.huntGroup.fallbackDestination = fbDestination;
    this.form.$setDirty();
    this.checkForChanges();
  }

  public setHuntGroupMembers(members: Array<CallFeatureMember>): void {
    this.huntGroup.members = members;
    this.form.$setDirty();
    this.checkForChanges();
  }

  public cancelModal(): void {
    this.$modal.open({
      templateUrl: 'modules/huron/features/huntGroup/huntGroupCancelModal.html',
      type: 'dialog',
    });
  }

  public onCancel(): void {
    this.huntGroup = this.HuntGroupService.getOriginalConfig();
    this.resetForm();
  }

  public isDragAndDropEnabled(): boolean {
    switch (this.huntGroup.huntMethod) {
      case HuntMethod.DA_BROADCAST:
      case HuntMethod.DA_LONGEST_IDLE_TIME:
        return false;
      case HuntMethod.DA_CIRCULAR:
      case HuntMethod.DA_TOP_DOWN:
        return true;
      default:
        return false;
    }
  }

  public createHuntGroup(): void {
    this.saveInProcess = true;
    this.HuntGroupService.createHuntGroup(this.huntGroup)
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
    this.HuntGroupService.updateHuntGroup(this.huntGroup.uuid || '', this.huntGroup)
    .then( () => {
      this.Notification.success('huronHuntGroup.successUpdate', { huntGroupName: this.huntGroup.name } );
      this.title = this.huntGroup.name || '';
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
          if (!_.isUndefined(_.get(this.huntGroup, 'name'))) {
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
        return !_.isUndefined(_.get(this.huntGroup, 'name'));
      },
      1: () => {
        return _.get(this.huntGroup, 'numbers', []).length !== 0;
      },
      2: () => {
        return !_.isUndefined(_.get(this.huntGroup, 'huntMethod'));
      },
      3: () => {
        return _.get(this.huntGroup, 'members', []).length !== 0;
      },
      4: () => {
        if (!_.isUndefined(_.get(this.huntGroup, 'fallbackDestination'))) {
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
      if (this.pageIndex === 4) {
        this.createHuntGroup();
      } else {
        this.pageIndex++;
        if (this.pageIndex === 4) {
          this.applyElement(this.$window.document.getElementsByClassName('btn--circle btn--primary btn--right'), 'saveHuntGroup', 'add');
          this.applyElement(this.$window.document.getElementsByClassName('helptext-btn--right'), 'active', 'add');
        }
      }
    }, HuntGroupCtrl.PAGE_TRANSITION_TIMEOUT);
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
      this.applyElement(this.$window.document.getElementsByClassName('btn--circle btn--primary btn--right'), 'saveHuntGroup', 'remove');
      this.applyElement(this.$window.document.getElementsByClassName('helptext-btn--right'), 'active', 'remove');
    }, HuntGroupCtrl.PAGE_TRANSITION_TIMEOUT);
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

  private checkForChanges(): void {
    if (this.HuntGroupService.matchesOriginalConfig(this.huntGroup)) {
      this.resetForm();
    }
  }

  private resetForm(): void {
    this.dragAndDropEnabled = this.isDragAndDropEnabled();
    this.form.$setPristine();
    this.form.$setUntouched();
  }

}

export class HuntGroupComponent implements ng.IComponentOptions {
  public controller = HuntGroupCtrl;
  public templateUrl = 'modules/huron/features/huntGroup/huntGroup.html';
  public bindings = {};
}
