class EditAutoAssignTemplateModalController implements ng.IComponentController {

  private prevState: string;
  private dismiss: Function;

  /* @ngInject */
  constructor(
    private $state: ng.ui.IStateService,
    private $stateParams,
    private Analytics,
  ) {
    this.prevState = _.get<string>(this.$stateParams, 'prevState', 'users.manage.picker');
  }

  public dismissModal(): void {
    this.Analytics.trackAddUsers(this.Analytics.eventNames.CANCEL_MODAL);
    this.dismiss();
  }

  public back(): void {
    this.$state.go(this.prevState);
  }

  public next(): void {
    // TODO: pass appropriate subscription assignments data
    this.$state.go('users.manage.edit-summary-auto-assign-template-modal', {});
  }
}

export class EditAutoAssignTemplateModalComponent implements ng.IComponentOptions {
  public controller = EditAutoAssignTemplateModalController;
  public template = require('./edit-auto-assign-template-modal.html');
  public bindings = {
    dismiss: '&?',
  };
}
