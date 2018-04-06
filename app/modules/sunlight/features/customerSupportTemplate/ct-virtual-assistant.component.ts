import { CtBaseController } from './ctBase.controller';
import { CVAConfig } from './factory/ctCustomerSupportClasses';
import { CTService } from './services/CTService';
import { TemplateWizardService } from './services/TemplateWizard.service';

class CtVirtualAssistantController extends CtBaseController {

  public isCareAssistantEnabled: boolean;
  public selectedVA: CVAConfig;
  public configuredVirtualAssistantServices: CVAConfig[];
  public hasConfiguredVirtualAssistantServices: boolean;
  public virtualAssistantSelectText = this.$translate.instant('careChatTpl.virtualAssistantSelectText');

  /* @ngInject*/
  constructor(
    public $stateParams: ng.ui.IStateParamsService,
    public $translate: ng.translate.ITranslateService,
    public CTService: CTService,
    public TemplateWizardService: TemplateWizardService,
  ) {
    super($stateParams, TemplateWizardService, CTService, $translate);
  }

  public $onInit(): void {
    super.$onInit();
    this.initializeCVA();
  }

  public initializeCVA(): void {
    this.hasConfiguredVirtualAssistantServices = !_.isEmpty(this.TemplateWizardService.configuredVirtualAssistantServices);
    this.configuredVirtualAssistantServices = this.TemplateWizardService.configuredVirtualAssistantServices as CVAConfig[];
    //if the virtual assistant list has only one VA available. use it by default.
    if (this.TemplateWizardService.configuredVirtualAssistantServices.length === 1 && !this.selectedMediaType()) {
      const data: CVAConfig = this.TemplateWizardService.configuredVirtualAssistantServices[0];
      this.selectedVA = data;
      this.vaSelectionCommit();
    } else if (this.selectedMediaType()) {
      this.TemplateWizardService.populateVirtualAssistantInfo();
      this.selectedVA = this.TemplateWizardService.selectedVA;
    }
    this.isVirtualAssistantValid();
  }

  public vaSelectionCommit = () => {
    this.template.configuration.virtualAssistant.config = this.selectedVA;
    this.template.configuration.virtualAssistant.enabled = true;
    this.isVirtualAssistantValid();
  }

  public isVirtualAssistantValid = () => {
    this.TemplateWizardService.pageValidationResult.isVirtualAssistantValid =
      (this.isValidField(this.template.configuration.virtualAssistant.welcomeMessage,
        this.lengthValidationConstants.multiLineMaxCharLimit) ? true : false) &&
      _.size(this.template.configuration.virtualAssistant.config.id) > 0;
  }

  private isValidField = (fieldDisplayText, maxCharLimit) => {
    return (fieldDisplayText.length <= maxCharLimit && fieldDisplayText.length !== 0);
  }
}

export class CtVirtualAssistantComponent implements ng.IComponentOptions {
  public controller = CtVirtualAssistantController;
  public template = require('./wizardPagesComponent/ctVirtualAssistant.tpl.html');
}

export default angular
  .module('Sunlight')
  .component('ctVirtualAssistantComponent', new CtVirtualAssistantComponent())
  .name;
