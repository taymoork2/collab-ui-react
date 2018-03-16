export class CtBaseController implements ng.IComponentController {

  protected c = console;
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

    this.template = TemplateWizardService.template;
    this.lengthValidationConstants = this.CTService.getLengthValidationConstants();

  }

  public $onInit() {
    this.c.log('Base Controller inited');
  }

  public selectedMediaType(): String {
    return this.TemplateWizardService.selectedMediaType();
  }

  public EmptyValidationFunction(): boolean {
    return true;
  }

  public getLocalisedText(name): string {
    return this.$translate.instant(name + '_' + this.TemplateWizardService.selectedMediaType());
  }

}

