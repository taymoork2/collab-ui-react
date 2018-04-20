class HybridServicesSidepanelMessageCtrl implements ng.IComponentController {

  private translationKey: string;
  private translateReplacements;
  public severity: 'error' | 'warning' | 'info';
  public translation: string;

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
  ) { }

  public $onInit() {
    if (this.severity !== 'error' && this.severity !== 'warning' && this.severity !== 'info') {
      this.severity = 'error';
    }
    this.translation = this.$translate.instant(this.translationKey, this.translateReplacements);
  }

  public isError = () => this.severity === 'error';
  public isWarning = () => this.severity === 'warning';
  public isInfo = () => this.severity === 'info';

}

export class HybridServicesSidepanelMessageComponent implements ng.IComponentOptions {
  public controller = HybridServicesSidepanelMessageCtrl;
  public template = require('./hybrid-services-sidepanel-message.component.html');
  public bindings = {
    translationKey: '<',
    translateReplacements: '<',
    severity: '<',
  };
}
