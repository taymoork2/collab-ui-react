class WebexReportsTabs implements ng.IComponentController {

  public tabs;

  /* @ngInject */
  public constructor(
  ) {}

  public $onInit(): void {
    this.tabs = [
      {
        state: `partnerreports.tab.webexreports.metrics`,
        title: `reportsPage.webexMetrics.metrics`,
      },
      {
        state: `partnerreports.tab.webexreports.diagnostics`,
        title: `reportsPage.webexMetrics.diagnostics`,
      },
    ];
  }
}

export class WebexReportsTabsComponent implements ng.IComponentOptions {
  public controller = WebexReportsTabs;
  public template = require('./webexReportsTabs.tpl.html');
}
