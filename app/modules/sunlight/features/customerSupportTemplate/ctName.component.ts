import { CtBaseController } from './ctBase.controller';

class CtNameController extends CtBaseController {

  /* @ngInject*/
  constructor(
    public $stateParams: ng.ui.IStateParamsService,
    public TemplateWizardService,
    public CTService,
    public $translate: ng.translate.ITranslateService,
  ) {
    super($stateParams, TemplateWizardService, CTService, $translate);
  }

  public $onInit(): void {
    this.isValid();
  }

  private validateNameLength() {
    return this.TemplateWizardService.isValidField(this.template.name, this.lengthValidationConstants.empty) ||
      this.TemplateWizardService.isValidField(this.template.name, this.lengthValidationConstants.multiLineMaxCharLimit);
  }

  private isInputValid(input) {
    return this.TemplateWizardService.isInputValid(input);
  }

  public isValid() {
    this.TemplateWizardService.pageValidationResult.isNameValid =
      !this.isNameEmpty() &&
      this.validateNameLength() &&
      this.isInputValid(this.template.name);
    return this.TemplateWizardService.pageValidationResult.isNameValid;
  }

  public isNameEmpty() {
    return this.template.name.length === this.lengthValidationConstants.empty;
  }
}

export class CtNameComponent implements ng.IComponentOptions {
  public controller = CtNameController;
  public template = require('modules/sunlight/features/customerSupportTemplate/wizardPagesComponent/ctName.tpl.html');
}

export default angular
  .module('Sunlight')
  .component('ctNameComponent', new CtNameComponent())
  .name;
