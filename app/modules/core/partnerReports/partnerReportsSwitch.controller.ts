export class PartnerReportsSwitchCtrl implements ng.IComponentController {
  /* @ngInject */
  constructor(
    private $state: ng.ui.IStateService,
    private FeatureToggleService,
  ) {
  }
  public $onInit(): void {
    this.FeatureToggleService.atlasPartnerSparkReportsGetStatus().then((toggle: boolean): void => {
      this.switchView(toggle);
    });
  }

  public switchView(toggle: boolean): void {
    if (!toggle) {
      this.$state.go('partnerreports.base');
    } else {
      this.$state.go('partnerreports.spark');
    }
  }
}
