import {
  IActiveUserData,
  IDropdownBase,
} from '../../partnerReports/partnerReportInterfaces';
import { ReportConstants } from '../../partnerReports/commonReportServices/reportConstants.service';
import { CommonGraphService } from '../../partnerReports/commonReportServices/commonGraph.service';
import { ChartColors } from 'modules/core/config/chartColors';

import {
  IAvgRoomData,
  IConversation,
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
    private CommonGraphService: CommonGraphService,
    private ReportConstants: ReportConstants,
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

  public setActiveLineGraph(data: IActiveUserData[], chart: any): any {
    if (data.length > 0 && chart) {
      chart.categoryAxis.gridColor = ChartColors.grayLightTwo;
      if (!data[0].balloon) {
        chart.categoryAxis.gridColor = ChartColors.grayLightThree;
      }

      chart.graphs = this.getActiveLineGraphs(data);
      chart.dataProvider = data;
      chart.validateData();
    } else if (data.length > 0) {
      chart = this.createActiveLineGraph(data);
    }
    return chart;
  }

  private createActiveLineGraph(data: IActiveUserData[]): any {
    const catAxis: any = this.CommonGraphService.getBaseVariable(this.CommonGraphService.LINE_AXIS);
    const valueAxes: any = [this.CommonGraphService.getBaseVariable(this.CommonGraphService.AXIS)];
    valueAxes[0].integersOnly = true;

    const chartCursor: any = this.CommonGraphService.getBaseVariable(this.CommonGraphService.CURSOR);
    chartCursor.valueLineAlpha = 1;
    chartCursor.valueLineEnabled = true;
    chartCursor.valueLineBalloonEnabled = true;
    chartCursor.cursorColor = ChartColors.grayLightTwo;

    if (!data[0].balloon) {
      catAxis.gridColor = ChartColors.grayLightThree;
    }

    const chartData: any = this.CommonGraphService.getBaseSerialGraph(data, 0, valueAxes, this.getActiveLineGraphs(data), this.CommonGraphService.DATE, catAxis);
    chartData.numberFormatter = this.CommonGraphService.getBaseVariable(this.CommonGraphService.NUMFORMAT);
    chartData.legend = this.CommonGraphService.getBaseVariable(this.CommonGraphService.LEGEND);
    chartData.chartCursor = chartCursor;
    chartData.autoMargins = true;

    return AmCharts.makeChart(this.activeUserDiv, chartData);
  }

  private getActiveLineGraphs(data: IActiveUserData[]): any[] {
    // translations and constants
    const registeredUsers: string = this.$translate.instant('activeUsers.registeredUsers');
    const activeUsers: string = this.$translate.instant('activeUsers.activeUsers');
    const users: string = this.$translate.instant('activeUsers.users');

    let colors: string[] = [ChartColors.peopleLighter, ChartColors.peopleLight];
    let balloons: boolean[] = [true, true];
    const values: string[] = ['totalRegisteredUsers', 'activeUsers'];
    const titles: string[] = [users, activeUsers];
    const graphs: any[] = [];

    if (!data[0].balloon) {
      colors = [ChartColors.grayLightThree, ChartColors.grayLightTwo];
      balloons = [false, false];
    }

    const colorsTwo: string[] = _.clone(colors);
    _.forEach(values, (value: string, index: number): void => {
      graphs.push(this.CommonGraphService.getBaseVariable(this.CommonGraphService.LINE));
      graphs[index].title = titles[index];
      graphs[index].lineColor = colorsTwo[index];
      graphs[index].legendColor = colors[index];
      graphs[index].valueField = value;
      graphs[index].clustered = false;
      graphs[index].balloonFunction = (graphDataItem: any, graph: any): string | undefined => {
        const data: any = _.get(graphDataItem, 'dataContext', {});
        const title: string = _.get(graph, 'title', '');
        let balloonText: string | undefined = undefined;

        if (title === users) {
          balloonText = SparkGraphService.graphTextSpan + registeredUsers + SparkGraphService.boldNumberSpan + ' ' + data.totalRegisteredUsers + '</span></span>';
        } else {
          balloonText = SparkGraphService.graphTextSpan + activeUsers + SparkGraphService.boldNumberSpan + ' ' + data.activeUsers;
          if (this.activeUserFilter.value === this.ReportConstants.WEEK_FILTER.value) {
            balloonText += ' (' + data.percentage + '%)';
          }
          balloonText += '</span></span>';
        }

        return balloonText;
      };
      graphs[index].showBalloon = balloons[index];
    });

    return graphs;
  }

  // Active User Column Graph
  public setActiveUsersGraph(data: IActiveUserData[], chart: any): any {
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

  private createActiveUsersGraph(data: IActiveUserData[]): any {
    const valueAxes: any = [this.CommonGraphService.getBaseVariable(this.CommonGraphService.AXIS)];
    valueAxes[0].integersOnly = true;
    valueAxes[0].minimum = 0;

    const catAxis: any = this.CommonGraphService.getBaseVariable(this.CommonGraphService.AXIS);
    catAxis.gridPosition = this.CommonGraphService.START;

    let startDuration: any = 1;
    if (!data[0].balloon) {
      startDuration = 0;
    }

    const chartData: any = this.CommonGraphService.getBaseSerialGraph(data, startDuration, valueAxes, this.activeUserGraphs(data), this.CommonGraphService.DATE, catAxis);
    chartData.numberFormatter = this.CommonGraphService.getBaseVariable(this.CommonGraphService.NUMFORMAT);
    chartData.legend = this.CommonGraphService.getBaseVariable(this.CommonGraphService.LEGEND);

    return AmCharts.makeChart(this.activeUserDiv, chartData);
  }

  private activeUserGraphs(data: IActiveUserData[]): any[] {
    const balloonText: string = SparkGraphService.graphTextSpan + this.$translate.instant('activeUsers.registeredUsers') + ' <span class="graph-number">[[totalRegisteredUsers]]</span></span><br>' + SparkGraphService.graphTextSpan +  this.$translate.instant('activeUsers.active') + ' <span class="graph-number">[[percentage]]%</span></span>';

    let colors: string[] = [ChartColors.ctaLight, ChartColors.ctaBase];
    if (!data[0].balloon) {
      colors = [ChartColors.grayLightThree, ChartColors.grayLightTwo];
    }
    const values = ['totalRegisteredUsers', 'activeUsers'];
    const titles = [this.$translate.instant('activeUsers.users'), this.$translate.instant('activeUsers.activeUsers')];

    const graphs: any[] = [];
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
  public setAvgRoomsGraph(data: IAvgRoomData[], chart: any): any {
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

  private createAvgRoomsGraph(data: IAvgRoomData[]): any {
    const catAxis: any = this.CommonGraphService.getBaseVariable(this.CommonGraphService.AXIS);
    catAxis.gridPosition = this.CommonGraphService.START;

    const valueAxes: any = [this.CommonGraphService.getBaseVariable(this.CommonGraphService.AXIS)];
    valueAxes[0].totalColor = ChartColors.brandWhite;
    valueAxes[0].integersOnly = true;
    valueAxes[0].minimum = 0;

    let startDuration: any = 1;
    if (!data[0].balloon) {
      startDuration = 0;
    }

    const chartData: any = this.CommonGraphService.getBaseSerialGraph(data, startDuration, valueAxes, this.avgRoomsGraphs(data), this.CommonGraphService.DATE, catAxis);
    chartData.numberFormatter = this.CommonGraphService.getBaseVariable(this.CommonGraphService.NUMFORMAT);
    chartData.legend = this.CommonGraphService.getBaseVariable(this.CommonGraphService.LEGEND);

    return AmCharts.makeChart(this.avgRoomsdiv, chartData);
  }

  private avgRoomsGraphs(data: IAvgRoomData[]): any[] {
    // translations
    const oneToOne: string = this.$translate.instant('avgRooms.oneToOne');
    const group: string = this.$translate.instant('avgRooms.group');
    const total: string = this.$translate.instant('avgRooms.avgTotal');

    // graph variables
    const balloonText: string = SparkGraphService.graphTextSpan + group + ' <span class="room-number">[[groupRooms]]</span><br>' + oneToOne + ' <span class="room-number">[[oneToOneRooms]]</span><br>' + total + ' <span class="room-number">[[avgRooms]]</span></span>';

    const titles: string[] = [group, oneToOne];
    const values: string[] = ['totalRooms', 'oneToOneRooms'];
    let colors: string[] = [ChartColors.primaryLight, ChartColors.primaryDarker];
    if (!data[0].balloon) {
      colors = [ChartColors.grayLightThree, ChartColors.grayLightTwo];
    }

    const graphs: any[] = [];
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

  // Average Rooms Line Graph
  public setRoomGraph(data: IConversation[] | IAvgRoomData[], chart: any): any {
    if (data.length > 0 && chart) {
      chart.categoryAxis.gridColor = ChartColors.grayLightTwo;
      if (!data[0].balloon) {
        chart.categoryAxis.gridColor = ChartColors.grayLightThree;
      }

      chart.dataProvider = data;
      chart.graphs = this.roomGraphs(data);
      chart.validateData();
    } else if (data.length > 0) {
      chart = this.createRoomGraph(data);
    }
    return chart;
  }

  private createRoomGraph(data: IConversation[] | IAvgRoomData[]): any {
    const catAxis: any = this.CommonGraphService.getBaseVariable(this.CommonGraphService.LINE_AXIS);
    const valueAxes: any = [this.CommonGraphService.getBaseVariable(this.CommonGraphService.AXIS)];
    valueAxes[0].integersOnly = true;
    valueAxes[0].stackType = 'regular';

    const chartCursor: any = this.CommonGraphService.getBaseVariable(this.CommonGraphService.CURSOR);
    chartCursor.valueLineAlpha = 1;
    chartCursor.valueLineEnabled = true;
    chartCursor.valueLineBalloonEnabled = true;
    chartCursor.cursorColor = ChartColors.grayLightTwo;

    if (!data[0].balloon) {
      catAxis.gridColor = ChartColors.grayLightThree;
    }

    const chartData: any = this.CommonGraphService.getBaseSerialGraph(data, 0, valueAxes, this.roomGraphs(data), this.CommonGraphService.DATE, catAxis);
    chartData.numberFormatter = this.CommonGraphService.getBaseVariable(this.CommonGraphService.NUMFORMAT);
    chartData.legend = this.CommonGraphService.getBaseVariable(this.CommonGraphService.LEGEND);
    chartData.legend.reversedOrder = true;
    chartData.chartCursor = chartCursor;
    chartData.autoMargins = true;

    return AmCharts.makeChart(this.avgRoomsdiv, chartData);
  }

  private roomGraphs(data: IConversation[] | IAvgRoomData[]): any[] {
    // translations
    const oneToOne: string = this.$translate.instant('avgRooms.oneToOne');
    const group: string = this.$translate.instant('avgRooms.group');
    const total: string = this.$translate.instant('avgRooms.avgTotal');

    // graph variables
    const balloonText: string = SparkGraphService.graphTextSpan + group + ' <span class="room-number">[[groupRooms]]</span><br>' + oneToOne + ' <span class="room-number">[[oneToOneRooms]]</span><br>' + total + ' <span class="room-number">[[avgRooms]]</span></span>';

    const titles: string[] = [oneToOne, group];
    const values: string[] = ['oneToOneRooms', 'groupRooms'];
    let colors: string[] = [ChartColors.primaryDarker, ChartColors.primaryLight];
    if (!data[0].balloon) {
      colors = [ChartColors.grayLightTwo, ChartColors.grayLightThree];
    }

    const graphs: any[] = [];
    _.forEach(values, (value: string, index: number): void => {
      graphs.push(this.CommonGraphService.getBaseVariable(this.CommonGraphService.LINE));
      graphs[index].title = titles[index];
      graphs[index].fillColors = colors[index];
      graphs[index].valueField = value;
      graphs[index].lineColor = colors[index];
      graphs[index].legendColor = colors[index];
      graphs[index].showBalloon = data[0].balloon;
      graphs[index].balloonText = balloonText;
    });
    return graphs;
  }

  // Files Shared Column Graph
  public setFilesSharedGraph(data: IFilesShared[], chart: any): any {
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

  private createFilesSharedGraph(data: IFilesShared[]): any {
    const catAxis: any = this.CommonGraphService.getBaseVariable(this.CommonGraphService.AXIS);
    catAxis.gridPosition = this.CommonGraphService.START;

    const valueAxes: any = [this.CommonGraphService.getBaseVariable(this.CommonGraphService.AXIS)];
    valueAxes[0].totalColor = ChartColors.brandWhite;
    valueAxes[0].integersOnly = true;
    valueAxes[0].minimum = 0;

    let startDuration: any = 1;
    if (!data[0].balloon) {
      startDuration = 0;
    }

    const chartData: any = this.CommonGraphService.getBaseSerialGraph(data, startDuration, valueAxes, this.filesSharedGraphs(data), this.CommonGraphService.DATE, catAxis);
    chartData.numberFormatter = this.CommonGraphService.getBaseVariable(this.CommonGraphService.NUMFORMAT);

    return AmCharts.makeChart(this.filesSharedDiv, chartData);
  }

  private filesSharedGraphs(data: IFilesShared[]): any[] {
    const filesShared: string = this.$translate.instant('filesShared.filesShared');
    const fileSizes: string = this.$translate.instant('filesShared.fileSizes');
    const gb: string = this.$translate.instant('filesShared.gb');

    const balloonText: string = SparkGraphService.graphTextSpan + filesShared + ' <span class="graph-number">[[contentShared]]</span><br>' + fileSizes + ' <span class="graph-number">[[contentShareSizes]] ' + gb + '</span></span>';
    let color: string = ChartColors.ctaLight;

    if (!data[0].balloon) {
      color = ChartColors.grayLightTwo;
    }

    const graph: any = this.CommonGraphService.getBaseVariable(this.CommonGraphService.COLUMN);
    graph.title = filesShared;
    graph.fillColors = color;
    graph.colorField = color;
    graph.valueField = 'contentShared';
    graph.showBalloon = data[0].balloon;
    graph.balloonText = balloonText;

    return [graph];
  }

  // Files Shared Line Graph
  public setFilesGraph(data: IFilesShared[], chart: any): any {
    if (data.length > 0 && chart) {
      chart.categoryAxis.gridColor = ChartColors.grayLightTwo;
      if (!data[0].balloon) {
        chart.categoryAxis.gridColor = ChartColors.grayLightThree;
      }

      chart.dataProvider = data;
      chart.graphs = this.filesGraphs(data);
      chart.validateData();
    } else if (data.length > 0) {
      chart = this.createsFileGraph(data);
    }
    return chart;
  }

  private createsFileGraph(data: IFilesShared[]): any {
    const catAxis: any = this.CommonGraphService.getBaseVariable(this.CommonGraphService.LINE_AXIS);
    const valueAxes: any = [this.CommonGraphService.getBaseVariable(this.CommonGraphService.AXIS)];
    valueAxes[0].integersOnly = true;

    const chartCursor: any = this.CommonGraphService.getBaseVariable(this.CommonGraphService.CURSOR);
    chartCursor.valueLineAlpha = 1;
    chartCursor.valueLineEnabled = true;
    chartCursor.valueLineBalloonEnabled = true;
    chartCursor.cursorColor = ChartColors.grayLightTwo;

    if (!data[0].balloon) {
      catAxis.gridColor = ChartColors.grayLightThree;
    }

    const chartData: any = this.CommonGraphService.getBaseSerialGraph(data, 0, valueAxes, this.filesGraphs(data), this.CommonGraphService.DATE, catAxis);
    chartData.numberFormatter = this.CommonGraphService.getBaseVariable(this.CommonGraphService.NUMFORMAT);
    chartData.chartCursor = chartCursor;
    chartData.autoMargins = true;

    return AmCharts.makeChart(this.filesSharedDiv, chartData);
  }

  private filesGraphs(data: IFilesShared[]): any[] {
    const filesShared: string = this.$translate.instant('filesShared.filesShared');
    const fileSizes: string = this.$translate.instant('filesShared.fileSizes');
    const gb: string = this.$translate.instant('filesShared.gb');

    let color: string = ChartColors.ctaBase;
    if (!data[0].balloon) {
      color = ChartColors.grayLightTwo;
    }

    const graph: any = this.CommonGraphService.getBaseVariable(this.CommonGraphService.SINGLE_LINE);
    graph.title = filesShared;
    graph.colorField = color;
    graph.lineColor = color;
    graph.valueField = 'contentShared';
    graph.showBalloon = data[0].balloon;
    graph.balloonText = SparkGraphService.graphTextSpan + filesShared + ' <span class="graph-number">[[contentShared]]</span><br>' + fileSizes + ' <span class="graph-number">[[contentShareSizes]] ' + gb + '</span></span>';

    return [graph];
  }

  // Media Quality Column Graph
  public setMediaQualityGraph(data: IMediaData[], chart: any, filter: IDropdownBase): any {
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
    const catAxis: any = this.CommonGraphService.getBaseVariable(this.CommonGraphService.AXIS);
    catAxis.gridPosition = this.CommonGraphService.START;

    const valueAxes: any = [this.CommonGraphService.getBaseVariable(this.CommonGraphService.AXIS)];
    valueAxes[0].integersOnly = true;
    valueAxes[0].minimum = 0;
    valueAxes[0].title = this.$translate.instant('mediaQuality.minutes');

    let startDuration: any = 1;
    if (!data[0].balloon) {
      startDuration = 0;
    }

    const chartData: any = this.CommonGraphService.getBaseSerialGraph(data, startDuration, valueAxes, this.mediaGraphs(data, filter), this.CommonGraphService.DATE, catAxis);
    chartData.numberFormatter = this.CommonGraphService.getBaseVariable(this.CommonGraphService.NUMFORMAT);
    chartData.legend = this.CommonGraphService.getBaseVariable(this.CommonGraphService.LEGEND);

    return AmCharts.makeChart(this.mediaQualityDiv, chartData);
  }

  private mediaGraphs(data: IMediaData[], filter: IDropdownBase): any[] {
    let values: string[] = ['totalDurationSum', 'partialSum', 'poorQualityDurationSum'];
    let balloonValues: string[] = ['goodQualityDurationSum', 'fairQualityDurationSum', 'poorQualityDurationSum'];
    if (filter.value === this.ReportConstants.MEDIA_FILTER_TWO.value) {
      values = ['totalAudioDurationSum', 'partialAudioSum', 'poorAudioQualityDurationSum'];
      balloonValues = ['goodAudioQualityDurationSum', 'fairAudioQualityDurationSum', 'poorAudioQualityDurationSum'];
    } else if (filter.value === this.ReportConstants.MEDIA_FILTER_THREE.value) {
      values = ['totalVideoDurationSum', 'partialVideoSum', 'poorVideoQualityDurationSum'];
      balloonValues = ['goodVideoQualityDurationSum', 'fairVideoQualityDurationSum', 'poorVideoQualityDurationSum'];
    }

    const titles: string[] = [this.$translate.instant('mediaQuality.good'), this.$translate.instant('mediaQuality.fair'), this.$translate.instant('mediaQuality.poor')];
    let colors: string[] = [ChartColors.primaryBase, ChartColors.attentionBase, ChartColors.negativeBase];
    if (!data[0].balloon) {
      colors = [ChartColors.grayLightFour, ChartColors.grayLightThree, ChartColors.grayLightTwo];
    }

    const graphs: any[] = [];
    _.forEach(colors, (color: string, index: number): void => {
      graphs.push(this.CommonGraphService.getBaseVariable(this.CommonGraphService.COLUMN));
      graphs[index].title = titles[index];
      graphs[index].fillColors = color;
      graphs[index].colorField = color;
      graphs[index].valueField = values[index];
      graphs[index].legendColor = color;
      graphs[index].showBalloon = data[0].balloon;
      graphs[index].balloonText = '<span class="graph-text">' + this.$translate.instant('mediaQuality.totalCalls') + ': ' + ' <span class="graph-media">[[' + values[0] + ']]</span><br>' + titles[index] + ': ' + '<span class="graph-media"> [[' + balloonValues[index] + ']]</span></span>';
      graphs[index].clustered = false;
    });
    return graphs;
  }

  // Media Quality Line Graph
  public setQualityGraph(data: IMediaData[], chart: any, filter: IDropdownBase): any {
    if (data.length > 0 && chart) {
      chart.categoryAxis.gridColor = ChartColors.grayLightTwo;
      if (!data[0].balloon) {
        chart.categoryAxis.gridColor = ChartColors.grayLightThree;
      }

      chart.dataProvider = data;
      chart.graphs = this.qualityGraphs(data, filter);
      chart.validateData();
    } else if (data.length > 0) {
      chart = this.createQualityGraph(data, filter);
    }
    return chart;
  }

  private createQualityGraph(data, filter) {
    const catAxis: any = this.CommonGraphService.getBaseVariable(this.CommonGraphService.LINE_AXIS);
    catAxis.gridColor = ChartColors.grayLightTwo;
    const valueAxes: any = [this.CommonGraphService.getBaseVariable(this.CommonGraphService.AXIS)];
    valueAxes[0].integersOnly = true;
    valueAxes[0].title = this.$translate.instant('mediaQuality.minutes');
    valueAxes[0].titleColor = ChartColors.grayBase;
    valueAxes[0].stackType = 'regular';

    if (!data[0].balloon) {
      catAxis.gridColor = ChartColors.grayLightThree;
    }

    const chartCursor: any = this.CommonGraphService.getBaseVariable(this.CommonGraphService.CURSOR);
    chartCursor.valueLineAlpha = 1;
    chartCursor.valueLineEnabled = true;
    chartCursor.valueLineBalloonEnabled = true;
    chartCursor.cursorColor = ChartColors.grayLightTwo;

    const chartData: any = this.CommonGraphService.getBaseSerialGraph(data, 0, valueAxes, this.qualityGraphs(data, filter), this.CommonGraphService.DATE, catAxis);
    chartData.numberFormatter = this.CommonGraphService.getBaseVariable(this.CommonGraphService.NUMFORMAT);
    chartData.chartCursor = chartCursor;

    return AmCharts.makeChart(this.mediaQualityDiv, chartData);
  }

  private qualityGraphs(data: IMediaData[], filter: IDropdownBase): any[] {
    let values: string[] = ['poorQualityDurationSum', 'fairQualityDurationSum', 'goodQualityDurationSum'];
    let totalValue: string = 'totalDurationSum';
    if (filter.value === this.ReportConstants.MEDIA_FILTER_TWO.value) {
      values = ['poorAudioQualityDurationSum', 'fairAudioQualityDurationSum', 'goodAudioQualityDurationSum'];
      totalValue = 'totalAudioDurationSum';
    } else if (filter.value === this.ReportConstants.MEDIA_FILTER_THREE.value) {
      values = ['poorVideoQualityDurationSum', 'fairVideoQualityDurationSum', 'goodVideoQualityDurationSum'];
      totalValue = 'totalVideoDurationSum';
    }

    const titles: string[] = [this.$translate.instant('mediaQuality.poor'), this.$translate.instant('mediaQuality.fair'), this.$translate.instant('mediaQuality.good')];
    let colors: string[] = [ChartColors.negativeBase, ChartColors.attentionBase, ChartColors.primaryBase];
    if (!data[0].balloon) {
      colors = [ChartColors.grayLightOne, ChartColors.grayLightTwo, ChartColors.grayLightThree];
    }

    const graphs: any[] = [];
    _.forEach(colors, (color: string, index: number): void => {
      graphs.push(this.CommonGraphService.getBaseVariable(this.CommonGraphService.LINE));
      graphs[index].title = titles[index];
      graphs[index].fillColors = color;
      graphs[index].colorField = color;
      graphs[index].legendColor = color;
      graphs[index].lineColor = color;
      graphs[index].valueField = values[index];
      graphs[index].clustered = false;
      graphs[index].showBalloon = data[0].balloon;
      graphs[index].balloonText = SparkGraphService.graphTextSpan + this.$translate.instant('mediaQuality.totalCalls') + ': <span class="graph-media">[[' + totalValue + ']]</span><br>' + titles[index] + ': <span class="graph-media"> [[' + values[index] + ']]</span></span>';
    });
    return graphs;
  }

  // Registered Endpoints Column Graph
  public setDeviceGraph(data: IEndpointWrapper[], chart: any, filter: IDropdownBase | undefined): any {
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

  private createDeviceGraph(data: IEndpointWrapper[], filter: IDropdownBase | undefined): any {
    const graphNumber: number = _.get(filter, 'value', 0);
    const catAxis: any = this.CommonGraphService.getBaseVariable(this.CommonGraphService.AXIS);
    catAxis.gridPosition = this.CommonGraphService.START;

    const valueAxes: any = [this.CommonGraphService.getBaseVariable(this.CommonGraphService.AXIS)];
    valueAxes[graphNumber].integersOnly = true;
    valueAxes[graphNumber].minimum = 0;

    let startDuration: any = 1;
    if (!data[graphNumber].balloon) {
      startDuration = 0;
    }

    const chartData: any = this.CommonGraphService.getBaseSerialGraph(data[graphNumber].graph, startDuration, valueAxes, this.deviceGraphs(data, filter), this.CommonGraphService.DATE, catAxis);
    chartData.numberFormatter = this.CommonGraphService.getBaseVariable(this.CommonGraphService.NUMFORMAT);
    return AmCharts.makeChart(this.devicesDiv, chartData);
  }

  private deviceGraphs(data: IEndpointWrapper[], filter: IDropdownBase | undefined): any[] {
    const graphNumber: number = _.get(filter, 'value', 0);
    const title: string = this.$translate.instant('registeredEndpoints.registeredEndpoints');
    let color: string = ChartColors.peopleBase;
    if (!data[0].balloon) {
      color = ChartColors.grayLightThree;
    }

    const graph: any = this.CommonGraphService.getBaseVariable(this.CommonGraphService.COLUMN);
    graph.title = title;
    graph.fillColors = color;
    graph.colorField = color;
    graph.valueField = 'totalRegisteredDevices';
    graph.balloonText = SparkGraphService.graphTextSpan + title + ' <span class="device-number">[[totalRegisteredDevices]]</span></span>';
    graph.showBalloon = data[graphNumber].balloon;

    return [graph];
  }

  // Device Line Graph
  public setDeviceLineGraph(data: IEndpointWrapper[], chart: any, filter: IDropdownBase | undefined): any {
    if (data.length > 0 && chart) {
      const graphNumber: number = _.get(filter, 'value', 0);
      chart.categoryAxis.gridColor = ChartColors.grayLightTwo;
      if (!data[graphNumber].balloon) {
        chart.categoryAxis.gridColor = ChartColors.grayLightThree;
      }

      chart.dataProvider = data[graphNumber].graph;
      chart.graphs = this.deviceLineGraphs(data, filter);
      chart.validateData();
    } else if (data.length > 0) {
      chart = this.createDeviceLineGraph(data, filter);
    }
    return chart;
  }

  private createDeviceLineGraph(data: IEndpointWrapper[], filter: IDropdownBase | undefined): any {
    const graphNumber: number = _.get(filter, 'value', 0);
    const catAxis: any = this.CommonGraphService.getBaseVariable(this.CommonGraphService.LINE_AXIS);
    const valueAxes: any = [this.CommonGraphService.getBaseVariable(this.CommonGraphService.AXIS)];
    valueAxes[0].integersOnly = true;
    valueAxes[0].stackType = 'regular';

    if (!data[graphNumber].balloon) {
      catAxis.gridColor = ChartColors.grayLightThree;
    }

    const chartCursor: any = this.CommonGraphService.getBaseVariable(this.CommonGraphService.CURSOR);
    chartCursor.valueLineAlpha = 1;
    chartCursor.valueLineEnabled = true;
    chartCursor.valueLineBalloonEnabled = true;
    chartCursor.cursorColor = ChartColors.grayLightTwo;

    const chartData: any = this.CommonGraphService.getBaseSerialGraph(data[graphNumber].graph, 0, valueAxes, this.deviceLineGraphs(data, filter), this.CommonGraphService.DATE, catAxis);
    chartData.numberFormatter = this.CommonGraphService.getBaseVariable(this.CommonGraphService.NUMFORMAT);
    chartData.chartCursor = chartCursor;
    chartData.autoMargins = true;
    return AmCharts.makeChart(this.devicesDiv, chartData);
  }

  private deviceLineGraphs(data: IEndpointWrapper[], filter: IDropdownBase | undefined): any[] {
    const graphNumber: number = _.get(filter, 'value', 0);
    const title: string = this.$translate.instant('registeredEndpoints.registeredEndpoints');
    let color: string = ChartColors.peopleBase;
    if (!data[0].balloon) {
      color = ChartColors.grayLightThree;
    }

    const graph: any = this.CommonGraphService.getBaseVariable(this.CommonGraphService.SINGLE_LINE);
    graph.title = title;
    graph.colorField = color;
    graph.lineColor = color;
    graph.valueField = 'totalRegisteredDevices';
    graph.balloonText = SparkGraphService.graphTextSpan + title + ' <span class="device-number">[[totalRegisteredDevices]] </span></span>';
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

      const chartData: any = this.CommonGraphService.getBasePieChart(data.dataProvider, balloonText, '65%', '30%', labelText, true, 'callCondition', 'percentage', this.CommonGraphService.COLOR, this.CommonGraphService.COLOR);
      chart = AmCharts.makeChart(this.metricsGraphDiv, chartData);
    }
    return chart;
  }
}
