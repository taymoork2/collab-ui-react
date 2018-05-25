class WebexReportsTabs implements ng.IComponentController {

  public tabs;

  /* @ngInject */
  public constructor(
    private FeatureToggleService,
  ) { }

  public $onInit(): void {
    this.tabs = [
      {
        state: `partnerreports.tab.webexreports.metrics`,
        title: `reportsPage.webexMetrics.metrics`,
      },
    ];
    this.FeatureToggleService.supports(this.FeatureToggleService.features.diagnosticF8193UX3)
      .then((isSupport: boolean) => {
        if (!isSupport) {
          this.tabs.push({
            state: `partnerreports.tab.webexreports.diagnostics`,
            title: `reportsPage.webexMetrics.diagnostics`,
          });
        }
      });
  }
}

export class WebexReportsTabsComponent implements ng.IComponentOptions {
  public controller = WebexReportsTabs;
  public template = require('./webexReportsTabs.tpl.html');
}
