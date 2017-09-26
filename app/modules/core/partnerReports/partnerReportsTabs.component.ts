
class PartnerReportsTabs implements ng.IComponentController {

  public tabs;

  /* @ngInject */
  public constructor(
    private $translate: ng.translate.ITranslateService,
  ) {}

  public $onInit(): void {
    this.tabs = [
      {
        state: `partnerreports.tab.base`,
        title: this.$translate.instant(`reportsPage.sparkReports`),
      },
      {
        state: `partnerreports.tab.ccaReports.group({ name: 'usage' })`,
        title: this.$translate.instant(`reportsPage.ccaTab`),
      },
    ];
  }
}

export class PartnerReportsTabsComponent implements ng.IComponentOptions {
  public controller = PartnerReportsTabs;
  public template = require('modules/core/partnerReports/partnerReportsTabs.html');
}
