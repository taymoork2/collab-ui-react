import { IAutoAssignTemplateRequestPayload } from 'modules/core/users/shared';

class EditSummaryAutoAssignTemplateModalController implements ng.IComponentController {
  private dismiss: Function;
  private stateData: any;  // TODO: better type
  public saveLoading = false;

  /* @ngInject */
  constructor(
    private $state: ng.ui.IStateService,
    private Notification,
    private Analytics,
    private AutoAssignTemplateService,
  ) {}

  public dismissModal(): void {
    this.Analytics.trackAddUsers(this.Analytics.eventNames.CANCEL_MODAL);
    this.dismiss();
  }

  public back(): void {
    this.$state.go('users.manage.edit-auto-assign-template-modal', {
      stateData: this.stateData,
    });
  }

  public save(): void {
    this.saveLoading = true;
    const payload: IAutoAssignTemplateRequestPayload = this.AutoAssignTemplateService.stateDataToPayload(this.stateData);
    this.AutoAssignTemplateService.saveTemplate(payload)
      .then(() => {
        this.Notification.success('userManage.autoAssignTemplate.editSummary.saveSuccess');
        this.$state.go('users.list');
      })
      .catch((response) => {
        this.Notification.errorResponse(response, 'userManage.autoAssignTemplate.editSummary.saveError');
      })
      .finally(() => {
        this.saveLoading = false;
      });
  }
}

export class EditSummaryAutoAssignTemplateModalComponent implements ng.IComponentOptions {
  public controller = EditSummaryAutoAssignTemplateModalController;
  public template = require('./edit-summary-auto-assign-template-modal.html');
  public bindings = {
    dismiss: '&?',
    stateData: '<',
  };
}
