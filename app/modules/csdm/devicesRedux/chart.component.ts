import { List } from 'lodash';
import { IOnChangesObject } from 'angular';
import { Aggregation, BucketData, NamedAggregation, SearchResult } from '../services/search/searchResult';
import { FieldQuery, SearchElement } from '../services/search/searchElement';

class Chart implements ng.IComponentController {
  private currentAggregations: NamedAggregation[] = [];
  private selectedAggregation?: BucketHolder;
  private chart: AmCharts.AmChart;
  private baseChart = 'chartArea';
  public chartTitle: string;

  private Colors = require('modules/core/config/colors').Colors;

  //bindings:
  public pieChartClicked: (e: { searchElement: SearchElement }) => {};
  public searchResult?: SearchResult;

  /* @ngInject */
  constructor(private $translate) {
  }

  public $onInit() {

  }

  public $onChanges(onChangesObj: IOnChangesObject) {
    onChangesObj = onChangesObj;
    if (!this.searchResult) {
      return;
    }
    this.currentAggregations = _.map(this.searchResult.aggregations, (a, k) => {
      return new NamedAggregation(k, a);
    });
    this.updateGraph(this.pickAggregate(this.currentAggregations, 'connectionStatus'), 'key', 'docCount');
    this.setChartTitle(this.searchResult);
  }

  private setChartTitle(data?: SearchResult) {
    if (!data || !data.hits) {
      this.chartTitle = '';
      return;
    }
    this.chartTitle = this.$translate.instant('spacesPage.chart.total', { totalValue: data.hits.total });
  }

  private updateGraph(data?: BucketHolder, _titleField = 'name', valueField = 'value') {
    if (data) {
      data = this.fillBlankValues(data);
      this.setChartLabelsAndColors(data);
    } else {

    }
    this.selectedAggregation = data;
    const chartData = {
      type: 'pie',
      startDuration: 0,
      titleField: 'name',
      valueField: valueField,
      colorField: 'color',
      outlineThickness: 2,
      outlineColor: '#ffffff',
      hoverAlpha: 0.5,
      labelRadius: 1,
      marginBottom: 0,
      marginLeft: 0,
      marginRight: 0,
      marginTop: 0,
      autoMargins: false,
      pullOutRadius: '1%',
      innerRadius: '32%',
      theme: 'light',
      allLabels: [],
      balloon: { enabled: false },
      fontSize: 10,
      fontFamily: 'CiscoSansTT Light',
      legend: {
        divId: 'searchlegend',
        enabled: true,
        align: 'left',
        position: 'right',
        forceWidth: true,
        switchable: false,
        valueText: '[[value]]',
        markerSize: 8,
        markerType: 'circle',
        labelWidth: 120,
        valueWidth: 12,
        textClickEnabled: true,
        autoMargins: false,
      },
      labelText: '[[title]]:[[value]]',
      labelsEnabled: false,
      dataProvider: data && data.buckets || [],
      listeners: [{
        event: 'clickSlice',
        method: (e) => {
          if (data) {
            this.pieChartClicked({ searchElement: new FieldQuery(e.dataItem.dataContext.key, data.bucketName, FieldQuery.QueryTypeExact) });
          }
        },
      }],
    };
    this.chart = AmCharts.makeChart(this.baseChart, chartData);
  }

  private colors = {
    connected: this.Colors['$color-green-base'], //this.ChartColors.ctaBase,
    disconnected: this.Colors['$color-red-base'], //this.ChartColors.negativeBase,
    offline_expired: this.Colors['$color-red-darker'], //this.ChartColors.negativeDarker,
    connected_with_issues: this.Colors['$color-yellow-base'], //this.ChartColors.attentionBase,
  };

  private setChartLabelsAndColors(data: BucketHolder) {
    _.each(data.buckets, (bucket: { key: string, name: string, color: string }) => {
      bucket.name = this.$translate.instant(`CsdmStatus.${data.bucketName}.${(bucket.key || '').toUpperCase()}`);
      bucket.color = this.colors[bucket.key];
    });
  }

  private fillBlankValues(data: BucketHolder): BucketHolder {
    switch (data.bucketName)  {
      case 'connectionStatus':
        return this.fillConnectionStatusBlanks(data);
      default:
        return data;
    }
  }

  private fillConnectionStatusBlanks(data: BucketHolder): BucketHolder {
    const dataKeyed = _.keyBy(data.buckets, 'key');
    const merged = _.merge({
      connected_with_issues: { key: 'connected_with_issues', docCount: 0 },
      offline_expired: { key: 'offline_expired', docCount: 0 },
      disconnected: { key: 'disconnected', docCount: 0 },
      connected: { key: 'connected', docCount: 0 },
    }, dataKeyed);
    data.buckets =  _.values(merged);
    return data;
  }

  private pickAggregate(aggregations: NamedAggregation[], bucketName?: string): BucketHolder {
    const buckets = _.chain(aggregations)
      .orderBy((a: Aggregation) => a.buckets.length, 'desc')
      .value();

    if (bucketName) {
      return _.find(buckets, (bucket: BucketHolder) => bucket.bucketName === bucketName);
    } else {
      return _.head(buckets);
    }
  }

  public showAggregate(name: string) {
    this.updateGraph(this.pickAggregate(this.currentAggregations, name), 'key', 'docCount');
  }

  public cycleAggregateLeft() {
    if (!this.selectedAggregation) {
      return;
    }
    const selected = this.selectedAggregation;
    const i = _.findIndex(this.currentAggregations, a => a.bucketName === selected.bucketName);
    this.showAggregate(this.currentAggregations[i - 1 < 0 ? this.currentAggregations.length - 1 : i - 1].bucketName);
  }

  public cycleAggregateRight() {
    if (this.selectedAggregation) {
      const selected = this.selectedAggregation;
      const i = _.findIndex(this.currentAggregations, a => a.bucketName === selected.bucketName);
      this.showAggregate(this.currentAggregations[(i + 1) % this.currentAggregations.length].bucketName);
    }
  }
}

class BucketHolder {
  public bucketName: string;
  public buckets: List<BucketData>;
}

export class ChartComponent implements ng.IComponentOptions {
  public controller = Chart;
  public bindings = {
    searchResult: '<',
    pieChartClicked: '&',
  };
  public controllerAs = 'chart';
  public template = require('modules/csdm/devicesRedux/chart.html');
}
