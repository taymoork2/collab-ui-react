import { CtBaseController } from './ctBase.controller';
import { CTService } from './services/CTService';
import { TemplateWizardService } from './services/TemplateWizard.service';
import { DomainManagementService } from 'modules/core/domainManagement/domainmanagement.service';
import { SunlightConfigService } from 'modules/sunlight/services/sunlightConfigService';
import { Notification } from 'modules/core/notifications/notification.service';
class CtSummaryComponentController extends CtBaseController {

  private cardMode: string;
  public ChatTemplateButtonText: string;
  public creatingChatTemplate: boolean = false;
  public saveCTErrorOccurred: boolean = false;
  /* @ngInject*/
  constructor(
    public $state: ng.ui.IStateService,
    public $stateParams: ng.ui.IStateParamsService,
    public $translate: ng.translate.ITranslateService,
    public CTService: CTService,
    public DomainManagementService: DomainManagementService,
    public LogMetricsService: any,
    public Notification: Notification,
    public SunlightConfigService: SunlightConfigService,
    public TemplateWizardService: TemplateWizardService,
  ) {
    super($stateParams, TemplateWizardService, CTService, $translate);
    this.TemplateWizardService.setCardMode(this.cardMode);
  }

  public $onInit(): void {
    super.$onInit();
    this.ChatTemplateButtonText = this.$translate.instant('common.finish');
  }

  public submitChatTemplate() {
    this.DomainManagementService.syncDomainsWithCare();
    this.creatingChatTemplate = true;
    if (this.$stateParams.isEditFeature) {
      this.editChatTemplate(this.template);
    } else {
      this.createChatTemplate(this.template);
    }
  }

  public createChatTemplate(template) {
    this.SunlightConfigService.createChatTemplate(template)
      .then((response) => {
        this.handleChatTemplateCreation(response, template);
        this.LogMetricsService.logMetrics('Created template for Care', this.LogMetricsService.getEventType('careTemplateFinish'), this.LogMetricsService.getEventAction('buttonClick'), 200, moment(), 1, null);
      }).catch((error) => {
        this.handleChatTemplateError();
        this.Notification.errorWithTrackingId(error, this.getLocalisedText('careChatTpl.createTemplateFailureText'));
      });
  }

  public handleChatTemplateError() {
    this.saveCTErrorOccurred = true;
    this.creatingChatTemplate = false;
    this.ChatTemplateButtonText = this.$translate.instant('common.retry');
  }

  public handleChatTemplateCreation(response, template) {
    this.creatingChatTemplate = false;
    const responseTemplateId = response.headers('Location').split('/').pop();
    this.$state.go('care.Features');
    const successMsg = 'careChatTpl.createSuccessText';
    this.Notification.success(successMsg, {
      featureName: template.name,
    });
    this.CTService.openEmbedCodeModalNew(responseTemplateId, template.name);
  }

  public editChatTemplate(template) {
    this.SunlightConfigService.editChatTemplate(template, template.templateId)
      .then(() => {
        this.handleChatTemplateEdit(template);
        this.LogMetricsService.logMetrics('Edited template for Care', this.LogMetricsService.getEventType('careTemplateFinish'), this.LogMetricsService.getEventAction('buttonClick'), 200, moment(), 1, null);
      })
      .catch((response) => {
        this.handleChatTemplateError();
        this.Notification.errorWithTrackingId(response, this.getLocalisedText('careChatTpl.editTemplateFailureText'));
      });
  }

  public handleChatTemplateEdit(template) {
    this.creatingChatTemplate = false;
    this.$state.go('care.Features');
    const successMsg = 'careChatTpl.editSuccessText';
    this.Notification.success(successMsg, {
      featureName: template.name,
    });
    this.CTService.openEmbedCodeModalNew(template.templateId, template.name);
  }
}

export class CtSummaryComponent implements ng.IComponentOptions {
  public controller = CtSummaryComponentController;
  public template = require('./wizardPagesComponent/ct-summary.tpl.html');
  public bindings = {
    cardMode: '@',
  };

}

export default angular
  .module('Sunlight')
  .component('ctSummaryComponent', new CtSummaryComponent())
  .name;
