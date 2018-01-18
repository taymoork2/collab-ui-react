class AutoAssignTemplateManageOptionsController implements ng.IComponentController {

  private readonly DEFAULT_AUTO_ASSIGN_TEMPLATE = 'Default';
  private autoAssignTemplates: any;  // TODO: better type
  private onDelete: Function;
  private onActivateToggle: Function;
  private stateData: any;

  /* @ngInject */
  constructor(
    private $state: ng.ui.IStateService,
    private $translate,
    private AutoAssignTemplateService,
    private ModalService,
    private Notification,
  ) {}

  public $onInit(): void {
    this.stateData = {};

    this.AutoAssignTemplateService.getSortedSubscriptions().then((sortedSubscriptions) => {
      _.set(this.stateData, 'subscriptions', sortedSubscriptions);
    });
  }

  public modifyAutoAssignTemplate() {
    this.AutoAssignTemplateService.getDefaultTemplate()
      .then((defaultTemplate) => {
        const convertedStateData = this.AutoAssignTemplateService.templateToStateData(defaultTemplate);
        _.merge(this.stateData, convertedStateData);
        this.$state.go('users.manage.edit-auto-assign-template-modal', {
          prevState: 'users.manage.picker',
          stateData: this.stateData,
        });
      })
      .catch((response) => {
        this.Notification.errorResponse(response, 'userManage.org.modifyAutoAssign.modifyError');
      });
  }

  public activateAutoAssignTemplate() {
    this.AutoAssignTemplateService.activateTemplate()
      .then(() => {
        this.Notification.success('userManage.org.activateAutoAssign.activateSuccess');
        this.onActivateToggle({ isActivated: true });
      })
      .catch((response) => {
        this.Notification.errorResponse(response, 'userManage.org.activate.activateError');
      });
  }

  public deactivateAutoAssignTemplate() {
    return this.ModalService.open({
      title: this.$translate.instant('userManage.org.moreOptions.deactivateAutoAssign'),
      message: this.$translate.instant('userManage.org.deactivateAutoAssign.description'),
      close: this.$translate.instant('common.deactivate'),
      dismiss: this.$translate.instant('common.cancel'),
      btnType: 'alert',
    }).result.then(() => {
      return this.AutoAssignTemplateService.deactivateTemplate()
      .then(() => {
        this.Notification.success('userManage.org.deactivateAutoAssign.deactivateSuccess');
        this.onActivateToggle({ isActivated: false });
      })
      .catch((response) => {
        this.Notification.errorResponse(response, 'userManage.org.deactivate.deactivateError');
      });
    });
  }

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
    isTemplateActive: '<',
    onDelete: '&',
    onActivateToggle: '&',
  };
}
