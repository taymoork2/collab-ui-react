
class CtCancelModalController implements ng.IComponentController {

  /* @ngInject*/
  constructor(
    public $translate: ng.translate.ITranslateService,
    public $stateParams: ng.ui.IStateParamsService,
    public TemplateWizardService,
  ) {

  }
  private mediaType = this.TemplateWizardService.selectedMediaType();
  public featureType = this.$translate.instant('sunlightDetails.newFeatures.' + this.mediaType + 'Type');
  public cancelDialogKey = this.$stateParams.isEditFeature ? 'careChatTpl.cancelEditDialog' : 'careChatTpl.cancelCreateDialog';
  private c = console;
  public cancelHeader = this.$translate.instant('careChatTpl.cancelHeader');
  public cancelDialog = this.$translate.instant(this.cancelDialogKey, { featureName: this.featureType });
  public continueButton = this.$translate.instant('careChatTpl.continueButton');
  public confirmButton = this.$translate.instant('careChatTpl.confirmButton');

  public $onInit(): void {
    this.c.log(this.mediaType);
  }
}

export class CtCancelModalComponent implements ng.IComponentOptions {
  public controller = CtCancelModalController;
  public controllerAs = 'controller';
  public template = require('modules/sunlight/features/customerSupportTemplate/wizardPagesComponent/ctSunlightCancelModal.tpl.html');
  public bindings = {
    dismiss: '&',
  };

}

export default angular
  .module('Sunlight')
  .component('ctCancelModalComponent', new CtCancelModalComponent())
  .name;
