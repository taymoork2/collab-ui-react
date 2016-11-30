import {
  IActiveUserData,
  IDropdownBase,
} from '../../partnerReports/partnerReportInterfaces';

import {
  IAvgRoomData,
  IEndpointWrapper,
  IFilesShared,
  IMediaData,
  IMetricsData,
} from './sparkReportInterfaces';

export class SparkGraphService {
  // div variables
  private readonly activeUserDiv: string = 'activeUsersChart';
  private readonly avgRoomsdiv: string = 'avgRoomsChart';
  private readonly filesSharedDiv: string = 'filesSharedChart';
  private readonly mediaQualityDiv: string = 'mediaQualityChart';
  private readonly metricsGraphDiv: string = 'callMetricsChart';
  private readonly devicesDiv: string = 'devicesChart';

  // filter variables
  private activeUserFilter: IDropdownBase;

  // reusable html for creating AmBalloon text
  private static readonly graphTextSpan: string = '<span class="graph-text">';
  private static readonly boldNumberSpan: string = '<span class="bold-number">';

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private chartColors,
    private CommonGraphService,
    private ReportConstants,
  ) {}

  // Active User Line Graph
  public showHideActiveLineGraph(chart: any, filter: IDropdownBase): void {
    this.activeUserFilter = filter;
    if (filter.value === this.ReportConstants.ACTIVE_FILTER_ONE.value) {
      chart.showGraph(chart.graphs[0]);
    } else {
      chart.hideGraph(chart.graphs[0]);
    }
    chart.validateNow();
  }

  public setActiveLineGraph(data: Array<IActiveUserData>, chart: any): any {
    if (data.length > 0 && chart) {
      chart.chartCursor.valueLineEnabled = true;
      chart.categoryAxis.gridColor = this.chartColors.grayLightTwo;
      if (!data[0].balloon) {
        chart.chartCursor.valueLineEnabled = false;
        chart.categoryAxis.gridColor = this.chartColors.grayLightThree;
      }

      chart.graphs = this.getActiveLineGraphs(data);
      chart.dataProvider = data;
      chart.validateData();
      chart.validateNow();
    } else if (data.length > 0) {
      chart = this.createActiveLineGraph(data);
    }
    return chart;
  }

  private createActiveLineGraph(data: Array<IActiveUserData>): any {
    let valueAxes: any = [this.CommonGraphService.getBaseVariable(this.CommonGraphService.AXIS)];
    valueAxes[0].integersOnly = true;

    let catAxis: any = this.CommonGraphService.getBaseVariable(this.CommonGraphService.AXIS);
    catAxis.startOnAxis = true;
    catAxis.gridAlpha = 1;
    catAxis.gridColor = this.chartColors.grayLightTwo;
    catAxis.tickLength = 5;
    catAxis.showFirstLabel = false;

    let chartCursor: any = this.CommonGraphService.getBaseVariable(this.CommonGraphService.CURSOR);
    chartCursor.valueLineAlpha = 1;
    chartCursor.valueLineEnabled = true;
    chartCursor.valueLineBalloonEnabled = true;
    chartCursor.cursorColor = this.chartColors.grayLightOne;

    if (!data[0].balloon) {
      chartCursor.valueLineEnabled = false;
      catAxis.gridColor = this.chartColors.grayLightThree;
    }

    let chartData: any = this.CommonGraphService.getBaseSerialGraph(data, 0, valueAxes, this.getActiveLineGraphs(data), this.CommonGraphService.DATE, catAxis);
    chartData.numberFormatter = this.CommonGraphService.getBaseVariable(this.CommonGraphService.NUMFORMAT);
    chartData.legend = this.CommonGraphService.getBaseVariable(this.CommonGraphService.LEGEND);
    chartData.chartCursor = chartCursor;
    chartData.legend.labelText = '[[' + this.CommonGraphService.TITLE + ']]';
    chartData.autoMargins = true;

    return AmCharts.makeChart(this.activeUserDiv, chartData);
  }

  private getActiveLineGraphs(data: Array<IActiveUserData>): Array<any> {
    // translations and constants
    const registeredUsers: string = this.$translate.instant('activeUsers.registeredUsers');
    const activeUsers: string = this.$translate.instant('activeUsers.activeUsers');
    const users: string = this.$translate.instant('activeUsers.users');

    let colors: Array<string> = [this.chartColors.colorPeopleLighter, this.chartColors.colorPeopleLight];
    let balloons: Array<boolean> = [true, true];
    let fillAlphas: Array<number> = [0.5, 0.5];
    let values: Array<string> = ['totalRegisteredUsers', 'activeUsers'];
    let titles: Array<string> = [users, activeUsers];
    let graphs: Array<any> = [];

    if (!data[0].balloon) {
      colors = [this.chartColors.dummyGrayLight, this.chartColors.dummyGray];
      balloons = [false, false];
    }

    let colorsTwo: Array<string> = _.clone(colors);
    _.forEach(values, (value: string, index: number): void => {
      graphs.push(this.CommonGraphService.getBaseVariable(this.CommonGraphService.LINE));
      graphs[index].bullet = 'none';
      graphs[index].title = titles[index];
      graphs[index].lineColor = colorsTwo[index];
      graphs[index].legendColor = colors[index];
      graphs[index].valueField = value;
      graphs[index].balloonFunction = (graphDataItem: any, graph: any): string | undefined => {
        let data: any = _.get(graphDataItem, 'dataContext', {});
        let hiddenData: string = _.get(graph, 'data[0].category', '');
        let title: string = _.get(graph, 'title', '');
        let balloonText: string | undefined = undefined;

        if (title === users && data.date !== hiddenData) {
          balloonText = SparkGraphService.graphTextSpan + registeredUsers + SparkGraphService.boldNumberSpan + ' ' + data.totalRegisteredUsers + '</span></span>';
        } else if (data.date !== hiddenData) {
          balloonText = SparkGraphService.graphTextSpan + activeUsers + SparkGraphService.boldNumberSpan + ' ' + data.activeUsers;
          if (this.activeUserFilter.value === this.ReportConstants.WEEK_FILTER.value) {
            balloonText += ' (' + data.percentage + '%)';
          }
          balloonText += '</span></span>';
        }

        return balloonText;
      };
      graphs[index].showBalloon = balloons[index];
      graphs[index].clustered = false;
      graphs[index].fillAlphas = fillAlphas[index];
      graphs[index].lineThickness = 1;
    });

    return graphs;
  }

  // Active User Column Graph
  public setActiveUsersGraph(data: Array<IActiveUserData>, chart: any): any {
    if (data.length > 0 && chart) {
      chart.startDuration = 1;
      if (!data[0].balloon) {
        chart.startDuration = 0;
      }

      chart.dataProvider = data;
      chart.graphs = this.activeUserGraphs(data);
      chart.validateData();
    } else if (data.length > 0) {
      chart = this.createActiveUsersGraph(data);
    }
    return chart;
  }

  private createActiveUsersGraph(data: Array<IActiveUserData>): any {
    let valueAxes: any = [this.CommonGraphService.getBaseVariable(this.CommonGraphService.AXIS)];
    valueAxes[0].integersOnly = true;
    valueAxes[0].minimum = 0;

    let catAxis: any = this.CommonGraphService.getBaseVariable(this.CommonGraphService.AXIS);
    catAxis.gridPosition = this.CommonGraphService.START;

    let startDuration: any = 1;
    if (!data[0].balloon) {
      startDuration = 0;
    }

    let chartData: any = this.CommonGraphService.getBaseSerialGraph(data, startDuration, valueAxes, this.activeUserGraphs(data), this.CommonGraphService.DATE, catAxis);
    chartData.numberFormatter = this.CommonGraphService.getBaseVariable(this.CommonGraphService.NUMFORMAT);
    chartData.legend = this.CommonGraphService.getBaseVariable(this.CommonGraphService.LEGEND);
    chartData.legend.labelText = '[[' + this.CommonGraphService.TITLE + ']]';

    return AmCharts.makeChart(this.activeUserDiv, chartData);
  }

  private activeUserGraphs(data: Array<IActiveUserData>): Array<any> {
    const balloonText: string = SparkGraphService.graphTextSpan + this.$translate.instant('activeUsers.registeredUsers') + ' <span class="graph-number">[[totalRegisteredUsers]]</span></span><br>' + SparkGraphService.graphTextSpan +  this.$translate.instant('activeUsers.active') + ' <span class="graph-number">[[percentage]]%</span></span>';

    let colors: Array<string> = [this.chartColors.brandSuccessLight, this.chartColors.brandSuccessDark];
    if (!data[0].balloon) {
      colors = [this.chartColors.dummyGrayLight, this.chartColors.dummyGray];
    }
    let values = ['totalRegisteredUsers', 'activeUsers'];
    let titles = [this.$translate.instant('activeUsers.users'), this.$translate.instant('activeUsers.activeUsers')];

    let graphs: Array<any> = [];
    _.forEach(values, (value: string, index: number): void => {
      graphs.push(this.CommonGraphService.getBaseVariable(this.CommonGraphService.COLUMN));
      graphs[index].title = titles[index];
      graphs[index].fillColors = colors[index];
      graphs[index].legendColor = colors[index];
      graphs[index].valueField = value;
      graphs[index].balloonText = balloonText;
      graphs[index].showBalloon = data[0].balloon;
      graphs[index].clustered = false;
    });
    return graphs;
  }

  // Average Rooms Column Graph
  public setAvgRoomsGraph(data: Array<IAvgRoomData>, chart: any): any {
    if (data.length > 0 && chart) {
      chart.startDuration = 1;
      if (!data[0].balloon) {
        chart.startDuration = 0;
      }

      chart.dataProvider = data;
      chart.graphs = this.avgRoomsGraphs(data);
      chart.validateData();
    } else if (data.length > 0) {
      chart = this.createAvgRoomsGraph(data);
    }
    return chart;
  }

  private createAvgRoomsGraph(data: Array<IAvgRoomData>): any {
    let catAxis: any = this.CommonGraphService.getBaseVariable(this.CommonGraphService.AXIS);
    catAxis.gridPosition = this.CommonGraphService.START;

    let valueAxes: any = [this.CommonGraphService.getBaseVariable(this.CommonGraphService.AXIS)];
    valueAxes[0].totalColor = this.chartColors.brandWhite;
    valueAxes[0].integersOnly = true;
    valueAxes[0].minimum = 0;

    let startDuration: any = 1;
    if (!data[0].balloon) {
      startDuration = 0;
    }

    let chartData: any = this.CommonGraphService.getBaseSerialGraph(data, startDuration, valueAxes, this.avgRoomsGraphs(data), this.CommonGraphService.DATE, catAxis);
    chartData.numberFormatter = this.CommonGraphService.getBaseVariable(this.CommonGraphService.NUMFORMAT);
    chartData.legend = this.CommonGraphService.getBaseVariable(this.CommonGraphService.LEGEND);

    return AmCharts.makeChart(this.avgRoomsdiv, chartData);
  }

  private avgRoomsGraphs(data: Array<IAvgRoomData>): Array<any> {
    // translations
    let oneToOne: string = this.$translate.instant('avgRooms.oneToOne');
    let group: string = this.$translate.instant('avgRooms.group');
    let total: string = this.$translate.instant('avgRooms.avgTotal');

    // graph variables
    const balloonText: string = SparkGraphService.graphTextSpan + group + ' <span class="room-number">[[groupRooms]]</span><br>' + oneToOne + ' <span class="room-number">[[oneToOneRooms]]</span><br>' + total + ' <span class="room-number">[[avgRooms]]</span></span>';

    let titles: Array<string> = [group, oneToOne];
    let values: Array<string> = ['totalRooms', 'oneToOneRooms'];
    let colors: Array<string> = [this.chartColors.primaryColorLight, this.chartColors.primaryColorDarker];
    if (!data[0].balloon) {
      colors = [this.chartColors.dummyGrayLight, this.chartColors.dummyGray];
    }

    let graphs: Array<any> = [];
    _.forEach(values, (value: string, index: number): void => {
      graphs.push(this.CommonGraphService.getBaseVariable(this.CommonGraphService.COLUMN));
      graphs[index].title = titles[index];
      graphs[index].fillColors = colors[index];
      graphs[index].valueField = value;
      graphs[index].legendColor = colors[index];
      graphs[index].showBalloon = data[0].balloon;
      graphs[index].balloonText = balloonText;
      graphs[index].clustered = false;
    });
    return graphs;
  }

  // Files Shared Column Graph
  public setFilesSharedGraph(data: Array<IFilesShared>, chart: any): any {
    if (data.length > 0 && chart) {
      chart.startDuration = 1;
      if (!data[0].balloon) {
        chart.startDuration = 0;
      }

      chart.dataProvider = data;
      chart.graphs = this.filesSharedGraphs(data);
      chart.validateData();
    } else if (data.length > 0) {
      chart = this.createFilesSharedGraph(data);
    }
    return chart;
  }

  private createFilesSharedGraph(data) {
    let catAxis: any = this.CommonGraphService.getBaseVariable(this.CommonGraphService.AXIS);
    catAxis.gridPosition = this.CommonGraphService.START;

    let valueAxes: any = [this.CommonGraphService.getBaseVariable(this.CommonGraphService.AXIS)];
    valueAxes[0].totalColor = this.chartColors.brandWhite;
    valueAxes[0].integersOnly = true;
    valueAxes[0].minimum = 0;

    let startDuration: any = 1;
    if (!data[0].balloon) {
      startDuration = 0;
    }

    let chartData: any = this.CommonGraphService.getBaseSerialGraph(data, startDuration, valueAxes, this.filesSharedGraphs(data), this.CommonGraphService.DATE, catAxis);
    chartData.numberFormatter = this.CommonGraphService.getBaseVariable(this.CommonGraphService.NUMFORMAT);

    return AmCharts.makeChart(this.filesSharedDiv, chartData);
  }

  private filesSharedGraphs(data: Array<IFilesShared>): Array<any> {
    const filesShared: string = this.$translate.instant('filesShared.filesShared');
    const fileSizes: string = this.$translate.instant('filesShared.fileSizes');
    const gb: string = this.$translate.instant('filesShared.gb');

    const balloonText: string = SparkGraphService.graphTextSpan + filesShared + ' <span class="graph-number">[[contentShared]]</span><br>' + fileSizes + ' <span class="graph-number">[[contentShareSizes]] ' + gb + '</span></span>';
    let color: string = this.chartColors.brandSuccess;

    if (!data[0].balloon) {
      color = this.chartColors.dummyGray;
    }

    let graph: any = this.CommonGraphService.getBaseVariable(this.CommonGraphService.COLUMN);
    graph.title = filesShared;
    graph.fillColors = color;
    graph.colorField = color;
    graph.valueField = 'contentShared';
    graph.showBalloon = data[0].balloon;
    graph.balloonText = balloonText;

    return [graph];
  }

  // Media Quality Column Graph
  public setMediaQualityGraph(data: Array<IMediaData>, chart: any, filter: IDropdownBase): any {
    if (data.length > 0 && chart) {
      chart.startDuration = 1;
      if (!data[0].balloon) {
        chart.startDuration = 0;
      }

      chart.dataProvider = data;
      chart.graphs = this.mediaGraphs(data, filter);
      chart.validateData();
    } else if (data.length > 0) {
      chart = this.createMediaGraph(data, filter);
    }
    return chart;
  }

  private createMediaGraph(data, filter) {
    let catAxis: any = this.CommonGraphService.getBaseVariable(this.CommonGraphService.AXIS);
    catAxis.gridPosition = this.CommonGraphService.START;

    let valueAxes: any = [this.CommonGraphService.getBaseVariable(this.CommonGraphService.AXIS)];
    valueAxes[0].integersOnly = true;
    valueAxes[0].minimum = 0;
    valueAxes[0].title = this.$translate.instant('mediaQuality.minutes');

    let startDuration: any = 1;
    if (!data[0].balloon) {
      startDuration = 0;
    }

    let chartData: any = this.CommonGraphService.getBaseSerialGraph(data, startDuration, valueAxes, this.mediaGraphs(data, filter), this.CommonGraphService.DATE, catAxis);
    chartData.numberFormatter = this.CommonGraphService.getBaseVariable(this.CommonGraphService.NUMFORMAT);
    chartData.legend = this.CommonGraphService.getBaseVariable(this.CommonGraphService.LEGEND);

    return AmCharts.makeChart(this.mediaQualityDiv, chartData);
  }

  private mediaGraphs(data: Array<IMediaData>, filter: IDropdownBase): Array<any> {
    const totalCalls: string = this.$translate.instant('mediaQuality.totalCalls');

    let values = ['totalDurationSum', 'partialSum', 'poorQualityDurationSum'];
    let balloonValues = ['goodQualityDurationSum', 'fairQualityDurationSum', 'poorQualityDurationSum'];
    if (filter.value === this.ReportConstants.MEDIA_FILTER_TWO.value) {
      values = ['totalAudioDurationSum', 'partialAudioSum', 'poorAudioQualityDurationSum'];
      balloonValues = ['goodAudioQualityDurationSum', 'fairAudioQualityDurationSum', 'poorAudioQualityDurationSum'];
    } else if (filter.value === this.ReportConstants.MEDIA_FILTER_THREE.value) {
      values = ['totalVideoDurationSum', 'partialVideoSum', 'poorVideoQualityDurationSum'];
      balloonValues = ['goodVideoQualityDurationSum', 'fairVideoQualityDurationSum', 'poorVideoQualityDurationSum'];
    }

    let titles = [this.$translate.instant('mediaQuality.good'), this.$translate.instant('mediaQuality.fair'), this.$translate.instant('mediaQuality.poor')];
    let colors = [this.chartColors.blue, this.chartColors.brandWarning, this.chartColors.brandDanger];
    if (!data[0].balloon) {
      colors = [this.chartColors.dummyGrayLighter, this.chartColors.dummyGrayLight, this.chartColors.dummyGray];
    }

    let graphs: Array<any> = [];
    _.forEach(colors, (color: string, index: number): void => {
      graphs.push(this.CommonGraphService.getBaseVariable(this.CommonGraphService.COLUMN));
      graphs[index].title = titles[index];
      graphs[index].fillColors = color;
      graphs[index].colorField = color;
      graphs[index].valueField = values[index];
      graphs[index].legendColor = color;
      graphs[index].showBalloon = data[0].balloon;
      graphs[index].balloonText = '<span class="graph-text">' + totalCalls + ': ' + ' <span class="graph-media">[[' + values[0] + ']]</span><br>' + titles[index] + ': ' + '<span class="graph-media"> [[' + balloonValues[index] + ']]</span></span>';
      graphs[index].clustered = false;
    });
    return graphs;
  }

  // Registered Endpoints Column Graph
  public setDeviceGraph(data: Array<IEndpointWrapper>, chart: any, filter: IDropdownBase | undefined): any {
    if (data.length > 0 && chart) {
      const graphNumber: number = _.get(filter, 'value', 0);
      chart.startDuration = 1;
      if (!data[graphNumber].balloon) {
        chart.startDuration = 0;
      }

      chart.dataProvider = data[graphNumber].graph;
      chart.graphs = this.deviceGraphs(data, filter);
      chart.validateData();
    } else if (data.length > 0) {
      chart = this.createDeviceGraph(data, filter);
    }
    return chart;
  }

  private createDeviceGraph(data: Array<IEndpointWrapper>, filter: IDropdownBase | undefined): any {
    const graphNumber: number = _.get(filter, 'value', 0);
    let catAxis: any = this.CommonGraphService.getBaseVariable(this.CommonGraphService.AXIS);
    catAxis.gridPosition = this.CommonGraphService.START;

    let valueAxes: any = [this.CommonGraphService.getBaseVariable(this.CommonGraphService.AXIS)];
    valueAxes[graphNumber].integersOnly = true;
    valueAxes[graphNumber].minimum = 0;

    let startDuration: any = 1;
    if (!data[graphNumber].balloon) {
      startDuration = 0;
    }

    let chartData: any = this.CommonGraphService.getBaseSerialGraph(data[graphNumber].graph, startDuration, valueAxes, this.deviceGraphs(data, filter), this.CommonGraphService.DATE, catAxis);
    chartData.numberFormatter = this.CommonGraphService.getBaseVariable(this.CommonGraphService.NUMFORMAT);
    return AmCharts.makeChart(this.devicesDiv, chartData);
  }

  private deviceGraphs(data: Array<IEndpointWrapper>, filter: IDropdownBase | undefined): Array<any> {
    const graphNumber: number = _.get(filter, 'value', 0);
    const title: string = this.$translate.instant('registeredEndpoints.registeredEndpoints');
    let color: string = this.chartColors.colorPeopleBase;
    if (!data[0].balloon) {
      color = this.chartColors.grayLighter;
    }

    let graph: any = this.CommonGraphService.getBaseVariable(this.CommonGraphService.COLUMN);
    graph.title = title;
    graph.fillColors = color;
    graph.colorField = color;
    graph.valueField = 'totalRegisteredDevices';
    graph.balloonText = SparkGraphService.graphTextSpan + title + ' <span class="device-number">[[totalRegisteredDevices]]</span></span>';
    graph.showBalloon = data[graphNumber].balloon;

    return [graph];
  }

  // Call Metrics Donut Chart
  public setMetricsGraph(data: IMetricsData, chart: any): any {
    let balloonText = SparkGraphService.graphTextSpan + '[[numCalls]] [[callCondition]] ([[percentage]]%)</span>';

    if (data && chart) {
      chart.balloonText = balloonText;
      if (data.dummy) {
        chart.balloonText = '';
      }

      chart.dataProvider = data.dataProvider;
      chart.validateData();
    } else if (data) {
      const labelText = '[[percents]]%<br>[[callCondition]]';
      if (data.dummy) {
        balloonText = '';
      }

      let chartData: any = this.CommonGraphService.getBasePieChart(data.dataProvider, balloonText, '65%', '30%', labelText, true, 'callCondition', 'percentage', this.CommonGraphService.COLOR, this.CommonGraphService.COLOR);
      chart = AmCharts.makeChart(this.metricsGraphDiv, chartData);
    }
    return chart;
  }
}

angular.module('Core')
  .service('SparkGraphService', SparkGraphService);
