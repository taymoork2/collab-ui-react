import {
  IActiveUserData,
  ICallMetricsData,
  ICallMetricsLabels,
  IMediaQualityData,
  IPopulationData,
} from './partnerReportInterfaces';

export class GraphService {
  // Keys for base variables in CommonGraphService
  private AXIS: string = 'axis';
  private COLUMN: string = 'column';
  private CURSOR: string = 'cursor';
  private LEGEND: string = 'legend';
  private NUMFORMAT: string = 'numFormat';

  // AmChart variables
  private START: string = 'start';

  // Chart locators
  private ACTIVE_USERS_DIV: string = 'activeUsersChart';
  private MEDIA_QUALITY_DIV: string = 'mediaQualityChart';
  private ACTIVE_POP_DIV: string = 'userPopulationChart';
  private CALL_METRICS_DIV: string = 'callMetricsChart';

  // popover balloon text
  private activeUsersBalloonText: string;
  private popBalloonTextOne: string;
  private popBalloonTextTwo: string;
  private callMetricsBalloonText: string;
  private mediaBalloonPartOne: string = '<span class="graph-text-balloon graph-number-color">';
  private mediaBalloonPartTwo: string = ':  <span class="graph-number">[[totalDurationSum]]</span></span><br><span class="graph-text-balloon graph-number-color">';
  private mediaBalloonPartThree: string = ':  <span class="graph-number">[[';
  private mediaBalloonPartFour: string = ']]</span></span>';

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private chartColors,
    private CommonGraphService
  ) {
    // popover balloon texts with translations
    this.activeUsersBalloonText = '<span class="graph-text">' + $translate.instant('activeUsers.registeredUsers') + ' <span class="graph-number">[[totalRegisteredUsers]]</span></span><br><span class="graph-text">' + $translate.instant('activeUsers.active') + ' <span class="graph-number">[[percentage]]%</span></span>';
    this.popBalloonTextOne = '<span class="percent-label">' + $translate.instant('activeUserPopulation.averageLabel') + '</span><br><span class="percent-large">[[percentage]]%</span>';
    this.popBalloonTextTwo = '<span class="percent-label">' + $translate.instant('activeUserPopulation.averageLabel') + '<br>' + $translate.instant('activeUserPopulation.acrossCustomers') + '</span><br><span class="percent-large">[[overallPopulation]]%</span>';
    this.callMetricsBalloonText = '<div class="donut-hover-text">[[label]]<br>[[numCalls]] ' + $translate.instant('callMetrics.calls') + ' ([[percents]]%)</div>';
  }

  // Active User Graph functions
  public getActiveUsersGraph(data: Array<IActiveUserData>, chart) {
    if (data && data.length > 0 && chart) {
      chart.startDuration = 1;
      if (!data[0].balloon) {
        chart.startDuration = 0;
      }

      chart.dataProvider = data;
      chart.graphs = this.activeUserGraphs(data);
      chart.validateData();
    } else if (data && data.length > 0) {
      chart = this.createActiveUsersGraph(data);
    }
    return chart;
  }

  private createActiveUsersGraph(data: Array<IActiveUserData>) {
    let valueAxes = [this.CommonGraphService.getBaseVariable(this.AXIS)];
    valueAxes[0].integersOnly = true;
    valueAxes[0].minimum = 0;

    let catAxis = this.CommonGraphService.getBaseVariable(this.AXIS);
    catAxis.gridPosition = this.START;

    let startDuration = 1;
    if (!data[0].balloon) {
      startDuration = 0;
    }

    let chartData = this.CommonGraphService.getBaseSerialGraph(data, startDuration, valueAxes, this.activeUserGraphs(data), 'date', catAxis);
    chartData.numberFormatter = this.CommonGraphService.getBaseVariable(this.NUMFORMAT);
    chartData.legend = this.CommonGraphService.getBaseVariable(this.LEGEND);
    chartData.legend.labelText = '[[title]]';

    return AmCharts.makeChart(this.ACTIVE_USERS_DIV, chartData);
  }

  private activeUserGraphs(data: Array<IActiveUserData>) {
    const values = ['totalRegisteredUsers', 'activeUsers'];
    const titles = [this.$translate.instant('activeUsers.users'), this.$translate.instant('activeUsers.activeUsers')];
    let colors = [this.chartColors.brandSuccessLight, this.chartColors.brandSuccessDark];
    if (!data[0].balloon) {
      colors = [this.chartColors.grayLightFour, this.chartColors.grayLightThree];
    }
    let graphs: Array<any> = [];

    _.forEach(values, (value, index) => {
      graphs.push(this.CommonGraphService.getBaseVariable(this.COLUMN));
      graphs[index].title = titles[index];
      graphs[index].fillColors = colors[index];
      graphs[index].colorField = colors[index];
      graphs[index].legendColor = colors[index];
      graphs[index].valueField = value;
      graphs[index].balloonText = this.activeUsersBalloonText;
      graphs[index].showBalloon = data[0].balloon;
      graphs[index].clustered = false;
    });

    return graphs;
  }

  // Media Quality Graph functions
  public getMediaQualityGraph(data: Array<IMediaQualityData>, chart) {
    if (data && data.length > 0 && chart) {
      chart.startDuration = 1;
      if (!data[0].balloon) {
        chart.startDuration = 0;
      }

      chart.dataProvider = data;
      chart.graphs = this.mediaQualityGraphs(data);
      chart.validateData();
    } else if (data && data.length > 0) {
      chart = this.createMediaQualityGraph(data);
    }
    return chart;
  }

  private createMediaQualityGraph(data: Array<IMediaQualityData>) {
    let catAxis = this.CommonGraphService.getBaseVariable(this.AXIS);
    catAxis.gridPosition = this.START;

    let valueAxes = [this.CommonGraphService.getBaseVariable(this.AXIS)];
    valueAxes[0].totalColor = this.chartColors.brandWhite;
    valueAxes[0].integersOnly = true;
    valueAxes[0].minimum = 0;
    valueAxes[0].title = this.$translate.instant('mediaQuality.minutes');

    let startDuration = 1;
    if (!data[0].balloon) {
      startDuration = 0;
    }

    let chartData = this.CommonGraphService.getBaseSerialGraph(data, startDuration, valueAxes, this.mediaQualityGraphs(data), 'date', catAxis);
    chartData.numberFormatter = this.CommonGraphService.getBaseVariable(this.NUMFORMAT);
    chartData.legend = this.CommonGraphService.getBaseVariable(this.LEGEND);
    chartData.legend.reversedOrder = true;

    return AmCharts.makeChart(this.MEDIA_QUALITY_DIV, chartData);
  }

  private mediaQualityGraphs(data: Array<IMediaQualityData>) {
    const totalCalls = this.$translate.instant('mediaQuality.totalCalls');
    const values = ['totalDurationSum', 'partialSum', 'poorQualityDurationSum'];
    const titles = ['mediaQuality.good', 'mediaQuality.fair', 'mediaQuality.poor'];
    let colors = [this.chartColors.primaryColorBase, this.chartColors.brandWarning, this.chartColors.brandDanger];
    if (!data[0].balloon) {
      colors = [this.chartColors.grayLightFour, this.chartColors.grayLightThree, this.chartColors.grayLightTwo];
    }
    let graphs: Array<any> = [];

    for (let i = 0; i < values.length; i++) {
      let title = this.$translate.instant(titles[i]);

      graphs.push(this.CommonGraphService.getBaseVariable(this.COLUMN));
      graphs[i].title = this.$translate.instant(titles[i]);
      graphs[i].fillColors = colors[i];
      graphs[i].colorField = colors[i];
      graphs[i].valueField = values[i];
      graphs[i].legendColor = colors[i];
      graphs[i].showBalloon = data[0].balloon;
      graphs[i].balloonText = this.mediaBalloonPartOne + totalCalls + this.mediaBalloonPartTwo + title + this.mediaBalloonPartThree + values[i] + this.mediaBalloonPartFour;
      graphs[i].clustered = false;
    }

    return graphs;
  }

  // Active User Population Graph functions
  public getActiveUserPopulationGraph(data: Array<IPopulationData>, chart) {
    if (data && data.length > 0 && chart) {
      chart.startDuration = 1;
      if (!data[0].balloon) {
        chart.startDuration = 0;
      }

      chart.valueAxes[0].maximum = 100;
      if (data[0].percentage > data[0].overallPopulation && data[0].percentage > 100) {
        chart.valueAxes[0].maximum = data[0].percentage;
      } else if (data[0].overallPopulation > 100) {
        chart.valueAxes[0].maximum = data[0].overallPopulation;
      }

      chart.dataProvider = this.modifyPopulation(data);
      chart.graphs = this.populationGraphs(data);
      chart.validateData();
    } else if (data && data.length > 0) {
      chart = this.createActiveUserPopulationGraph(data);
    }
    return chart;
  }

  private createActiveUserPopulationGraph(data: Array<IPopulationData>) {
    data = this.modifyPopulation(data);
    let catAxis = this.CommonGraphService.getBaseVariable(this.AXIS);
    catAxis.axisAlpha = 0;
    catAxis.fontSize = 15;
    catAxis.autoWrap = true;
    catAxis.labelColorField = 'labelColorField';

    let valueAxes = [this.CommonGraphService.getBaseVariable(this.AXIS)];
    valueAxes[0].autoGridCount = false;
    valueAxes[0].minimum = 0;
    valueAxes[0].maximum = 100;
    valueAxes[0].unit = '%';
    if (data[1].percentage > data[0].overallPopulation && data[1].percentage > 100) {
      valueAxes[0].maximum = data[1].percentage;
    } else if (data[0].overallPopulation > 100) {
      valueAxes[0].maximum = data[0].overallPopulation;
    }

    let startDuration = 1;
    if (!data[0].balloon) {
      startDuration = 0;
    }

    let chartData = this.CommonGraphService.getBaseSerialGraph(data, startDuration, valueAxes, this.populationGraphs(data), 'customerName', catAxis);
    chartData.marginBottom = 60;
    chartData.chartCursor = this.CommonGraphService.getBaseVariable(this.CURSOR);

    return AmCharts.makeChart(this.ACTIVE_POP_DIV, chartData);
  }

  private populationGraphs(data: Array<IPopulationData>) {
    let color = this.chartColors.primaryColorBase;
    if (!data[0].balloon) {
      color = this.chartColors.grayLightThree;
    }

    let graph: any = this.CommonGraphService.getBaseVariable(this.COLUMN);
    graph.fillColors = 'color';
    graph.colorField = 'color';
    graph.fontSize = 26;
    graph.valueField = 'percentage';
    graph.columnWidth = 0.8;
    graph.balloonText = this.popBalloonTextOne;
    graph.showBalloon = data[0].balloon;

    let graphs: Array<any> = [graph, {
      type: 'step',
      valueField: 'overallPopulation',
      lineThickness: 2,
      lineColor: color,
      balloonColor: this.chartColors.grayLightTwo,
      balloonText: this.popBalloonTextTwo,
      showBalloon: data[0].balloon,
      animationPlayed: true,
    }];

    return graphs;
  }

  private modifyPopulation(data: Array<IPopulationData>): Array<IPopulationData> {
    if (data.length >= 1) {
      _.forEach(data, (item: IPopulationData) => {
        if (item.balloon) {
          if ((item.percentage - item.overallPopulation) >= 0) {
            item.color = this.chartColors.brandInfo;
          } else {
            item.color = this.chartColors.brandDanger;
          }
        }
      });

      if (data.length === 1) {
        let dummy: IPopulationData = {
          customerName: undefined,
          percentage: 0,
          overallPopulation: data[0].overallPopulation,
          balloon: data[0].balloon,
          labelColorField: this.chartColors.brandWhite,
          color: this.chartColors.brandWhite,
        };
        data.unshift(_.clone(dummy));
        data.push(_.clone(dummy));
      }
    }

    return data;
  }

  // Call Metrics Graph Functions
  public getCallMetricsDonutChart(data: ICallMetricsData, chart) {
    if (data && chart) {
      chart.balloonText = this.callMetricsBalloonText;
      chart.textColor = this.chartColors.grayDarkThree;
      if (data.dummy) {
        chart.balloonText = '';
        chart.textColor = this.chartColors.brandWhite;
      }

      chart.dataProvider = data.dataProvider;
      chart.allLabels = this.getCallMetricsLabels(data.labelData, data.dummy);
      chart.validateNow(true, false);
    } else if (data) {
      chart = this.createCallMetricsDonutChart(data);
    }

    return chart;
  }

  private createCallMetricsDonutChart(data: ICallMetricsData) {
    let balloonText = this.callMetricsBalloonText;
    let textColor = this.chartColors.grayDarkThree;
    if (data.dummy) {
      balloonText = '';
      textColor = this.chartColors.brandWhite;
    }

    let chartData = this.CommonGraphService.getBasePieChart(data.dataProvider, balloonText, '75%', '30%', '[[percents]]%<br>[[label]]', true, 'label', 'value', 'color', textColor);
    chartData.color = textColor;
    chartData.labelColorField = textColor;
    chartData.allLabels = this.getCallMetricsLabels(data.labelData, data.dummy);
    chartData.color = textColor;

    return AmCharts.makeChart(this.CALL_METRICS_DIV, chartData);
  }

  private getCallMetricsLabels(data: ICallMetricsLabels, dummy: boolean) {
    if (!dummy) {
      return [{
        align: 'center',
        size: '42',
        text: data.numTotalCalls,
        y: 112,
      }, {
        align: 'center',
        size: '16',
        text: this.$translate.instant('callMetrics.totalCalls'),
        y: 162,
      }, {
        align: 'center',
        size: '30',
        text: data.numTotalMinutes,
        y: 197,
      }, {
        align: 'center',
        size: '16',
        text: this.$translate.instant('callMetrics.totalCallMinutes'),
        y: 232,
      }];
    } else {
      return [];
    }
  }
}

angular
  .module('Core')
  .service('GraphService', GraphService);
