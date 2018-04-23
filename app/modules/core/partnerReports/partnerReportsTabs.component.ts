import { FeatureToggleService } from 'modules/core/featureToggle';

class PartnerReportsTabs implements ng.IComponentController {

  public tabs;

  /* @ngInject */
  public constructor(
    private $translate: ng.translate.ITranslateService,
    private FeatureToggleService: FeatureToggleService,
  ) {}

  public $onInit(): void {
    this.tabs = [];

    this.FeatureToggleService.supports(this.FeatureToggleService.features.ccaReports)
    .then((supported: boolean) => {
      if (supported === true) {
        this.tabs.push({
          state: `partnerreports.tab.ccaReports.group({ name: 'usage' })`,
          title: this.$translate.instant(`reportsPage.ccaTab`),
        });
      }
    });

    this.FeatureToggleService.supports(this.FeatureToggleService.features.atlasPartnerSparkReports)
    .then((isSparkEnabled: boolean): void => {
      if (isSparkEnabled) {
        this.tabs.unshift({
          state: `partnerreports.tab.spark`,
          title: this.$translate.instant(`reportsPage.sparkReports`),
        });
      } else {
        this.tabs.unshift({
          state: `partnerreports.tab.base`,
          title: this.$translate.instant(`reportsPage.sparkReports`),
        });
      }
    });

    this.FeatureToggleService.supports(this.FeatureToggleService.features.atlasPartnerWebexReports)
    .then((isPartnerWebexEnabled: boolean): void => {
      if (isPartnerWebexEnabled) {
        this.tabs.push({
          state: `partnerreports.tab.webexreports.metrics`,
          title: this.$translate.instant(`reportsPage.webexReports`),
        });
      }
    });
  }
}

export class PartnerReportsTabsComponent implements ng.IComponentOptions {
  public controller = PartnerReportsTabs;
  public template = require('modules/core/partnerReports/partnerReportsTabs.html');
}
