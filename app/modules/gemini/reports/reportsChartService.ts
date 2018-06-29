const CHARTS = require('./charts.config');

export class ReportsChartService {
  private URL: string;
  public featureName: string = 'partner.service.ccaReports';

  /* @ngInject */
  constructor(
    private UrlConfig,
    private $http: ng.IHttpService,
  ) {
    this.URL = `${this.UrlConfig.getGeminiUrl()}`;
  }

  public getFilterData() {
    const url = `${this.URL}scorecard/accounts`;
    return this.$http.get(url).then(this.extractData);
  }

  public getkPIData(data) {
    const _url = `${this.URL}scorecard/growth`;
    return this.$http.post(_url, data).then(this.extractData);
  }

  public getChartData(url, data) {
    const _url = `${this.URL}scorecard/` + url;
    return this.$http.post(_url, data).then(this.extractData);
  }

  public AmchartsMakeChart(div_id, opts) {
    let data: any = {};
    const type = opts.type;
    if (!_.size(opts.chart)) {
      return ;
    }
    if (type === 'line') {
      data = this.multiLinesStdOpts(opts);
    } else if (type === 'columns' ) {
      data = this.participantsHostsOpts(opts);
    } else {
      data = this.stackedColumnStdOpts(opts);
    }
    if (_.includes(div_id, 'large_')) {
      const largeOption = {
        export: { enabled: true },
        chartScrollbar: {},
        legend: {
          valueWidth: 0,
          markerSize: 10,
          position: 'bottom',
          align: 'center',
          horizontalGap: 10,
          equalWidths: false,
          useGraphSettings: true,
        },
      };
      _.assignIn(data, largeOption);
      _.assignIn(data.categoryAxis, { axisAlpha: 0.1 });
    }
    _.forEach(data.graphs, (item) => {
      const key = _.toUpper(_.replace(_.trim(item.valueField), /([,]+|\s+)/g, ''));
      const color = CHARTS.color[key];
      _.set(item, 'fillColors', color ? color : CHARTS.color.OTHER);
    });
    const chartData = (type === 'test' || div_id === 'unitTest') ? '' : AmCharts.makeChart(div_id, data);
    return chartData;
  }

  private stdOpts(chartdata, type) {
    const opts = this.getBasicChartOptions(chartdata);
    const oldGroup = _.keys(chartdata.chart[0]);
    const valueGroup = _.without(oldGroup, 'point', 'time');
    const graphsGroup = _.map(valueGroup, (item) => this.generateGraph(item, type));
    if (_.size(valueGroup) <= 12 && (type === 'stackedColumnStdOpts')) {
      _.assignIn(opts, {legend: {
        valueWidth: 0,
        markerSize: 10,
        position: 'bottom',
        align: 'center',
        horizontalGap: 10,
        equalWidths: false,
        useGraphSettings: true,
      }});
    }
    return _.assignIn(opts, { graphs: graphsGroup });
  }

  public stackedColumnStdOpts(chartdata) {
    const opts = this.stdOpts(chartdata, 'stackedColumnStdOpts');
    _.assignIn(opts.categoryAxis, { gridAlpha: 0 });
    _.assignIn(opts.valueAxes[0], {
      stackType: 'regular',
      axisAlpha: 0.2,
      gridAlpha: 0,
    });
    return opts;
  }

  public multiLinesStdOpts(chartdata) {
    const opts = this.stdOpts(chartdata, 'multiLinesStdOpts');
    const others = {
      chartCursor: { cursorPosition: 'mouse' },
      legend: {
        valueWidth: 0,
        markerSize: 5,
        position: 'bottom',
        align: 'center',
        horizontalGap: 5,
        equalWidths: false,
        useGraphSettings: true,
      },
    };
    _.assignIn(opts, others);
    _.assignIn(opts.valueAxes[0], { gridAlpha: 0 });
    return opts;
  }

  public participantsHostsOpts(chartdata) {
    const opts = this.stdOpts(chartdata, 'participantsHostsOpts');
    const others = {
      rotate: false,
      trendLines: [],
      guides: [],
      allLabels: [],
      balloon: {},
      titles: [],
      legend: {
        valueWidth: 0,
        markerSize: 10,
        position: 'bottom',
        align: 'center',
        horizontalGap: 10,
        equalWidths: false,
        useGraphSettings: true,
      },
    };

    _.assignIn(opts, others);
    _.assignIn(opts.valueAxes[0], { axisAlpha: 0.2, gridAlpha: 0.1 });
    return opts;
  }

  public getBasicChartOptions(chartdata) {
    return {
      type: 'serial',
      categoryField: 'time',
      categoryAxis: {
        axisAlpha: 0.2,
        labelOffset: 0,
        position: 'left',
        labelRotation: 45,
        gridPosition: 'start',
        centerLabelOnFullPeriod: false,
      },
      export: { enabled: true },
      valueAxes: [{
        position: 'left',
        axisAlpha: 0,
      }],
      dataProvider : chartdata.chart,
    };
  }

  private  generateGraph(type, typecall) {
    let multiple = {};
    const baseGraph = {
      balloonText : type + ': [[value]]\n[[point]]',
      title : type,
      valueField : type,
      type : 'column',
      fillAlphas: 0.8,
      lineAlpha: 0,
    };

    if (typecall === 'multiLinesStdOpts') {
      multiple = {
        type: 'line',
        fillAlphas: 0,
        lineAlpha: 1,
      };
    }
    return _.assignIn(baseGraph, multiple);
  }

  public smallToLarge(div_id, cachedata) {
    this.AmchartsMakeChart(div_id, cachedata);
  }

  private extractData(response) {
    return _.get(response, 'data');
  }

  public exportCSV(data) {
    if (!_.size(data)) {
      return ;
    }
    let headerLine: any;
    let exportedLines: any[] = [];
    const lines = data;
    _.forEach(lines, (item) => {
      if (!_.size(headerLine) && _.size(item.data.chart)) {
        const headerL = _.map(item.data.chart, ite => _.get(ite, 'time'));
        headerLine = _.concat(['\t'], headerL);
      }
      exportedLines = _.concat(exportedLines, this.formatData(item));
    });
    return _.concat([headerLine], exportedLines);
  }

  private formatData(data) {
    const row = {};
    const total = {};
    const unit = {
      THOUSANDS: 1000,
      MILLIONS: 1000 * 1000,
      BILLION : 1000 * 1000 * 1000,
      TILLION : 1000 * 1000 * 1000 * 1000,
      QUADRILLION : 1000 * 1000 * 1000 * 1000 * 1000,
      QUINTILLION : 1000 * 1000 * 1000 * 1000 * 1000 * 1000,
      SEXTILLION : 1000 * 1000 * 1000 * 1000 * 1000 * 1000 * 1000,
      SEPTILLION : 1000 * 1000 * 1000 * 1000 * 1000 * 1000 * 1000 * 1000,
    };
    const number = _.get(unit, data.data.unit, 1);
    _.forEach(data.data.chart, (item) => {
      total[item.time] = 0;
      _.forEach(item, (val, key: string) => {
        if (key === 'point' || key === 'time') {
          return true;
        }

        if (!_.get(row, key)) {
          _.set(row, key, [key]);
        }
        total[item.time] += _.parseInt(val) * number;
        row[key].push(val * number);
      });
    });
    const totalArr = _.concat([data.title], _.values(total));
    return _.concat([totalArr], _.values(row));
  }

}
