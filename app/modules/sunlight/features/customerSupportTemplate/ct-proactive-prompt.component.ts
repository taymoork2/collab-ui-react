import { CtBaseController } from './ctBase.controller';
import { MediaTypes } from './factory/ctCustomerSupportClasses';
import { TemplateWizardService } from './services/TemplateWizard.service';
import { CTService } from './services/CTService';

class CtProactivePromptController extends CtBaseController {

  public promptTimeObj: any; // TODO: define correct type
  public promptTimeOptions: any[];
  private selectedMediaTypeLocal: string;
  private cardMode: string;

  /* @ngInject*/
  constructor(
    public $stateParams: ng.ui.IStateParamsService,
    public $translate: ng.translate.ITranslateService,
    public TemplateWizardService: TemplateWizardService,
    public Authinfo,
    public CTService: CTService,
  ) {
    super($stateParams, TemplateWizardService, CTService, $translate);
    this.promptTimeOptions = this.CTService.getPromptTimeOptions();
    this.selectedMediaTypeLocal = this.selectedMediaType();
    this.TemplateWizardService.setCardMode(this.cardMode);
  }

  public $onInit(): void {
    if (this.selectedMediaTypeLocal === MediaTypes.CHAT || this.selectedMediaTypeLocal === MediaTypes.CHAT_PLUS_CALLBACK) {
      this.promptTimeObj = this.CTService.getPromptTime(this.template.configuration.proactivePrompt.fields.promptTime);
    }
    this.isProactivePromptPageValid();
  }

  public isProactivePromptPageValid() {
    const isValidField = this.TemplateWizardService.isValidField;
    const isInputValid = this.TemplateWizardService.isInputValid;
    const proactivePrompt = this.template.configuration.proactivePrompt;
    if (isValidField(proactivePrompt.fields.promptTitle.displayText, this.lengthValidationConstants.singleLineMaxCharLimit25) &&
        isValidField(proactivePrompt.fields.promptMessage.message, this.lengthValidationConstants.multiLineMaxCharLimit100) &&
        isInputValid(proactivePrompt.fields.promptTitle.displayText) &&
        isInputValid(proactivePrompt.fields.promptMessage.message)) {
      this.promptTimeObj = this.CTService.getPromptTime(proactivePrompt.fields.promptTime);
      this.TemplateWizardService.pageValidationResult.isProactivePromptPageValid = true;
    } else {
      this.TemplateWizardService.pageValidationResult.isProactivePromptPageValid = false;
    }

    if (this.promptTimeObj.value) {
      this.template.configuration.proactivePrompt.fields.promptTime = this.promptTimeObj.value;
    }
  }

  public onPromptTimeChange(): void {
    this.template.configuration.proactivePrompt.fields.promptTime = this.promptTimeObj.value;
    this.isProactivePromptPageValid();
  }
}


export class CtProactivePromptComponent implements ng.IComponentOptions {
  public controller = CtProactivePromptController;
  public template = require('./wizardPagesComponent/ctProactivePrompt.tpl.html');
  public bindings = {
    cardMode: '@',
  };
}

export default angular
  .module('Sunlight')
  .component('ctProactivePromptComponent', new CtProactivePromptComponent())
  .name;
