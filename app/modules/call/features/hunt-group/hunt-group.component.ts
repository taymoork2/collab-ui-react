import { HuntGroup, HuntMethod, DestinationRule, HuntGroupNumber, HuntGroupService } from 'modules/call/features/hunt-group';
import { CallFeatureMember } from 'modules/call/features/shared/call-feature-members/call-feature-member';
import { FallbackDestination } from 'modules/call/features/shared/call-feature-fallback-destination';
import { Notification } from 'modules/core/notifications';
import { KeyCodes } from 'modules/core/accessibility';

const ALTERNATE_TIMER_MIN: number = 2;
const ALTERNATE_TIMER_MAX: number = 60;

class HuntGroupCtrl implements ng.IComponentController {
  private static readonly PAGE_TRANSITION_TIMEOUT: number = 10;

  // setup assistant specific data
  public pageIndex: number = 0;
  public animation: string = 'slide-left';

   // edit mode specific data
  public title: string;
  public huronFeaturesUrl: string = 'huronfeatures';
  public memberProperties: string[] = ['name', 'number'];

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
    private $translate: ng.translate.ITranslateService,
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

  public setHuntGroupNumbers(numbers: HuntGroupNumber[]): void {
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

  public setHuntGroupMembers(members: CallFeatureMember[]): void {
    this.huntGroup.members = members;
    this.form.$setDirty();
    this.checkForChanges();
  }

  public setHuntGroupSendToApp(): void {
    this.huntGroup.sendToApp = !this.huntGroup.sendToApp;
    this.form.$setDirty();
    this.checkForChanges();
  }

  public setHuntGroupDestinationRule(destinationRule: DestinationRule): void {
    this.huntGroup.destinationRule = destinationRule;
    this.form.$setValidity('', false, this.form);

    if (!_.isNull(this.huntGroup.alternateDestination.number) || !_.isNull(this.huntGroup.alternateDestination.numberUuid)) {
      this.form.$setValidity('', true, this.form);
    }

    if (this.huntGroup.destinationRule === DestinationRule.TYPEFALLBACKRULE_AUTOMATIC) {
      this.huntGroup.sendToApp = false;
    } else {
      this.huntGroup.sendToApp = true;
    }

    if (this.huntGroup.destinationRule === DestinationRule.TYPEFALLBACKRULE_FALLBACK_DESTINATION || !_.isNull(this.huntGroup.alternateDestination.number) ) {
      this.form.$setDirty();
      this.checkForChanges();
    }
  }

  public setHuntGroupFallbackDestination(fbDestination: FallbackDestination) {
    this.huntGroup.fallbackDestination = fbDestination;
    if (_.isNull(_.get(fbDestination, 'number') || _.isUndefined(_.get(fbDestination, 'number')))) {
      this.form.$setValidity('', false, this.form);
    }

    this.form.$setDirty();
    this.checkForChanges();
  }

  public setHuntGroupAlternateDestination(aDestination: FallbackDestination) {
    if ( aDestination.timer && !_.inRange( aDestination.timer, ALTERNATE_TIMER_MIN, ALTERNATE_TIMER_MAX + 1)) {
      this.form.$setValidity('', false, this.form);
    } else {
      this.huntGroup.alternateDestination = aDestination;
      this.form.$setValidity('', true, this.form);
      this.form.$setDirty();
      this.checkForChanges();
    }
  }

  public cancelModal(): void {
    this.$modal.open({
      template: require('modules/call/features/hunt-group/hunt-group-cancel-modal.html'),
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
      .then((huntGroup: HuntGroup) => {
        this.Notification.success('huronHuntGroup.successUpdate', { huntGroupName: this.huntGroup.name } );
        this.title = this.huntGroup.name || '';
        this.huntGroup = huntGroup;
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
      case KeyCodes.ESCAPE:
        this.cancelModal();
        break;
      case KeyCodes.RIGHT:
        if (this.nextButton(this.pageIndex) === true) {
          this.nextPage();
        }
        break;
      case KeyCodes.LEFT:
        if (this.previousButton(this.pageIndex) === true) {
          this.previousPage();
        }
        break;
      default:
        break;
    }
  }

  public enterNextPage($keyCode): boolean | undefined {
    if ($keyCode === KeyCodes.ENTER && this.nextButton(this.pageIndex) === true) {
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
    const buttonStates = {
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
        const fbDestination = _.get(this.huntGroup, 'fallbackDestination');
        if (!_.isUndefined(fbDestination) && !_.isNull(_.get(fbDestination, 'number')) ) {
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
          this.applyElement(this.$window.document.getElementsByClassName('btn--circle btn--primary btn--right'), 'save-call-feature', 'add');
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
      this.applyElement(this.$window.document.getElementsByClassName('btn--circle btn--primary btn--right'), 'save-call-feature', 'remove');
      this.applyElement(this.$window.document.getElementsByClassName('helptext-btn--right'), 'active', 'remove');
    }, HuntGroupCtrl.PAGE_TRANSITION_TIMEOUT);
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

  public createHelpText(): string {
    return this.$translate.instant('callPark.createHelpText');
  }

}

export class HuntGroupComponent implements ng.IComponentOptions {
  public controller = HuntGroupCtrl;
  public template = require('modules/call/features/hunt-group/hunt-group.component.html');
  public bindings = {};
}
