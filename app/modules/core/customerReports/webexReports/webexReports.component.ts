import './_webex-reports.scss';

class WebexReports implements ng.IComponentController {

  public tabs: Object[];
  /* @ngInject */
  public constructor(
    private $log: ng.ILogService,
  ) {
    this.$log.info('Hello, welcome to Taurus');
  }

  public $onInit() {
    // TODO, We Can set FeatureToggle for tabs, next time we will do -- zoncao@cisco.com
    this.tabs = [
      { title: 'webexReports.quality', state: 'reports.a' },
      { title: 'webexReports.audio', state: 'reports.b' },
      { title: 'common.search', state: 'reports.webex_.search' },
      { title: 'webexReports.classic', state: 'reports.d' },
    ];
  }
}

export class CustWebexReportsComponent implements ng.IComponentOptions {
  public controller = WebexReports;
  public templateUrl = 'modules/core/customerReports/webexReports/webexReports.html';
}
