import { IToolkitModalService } from 'modules/core/modal';

export class LiveMediaReportsController implements ng.IComponentController {

  public title = {
    title: 'mediaFusion.metrics.clusterAvailabilityCardHeading',
  };
  public clusterValue: undefined;
  public graphSize: string = 'maximum';
  public isorg: boolean = false;

   /* @ngInject */
  constructor(
    private $modal: IToolkitModalService,
    private ClusterInServiceGraphService,
  ) { }

  public openSetUpModal() {
    this.$modal.open({
      template: require('modules/mediafusion/reports/live-reports/live-media-report-card/cluster-in-service-graph-expand.html'),
      type: 'small',
      controller: LiveMediaReportsController,
      controllerAs: 'vm',
    }).opened.then(() => {
      this.ClusterInServiceGraphService.setClusterInService(this.clusterValue, this.graphSize);
    });
  }
}

export class LiveMediaReportCard implements ng.IComponentOptions {
  public controller = LiveMediaReportsController;
  public template = require('modules/mediafusion/reports/live-reports/live-media-report-card/live-media-report-card.html');
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
    clusterValue: '<',
  };

}
angular.module('Mediafusion').component('ucLiveMediaReportCard', new LiveMediaReportCard());
