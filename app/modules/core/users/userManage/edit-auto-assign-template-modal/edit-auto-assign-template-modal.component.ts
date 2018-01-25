import { ISubscription } from 'modules/core/users/userAdd/assignable-services/shared';
import { AutoAssignTemplateService } from 'modules/core/users/shared/auto-assign-template';

class EditAutoAssignTemplateModalController implements ng.IComponentController {

  private prevState: string;
  private dismiss: Function;
  private stateData: any;  // TODO: better type
  private isEditTemplateMode = false;
  public sortedSubscriptions: ISubscription[];

  /* @ngInject */
  constructor(
    private $state: ng.ui.IStateService,
    private Analytics,
    private AutoAssignTemplateService: AutoAssignTemplateService,
  ) {}

  public $onInit(): void {
    this.prevState = _.get<string>(this.$state, 'params.prevState', 'users.manage.picker');

    // restore state if provided
    if (this.stateData) {
      this.sortedSubscriptions = _.get(this.stateData, 'subscriptions');
      this.isEditTemplateMode = true;
      return;
    }

    // otherwise use default initialization
    this.stateData = {};
    this.AutoAssignTemplateService.getSortedSubscriptions()
      .then(sortedSubscriptions => {
        this.sortedSubscriptions = sortedSubscriptions;
        this.stateData.subscriptions = sortedSubscriptions;
      });
  }

  public dismissModal(): void {
    this.Analytics.trackAddUsers(this.Analytics.eventNames.CANCEL_MODAL);
    this.dismiss();
  }

  public back(): void {
    this.$state.go(this.prevState);
  }

  public next(): void {
    this.$state.go('users.manage.edit-summary-auto-assign-template-modal', {
      stateData: this.stateData,
      isEditTemplateMode: this.isEditTemplateMode,
    });
  }

  public recvUpdate($event): void {
    const itemId = _.get($event, 'itemId');
    const itemCategory = _.get($event, 'itemCategory');
    const item = _.get($event, 'item');
    if (!itemId || !itemCategory || !item) {
      return;
    }
    // notes:
    // - item id can potentially contain period chars ('.')
    // - so we wrap interpolated value in double-quotes to prevent unintended deep property creation
    _.set(this.stateData, `${itemCategory}["${itemId}"]`, item);
  }

  // TODO: remove this callback once 'hybrid-services-entitlements-panel' can leverage 'onUpdate()' callbacks
  public recvHybridServicesEntitlementsPayload(entitlements): void {
    _.set(this.stateData, `USER_ENTITLEMENTS_PAYLOAD`, entitlements);
  }
}

export class EditAutoAssignTemplateModalComponent implements ng.IComponentOptions {
  public controller = EditAutoAssignTemplateModalController;
  public template = require('./edit-auto-assign-template-modal.html');
  public bindings = {
    prevState: '<',
    isEditTemplateMode: '<',
    stateData: '<',
    dismiss: '&?',
  };
}
