import { IAutoAssignTemplateRequestPayload } from 'modules/core/users/shared/onboard/onboard.interfaces';
import { AutoAssignTemplateService, IAutoAssignTemplateData } from 'modules/core/users/shared/auto-assign-template';

class EditSummaryAutoAssignTemplateModalController implements ng.IComponentController {
  private dismiss: Function;
  private autoAssignTemplateData: IAutoAssignTemplateData;
  private isEditTemplateMode: boolean;
  private templateId: string;
  public saveLoading = false;

  /* @ngInject */
  constructor(
    private $state: ng.ui.IStateService,
    private Notification,
    private Analytics,
    private AutoAssignTemplateService: AutoAssignTemplateService,
  ) {}

  public $onInit(): void {
    this.templateId = '';

    this.AutoAssignTemplateService.getDefaultTemplate()
      .then((defaultTemplate) => {
        this.templateId = defaultTemplate.templateId;
      });
  }

  private updateTemplate(payload: IAutoAssignTemplateRequestPayload): void {
    this.AutoAssignTemplateService.updateTemplate(this.templateId, payload)
      .then(() => {
        this.Notification.success('userManage.org.modifyAutoAssign.modifySuccess');
        this.$state.go('users.list');
      })
      .catch((response) => {
        this.Notification.errorResponse(response, 'userManage.autoAssignTemplate.editSummary.saveError');
      })
      .finally(() => {
        this.saveLoading = false;
      });
  }

  private createTemplate(payload: IAutoAssignTemplateRequestPayload): void {
    this.AutoAssignTemplateService.createTemplate(payload)
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

  public dismissModal(): void {
    this.Analytics.trackAddUsers(this.Analytics.eventNames.CANCEL_MODAL);
    this.dismiss();
  }

  public back(): void {
    this.$state.go('users.manage.edit-auto-assign-template-modal', {
      autoAssignTemplateData: this.autoAssignTemplateData,
      isEditTemplateMode: this.isEditTemplateMode,
    });
  }

  public save(): void {
    this.saveLoading = true;
    const payload: IAutoAssignTemplateRequestPayload = this.AutoAssignTemplateService.autoAssignTemplateDataToPayload(this.autoAssignTemplateData);
    return this.isEditTemplateMode ? this.updateTemplate(payload) : this.createTemplate(payload);
  }
}

export class EditSummaryAutoAssignTemplateModalComponent implements ng.IComponentOptions {
  public controller = EditSummaryAutoAssignTemplateModalController;
  public template = require('./edit-summary-auto-assign-template-modal.html');
  public bindings = {
    dismiss: '&?',
    isEditTemplateMode: '<',
    autoAssignTemplateData: '<',
  };
}
