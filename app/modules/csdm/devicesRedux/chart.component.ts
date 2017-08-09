import { Aggregation, BucketData, NamedAggregation, SearchResult } from '../services/csdmSearch.service';
import { List } from 'lodash';
import { IOnChangesObject } from 'angular';

class Chart implements ng.IComponentController {
  private currentAggregations: NamedAggregation[] = [];
  private selectedAggregation?: BucketHolder;
  private chart: AmCharts.AmChart;
  private baseChart = 'chartArea';
  public chartTitle: string;

  //bindings:
  public pieChartClicked: (e: { searchField: string, query: string }) => {};
  public searchResult?: SearchResult;

  /* @ngInject */
  constructor() {
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
    this.updateGraph(this.pickAggregate(this.currentAggregations, 'errorCodes'), 'key', 'docCount');
    this.setChartTitle(this.searchResult);
  }

  private setChartTitle(data?: SearchResult) {
    if (!data || !data.hits) {
      this.chartTitle = '';
      return;
    }
    this.chartTitle = 'Total:' + data.hits.total;
  }

  private updateGraph(data?: BucketHolder, titleField = 'name', valueField = 'value') {
    this.selectedAggregation = data;
    const chartData = {
      type: 'pie',
      startDuration: 0,
      titleField: titleField,
      valueField: valueField,
      // balloonText: chartOptions.balloonText,
      outlineThickness: 0,
      hoverAlpha: 0.5,
      labelRadius: 1,
      marginBottom: 40,
      marginLeft: 40,
      marginRight: 40,
      marginTop: 40,
      autoMargins: false,
      pullOutRadius: '1%',
      // titleField: 'name',
      // valueField: 'value',
      theme: 'light',
      allLabels: [],
      balloon: { enabled: false },
      fontSize: 10,
      legend: {
        enabled: false,
        align: 'center',
        forceWidth: true,
        switchable: false,
        valueText: '',
        markerSize: 8,
      },
      labelText: '[[title]]:[[value]]',
      dataProvider: data && data.buckets || [],
      listeners: [{
        event: 'clickSlice',
        method: (e) => {
          if (data) {
            // const search = data.bucketName + ':' + e.dataItem.title;
            this.pieChartClicked({ searchField: data.bucketName, query: e.dataItem.title });
            // this.currentBullet.text = (this.currentBullet.text ? this.currentBullet.text + ',' : '') + search;
            // // this.search = (this.search ? this.search + ',' : '') + search;
            // this.searchChanged2();
          }
        },
      }],
    };
    // const chartData = this.CommonMetricsGraphService.getDummyPieChart();
    this.chart = AmCharts.makeChart(this.baseChart, chartData);

  }

  private pickAggregate(aggregations: NamedAggregation[], bucketName?: string): BucketHolder {
    const buckets = _.chain(aggregations)
    // .map((a, k) => {
    //   return { bucketName: k, buckets: a.buckets };
    // })
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
  public templateUrl = 'modules/csdm/devicesRedux/chart.html';
}
