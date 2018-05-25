import { FeatureToggleService } from 'modules/core/featureToggle';

export class ReportsRedirectController {
  /* @ngInject */
  public constructor(
    private $q: ng.IQService,
    private $state: ng.ui.IStateService,
    private FeatureToggleService: FeatureToggleService,
  ) {}

  public $onInit() {
    // Should only land on a reports page if the toggle for that page is present
    // redirect to unauthorized otherwise
    this.$q.all({
      ccaRole: this.FeatureToggleService.supports(this.FeatureToggleService.features.ccaReports),
      sparkReports: this.FeatureToggleService.supports(this.FeatureToggleService.features.atlasPartnerSparkReports),
      webexReports: this.FeatureToggleService.supports(this.FeatureToggleService.features.atlasPartnerWebexReports),
    }).then((toggles) => {
      if (toggles.sparkReports) {
        this.$state.go('partnerreports.tab.spark');
      } else if (toggles.ccaRole) {
        this.$state.go('partnerreports.tab.ccaReports.group');
      } else if (toggles.webexReports) {
        this.$state.go('partnerreports.tab.webexreports.metrics');
      } else {
        this.$state.go('unauthorized');
      }
    });
  }
}
