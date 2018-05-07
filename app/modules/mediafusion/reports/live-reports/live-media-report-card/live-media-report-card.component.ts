import { CardUtils } from 'modules/core/cards';
//import { ClusterInServiceGraphService } from 'modules/mediafusion/reports/live-reports/live-media-report-card';


class LiveMediaReportsCtrl implements ng.IComponentController {

  /* @ngInject */
  constructor(
    private CardUtils: CardUtils,
    public ClusterInServiceGraphService,
  ) { }
  public refreshReportCards() {
    this.CardUtils.resize();
    this.test();
  }
  public test() {
    this.ClusterInServiceGraphService.resize();
  }
}

export class LiveMediaReportCard implements ng.IComponentOptions {
  public template = require('modules/mediafusion/reports/live-reports/live-media-report-card/live-media-report-card.html');
  public controller = LiveMediaReportsCtrl;
  public bindings = < { [binding: string]: string } > {
    parentcntrl: '=',
    headername: '=',
    value: '<',
    tooltipOptions: '<',
    footerOptions: '<',
    chartOptions: '<',
    cardClass: '=',
    cardDesc: '=',
    isorg: '<',
    tooltipValue: '=',
    dropdownPresent: '=',
    t: '&?',
  };
}
angular.module('Mediafusion').component('ucLiveMediaReportCard', new LiveMediaReportCard());
//angular.module('Mediafusion').service('ClusterInServiceGraphService', ClusterInServiceGraphService;
