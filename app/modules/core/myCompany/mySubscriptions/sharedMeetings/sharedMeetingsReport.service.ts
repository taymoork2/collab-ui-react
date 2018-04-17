import { ISharedMeetingData, ISharedMeetingTimeFilter } from './sharedMeetingsReport.interfaces';
import { CommonGraphService } from '../../../partnerReports/commonReportServices/commonGraph.service';
import { IToolkitModalService, IToolkitModalServiceInstance } from 'modules/core/modal';
import { Notification } from '../../../notifications/notification.service';
import { ChartColors } from 'modules/core/config/chartColors';

interface IWindowService extends ng.IWindowService {
  webkitURL: any;
}

export class SharedMeetingsReportService {
  public readonly FILENAMES: string[] = ['shared_meeting.csv', 'concurrent_meetings.csv'];
  private readonly CHART_DIV: string = 'sharedMeetingsChart';
  private readonly ONE_MONTH: number = 1;
  private meetingModal: IToolkitModalServiceInstance |  undefined;
  private blob: any;

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private $http: ng.IHttpService,
    private $modal: IToolkitModalService,
    private $window: IWindowService,
    private CommonGraphService: CommonGraphService,
    private Notification: Notification,
    private UrlConfig,
  ) {}

  public openModal(siteUrl: string): void {
    if (siteUrl) {
      this.meetingModal = this.$modal.open({
        template: '<shared-meeting-report class="modal-content" site-url="' + siteUrl + '"></shared-meeting-report>',
        type: 'full',
      });
    } else {
      this.Notification.error('sharedMeetingReports.siteUrlError');
    }
  }

  public dismissModal(): void {
    if (this.meetingModal) {
      this.meetingModal.dismiss();
      this.meetingModal = undefined;
    }
  }

  public getMaxConcurrentMeetingsData(siteName: string, endMonth: string, startMonth: string): ng.IHttpPromise<any> {
    return this.$http.post(this.UrlConfig.getWebexMaxConcurrentMeetings(siteName), {
      StartMonth: startMonth,
      EndMonth: endMonth,
    });
  }

  public getDetailedReportData(siteName: string, endMonth: string, startMonth: string): ng.IHttpPromise<any> {
    return this.$http.post(this.UrlConfig.getWebexConcurrentMeetings(siteName), {
      StartMonth: startMonth,
      EndMonth: endMonth,
    });
  }

  public getDownloadCSV(csvString: string): string | undefined {
    this.blob = new this.$window.Blob([csvString], { type: 'text/plain' });

    // IE download option since IE won't download the created url
    if (_.get(this.$window, 'navigator.msSaveOrOpenBlob', false)) {
      return;
    } else {
      return (this.$window.URL || this.$window.webkitURL).createObjectURL(this.blob);
    }
  }

  public downloadInternetExplorer(): void {
    if (_.get(this.$window, 'navigator.msSaveOrOpenBlob', false)) {
      this.$window.navigator.msSaveOrOpenBlob(this.blob, this.FILENAMES[0]);
    }
  }

  public setChartData(data: ISharedMeetingData[], chart: any, filter: ISharedMeetingTimeFilter): any {
    if (chart) {
      chart.categoryAxis.showFirstLabel = true;
      chart.categoryAxis.gridColor = ChartColors.grayLightTwo;
      if (!_.isUndefined(filter) && filter.value === this.ONE_MONTH) {
        chart.categoryAxis.showFirstLabel = false;
      }
      if (!data[0].balloon) {
        chart.categoryAxis.gridColor = ChartColors.grayLightThree;
      }

      chart.dataProvider = data;
      chart.graphs = this.createGraphs(data);
      chart.validateData();
    } else {
      chart = this.createChart(data, filter);
    }
    return chart;
  }

  private createChart(data: ISharedMeetingData[], filter: ISharedMeetingTimeFilter): any {
    const catAxis: any = this.CommonGraphService.getBaseVariable(this.CommonGraphService.LINE_AXIS);
    if (!_.isUndefined(filter) && filter.value === this.ONE_MONTH) {
      catAxis.showFirstLabel = false;
    }
    if (!data[0].balloon) {
      catAxis.gridColor = ChartColors.grayLightThree;
    }

    const valueAxes: any = [this.CommonGraphService.getBaseVariable(this.CommonGraphService.AXIS)];
    valueAxes[0].integersOnly = true;

    const chartCursor: any = this.CommonGraphService.getBaseVariable(this.CommonGraphService.CURSOR);
    chartCursor.valueLineAlpha = 1;
    chartCursor.valueLineEnabled = true;
    chartCursor.valueLineBalloonEnabled = true;
    chartCursor.cursorColor = ChartColors.grayLightTwo;

    const chartData: any = this.CommonGraphService.getBaseSerialGraph(data, 0, valueAxes, this.createGraphs(data), this.CommonGraphService.DATE, catAxis);
    chartData.numberFormatter = this.CommonGraphService.getBaseVariable(this.CommonGraphService.NUMFORMAT);
    chartData.legend = this.CommonGraphService.getBaseVariable(this.CommonGraphService.LEGEND);
    chartData.legend.fontSize = 12;
    chartData.legend.maxColumns = 1;
    chartData.chartCursor = chartCursor;
    chartData.autoMargins = true;

    return AmCharts.makeChart(this.CHART_DIV, chartData);
  }

  private createGraphs(data: ISharedMeetingData[]): any[] {
    let colors: string[] = [ChartColors.primaryBase, ChartColors.negativeBase];
    if (!data[0].balloon) {
      colors = [ChartColors.grayLightThree, ChartColors.grayLightOne];
    }

    const graphs: any[] = [];
    graphs.push(this.CommonGraphService.getBaseVariable(this.CommonGraphService.LINE));
    graphs[0].title = this.$translate.instant('sharedMeetingReports.concurrentMeetingsTitle');
    graphs[0].fillColors = colors[0];
    graphs[0].lineColor = colors[0];
    graphs[0].valueField = 'meetings';
    graphs[0].clustered = false;
    graphs[0].showBalloon = data[0].balloon;
    graphs[0].balloonText = '<span class="graph-text">' + this.$translate.instant('sharedMeetingReports.concurrentMeetings') + '</span><span class="graph-meetings">[[meetings]]</span>';

    graphs.push(this.CommonGraphService.getBaseVariable(this.CommonGraphService.SINGLE_LINE));
    graphs[1].title = this.$translate.instant('sharedMeetingReports.maxMeetingsTitle');
    graphs[1].bullet = 'none';
    graphs[1].lineColor = colors[1];
    graphs[1].valueField = 'maxMeetings';
    graphs[1].showBalloon = false;
    graphs[1].markerType = 'line';

    return graphs;
  }
}
