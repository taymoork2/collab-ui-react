class AutoAssignTemplateManageOptionsController implements ng.IComponentController {

  private readonly DEFAULT_AUTO_ASSIGN_TEMPLATE = 'Default';
  private autoAssignTemplates: any;  // TODO: better type
  private onDelete: Function;

  /* @ngInject */
  constructor(
    private $translate,
    private AutoAssignTemplateService,
    private ModalService,
    private Notification,
  ) {}

  public deleteAutoAssignTemplate() {
    return this.ModalService.open({
      title: this.$translate.instant('userManage.org.deleteAutoAssignModal.title'),
      message: this.$translate.instant('userManage.org.deleteAutoAssignModal.description'),
      close: this.$translate.instant('common.delete'),
      dismiss: this.$translate.instant('common.cancel'),
      btnType: 'alert',
    }).result.then(() => {
      const templateId = _.get(this.autoAssignTemplates, `${this.DEFAULT_AUTO_ASSIGN_TEMPLATE}.templateId`);
      return this.AutoAssignTemplateService.deleteTemplate(templateId)
        .then(() => {
          this.Notification.success('userManage.org.deleteAutoAssignModal.deleteSuccess');
          this.onDelete();
        })
        .catch((response) => {
          this.Notification.errorResponse(response, 'userManage.org.deleteAutoAssignModal.deleteError');
        });
    });
  }
}

export class AutoAssignTemplateManageOptionsComponent implements ng.IComponentOptions {
  public controller = AutoAssignTemplateManageOptionsController;
  public template = require('./auto-assign-template-manage-options.html');
  public bindings = {
    autoAssignTemplates: '<',
    onDelete: '&?',
  };
}
