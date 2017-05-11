import IWizardData = csdm.IWizardData;
export abstract class WizardCtrl implements ng.IComponentController {
  protected wizardData: IWizardData;
  public title: string;
  constructor(protected $q: ng.IQService, protected $stateParams: { wizard: any }) {
    this.wizardData = $stateParams.wizard.state().data;
    this.title = this.wizardData.title;
  }
  public $onInit?(): void;

  public abstract back(): void;
}
