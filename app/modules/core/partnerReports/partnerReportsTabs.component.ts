import { FeatureToggleService } from 'modules/core/featureToggle';

class PartnerReportsTabs implements ng.IComponentController {
  public tabs;

  /* @ngInject */
  public constructor(
    private $q: ng.IQService,
    private $state: ng.ui.IStateService,
    private $translate: ng.translate.ITranslateService,
    private FeatureToggleService: FeatureToggleService,
  ) {}

  public $onInit(): void {
    this.tabs = [];

    this.$q.all({
      ccaRole: this.FeatureToggleService.supports(this.FeatureToggleService.features.ccaReports),
      sparkReports: this.FeatureToggleService.supports(this.FeatureToggleService.features.atlasPartnerSparkReports),
      webexReports: this.FeatureToggleService.supports(this.FeatureToggleService.features.atlasPartnerWebexReports),
    }).then((toggles) => {
      if (!toggles.sparkReports && !toggles.ccaRole && !toggles.webexReports) {
        this.$state.go('unauthorized');
      } else {
        if (toggles.sparkReports) {
          this.tabs.push({
            state: `partnerreports.tab.spark`,
            title: this.$translate.instant(`reportsPage.sparkReports`),
          });
        }

        if (toggles.ccaRole) {
          this.tabs.push({
            state: `partnerreports.tab.ccaReports.group({ name: 'usage' })`,
            title: this.$translate.instant(`reportsPage.ccaTab`),
          });
        }

        if (toggles.webexReports) {
          this.tabs.push({
            state: `partnerreports.tab.webexreports.metrics`,
            title: this.$translate.instant(`reportsPage.webexReports`),
          });
        }
      }
    });
  }
}

export class PartnerReportsTabsComponent implements ng.IComponentOptions {
  public controller = PartnerReportsTabs;
  public template = require('modules/core/partnerReports/partnerReportsTabs.html');
}
