class EditSummaryAutoAssignTemplateModalController implements ng.IComponentController {

  /* @ngInject */
  constructor(
    private $state: ng.ui.IStateService,
  ) {}

  public back(): void {
    this.$state.go('users.manage.edit-auto-assign-template-modal', {
      stateData: _.get(this.$state, 'params.stateData'),
    });
  }

  public save(): void {
    alert('TODO: post to API endpoint');
    this.$state.go('users.list');
  }
}

export class EditSummaryAutoAssignTemplateModalComponent implements ng.IComponentOptions {
  public controller = EditSummaryAutoAssignTemplateModalController;
  public template = require('./edit-summary-auto-assign-template-modal.html');
  public bindings = {};
}
