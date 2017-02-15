import { ISMPData } from './sharedMeetingsReport.interfaces';
import { CommonGraphService } from '../../../partnerReports/commonReportServices/commonGraph.service';

export class SharedMeetingsReportService {
  private readonly CHART_DIV: string = 'sharedMeetingsChart';

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private $http: ng.IHttpService,
    private CommonGraphService: CommonGraphService,
    private UrlConfig,
    private chartColors,
  ) {}

  public getMaxConcurrentMeetingsData(siteName: string, endMonth: string, startMonth: string): ng.IHttpPromise<any> {
    return this.$http.post(this.UrlConfig.getWebexMaxConcurrentMeetings(siteName), {
      StartMonth: startMonth,
      EndMonth: endMonth,
    });
  }

  public setChartData(data: Array<ISMPData>, chart: any): any {
    if (chart) {
      chart.categoryAxis.gridColor = this.chartColors.grayLightTwo;
      if (!data[0].balloon) {
        chart.categoryAxis.gridColor = this.chartColors.grayLightThree;
      }

      chart.dataProvider = data;
      chart.graphs = this.createGraphs(data);
      chart.validateData();
    } else {
      chart = this.createChart(data);
    }
    return chart;
  }

  private createChart(data: Array<ISMPData>): any {
    let catAxis: any = this.CommonGraphService.getBaseVariable(this.CommonGraphService.LINE_AXIS);
    catAxis.showFirstLabel = false;
    let valueAxes: any = [this.CommonGraphService.getBaseVariable(this.CommonGraphService.AXIS)];
    valueAxes[0].integersOnly = true;

    let chartCursor: any = this.CommonGraphService.getBaseVariable(this.CommonGraphService.CURSOR);
    chartCursor.valueLineAlpha = 1;
    chartCursor.valueLineEnabled = true;
    chartCursor.valueLineBalloonEnabled = true;
    chartCursor.cursorColor = this.chartColors.grayLightTwo;

    if (!data[0].balloon) {
      catAxis.gridColor = this.chartColors.grayLightThree;
    }

    let chartData: any = this.CommonGraphService.getBaseSerialGraph(data, 0, valueAxes, this.createGraphs(data), this.CommonGraphService.DATE, catAxis);
    chartData.numberFormatter = this.CommonGraphService.getBaseVariable(this.CommonGraphService.NUMFORMAT);
    chartData.legend = this.CommonGraphService.getBaseVariable(this.CommonGraphService.LEGEND);
    chartData.legend.fontSize = 12;
    chartData.legend.maxColumns = 1;
    chartData.chartCursor = chartCursor;
    chartData.autoMargins = true;

    return AmCharts.makeChart(this.CHART_DIV, chartData);
  }

  private createGraphs(data: Array<ISMPData>): Array<any> {
    let colors: Array<string> = [this.chartColors.primaryBase, this.chartColors.negativeBase];
    if (!data[0].balloon) {
      colors = [this.chartColors.grayLightThree, this.chartColors.grayLightOne];
    }

    let graphs: Array<any> = [];
    graphs.push(this.CommonGraphService.getBaseVariable(this.CommonGraphService.LINE));
    graphs[0].title = this.$translate.instant('smpReports.concurrentMeetingsTitle');
    graphs[0].fillColors = colors[0];
    graphs[0].lineColor = colors[0];
    graphs[0].valueField = 'meetings';
    graphs[0].clustered = false;
    graphs[0].showBalloon = data[0].balloon;
    graphs[0].balloonText = '<span class="graph-text">' + this.$translate.instant('smpReports.concurrentMeetings') + '</span><span class="graph-meetings">[[meetings]]</span>';

    graphs.push(this.CommonGraphService.getBaseVariable(this.CommonGraphService.SINGLE_LINE));
    graphs[1].title = this.$translate.instant('smpReports.maxMeetingsTitle');
    graphs[1].bullet = 'none';
    graphs[1].lineColor = colors[1];
    graphs[1].valueField = 'maxMeetings';
    graphs[1].showBalloon = false;
    graphs[1].markerType = 'line';

    return graphs;
  }
}

angular.module('Core')
  .service('SharedMeetingsReportService', SharedMeetingsReportService);
