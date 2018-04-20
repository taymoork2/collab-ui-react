export class CtBaseController implements ng.IComponentController {

  public isEditFeature;
  protected currentState;
  public lengthValidationConstants;

  protected template;
  /* @ngInject*/
  constructor(
    public $stateParams: ng.ui.IStateParamsService,
    public TemplateWizardService,
    public CTService,
    public $translate: ng.translate.ITranslateService,
  ) {
    this.isEditFeature = this.$stateParams.isEditFeature;
    this.currentState = this.TemplateWizardService.currentState;
    if (this.isEditFeature) {
      TemplateWizardService.template = this.$stateParams.template;
    }

    this.template = TemplateWizardService.template;
    this.lengthValidationConstants = this.CTService.getLengthValidationConstants();

  }

  public singleLineValidationMessage50;
  public multiLineValidationMessage;
  public multiLineValidationMessage100;
  public singleLineValidationMessage25;
  public $onInit() {
    this.singleLineValidationMessage25 = this.CTService.getValidationMessages(0, this.lengthValidationConstants.singleLineMaxCharLimit25);
    this.singleLineValidationMessage50 = this.CTService.getValidationMessages(0, this.lengthValidationConstants.singleLineMaxCharLimit50);
    this.multiLineValidationMessage = this.CTService.getValidationMessages(0, this.lengthValidationConstants.multiLineMaxCharLimit);
    this.multiLineValidationMessage100 = this.CTService.getValidationMessages(0, this.lengthValidationConstants.multiLineMaxCharLimit100);
  }
  public InvalidCharacters = /[<>]/i;


  public selectedMediaType(): string {
    return this.TemplateWizardService.selectedMediaType();
  }

  public getLocalisedText(name): string {
    const type = (this.TemplateWizardService.cardMode) ? this.TemplateWizardService.cardMode : this.selectedMediaType();
    return this.$translate.instant(name + '_' + type);
  }
}
