import { CtBaseController } from './ctBase.controller';
import { ProactivePrompt, MediaTypes } from './factory/ctCustomerSupportClasses';
import { TemplateWizardService } from './services/TemplateWizard.service';
import { CTService } from './services/CTService';

class CtProactivePromptController extends CtBaseController {

  public promptTime: any; // TODO: define correct type
  public promptTimeOptions: any[];
  private selectedMediaTypeLocal: string;

  /* @ngInject*/
  constructor(
    public $stateParams: ng.ui.IStateParamsService,
    public $translate: ng.translate.ITranslateService,
    public TemplateWizardService: TemplateWizardService,
    public Authinfo,
    public CTService: CTService,
  ) {
    super($stateParams, TemplateWizardService, CTService, $translate);
    this.promptTime = this.CTService.getPromptTime({});
    this.promptTimeOptions = this.CTService.getPromptTimeOptions();
    this.selectedMediaTypeLocal = this.selectedMediaType();
  }

  public $onInit(): void {
    if (this.selectedMediaTypeLocal === MediaTypes.CHAT || this.selectedMediaTypeLocal === MediaTypes.CHAT_PLUS_CALLBACK) {
      if (this.TemplateWizardService.template.configuration.proactivePrompt === undefined) {
        this.TemplateWizardService.template.configuration.proactivePrompt =
          new ProactivePrompt(this.Authinfo, this.CTService, this.$translate);
      }
      this.promptTime = this.CTService.getPromptTime(
      this.TemplateWizardService.template.configuration.proactivePrompt.fields.promptTime);
    }
    this.isProactivePromptPageValid();
  }

  public isProactivePromptPageValid() {
    const isValidField = this.TemplateWizardService.isValidField;
    const isInputValid = this.TemplateWizardService.isInputValid;
    const proactivePrompt = this.TemplateWizardService.template.configuration.proactivePrompt;
    if (isValidField(proactivePrompt.fields.promptTitle.displayText, this.lengthValidationConstants.singleLineMaxCharLimit25) &&
        isValidField(proactivePrompt.fields.promptMessage.message, this.lengthValidationConstants.multiLineMaxCharLimit100) &&
        isInputValid(proactivePrompt.fields.promptTitle.displayText) &&
        isInputValid(proactivePrompt.fields.promptMessage.message)) {
      this.promptTime = this.CTService.getPromptTime(proactivePrompt.fields.promptTime);
      this.TemplateWizardService.pageValidationResult.isProactivePromptPageValid = true;
    } else {
      this.TemplateWizardService.pageValidationResult.isProactivePromptPageValid = false;
    }
  }
}


export class CtProactivePromptComponent implements ng.IComponentOptions {
  public controller = CtProactivePromptController;
  public template = require('./wizardPagesComponent/ctProactivePrompt.tpl.html');
}

export default angular
  .module('Sunlight')
  .component('ctProactivePromptComponent', new CtProactivePromptComponent())
  .name;
