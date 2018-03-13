import { CtBaseController } from './ctBase.controller';
//import TemplateWizardService from "./services/TemplateWizard.service";

class CtNameController extends CtBaseController {

  /* @ngInject*/
  constructor(
    public $stateParams: ng.ui.IStateParamsService,
    public TemplateWizardService,
    public CTService,
  ) {
    super($stateParams, TemplateWizardService, CTService);
  }

  public onInit() {
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
    this.TemplateWizardService.pageValidationResult.name =
      !this.isNameEmpty() &&
      this.validateNameLength() &&
      this.isInputValid(this.template.name);
    return this.TemplateWizardService.pageValidationResult.name;
  }

  public isNameEmpty() {
    return this.template.name.length === this.lengthValidationConstants.empty;
  }

}

export class CtNameComponent implements ng.IComponentOptions {
  public controller = CtNameController;
  public controllerAs = 'careSetupAssistant';
  public template = require('modules/sunlight/features/customerSupportTemplate/wizardPagesComponent/ctName.tpl.html');


}

export default angular
  .module('Sunlight')
  .component('ctNameComponent', new CtNameComponent())
  .name;
