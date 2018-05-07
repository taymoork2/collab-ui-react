import { List } from 'lodash';
import { IOnChangesObject } from 'angular';
import { Aggregation, IBucketData, NamedAggregation, SearchResult } from '../services/search/searchResult';
import { FieldQuery, SearchElement } from '../services/search/searchElement';
import { DeviceHelper } from '../services/csdmHelper';
import { SearchObject } from '../services/search/searchObject';
import { CsdmAnalyticsValues, ICsdmAnalyticHelper } from '../services/csdm-analytics-helper.service';

class Chart implements ng.IComponentController {
  private currentAggregations: NamedAggregation[] = [];
  private selectedAggregation?: BucketHolder;
  public chart: AmCharts.AmChart;
  public legend: IBuckedDataChart[] = [];
  private baseChart = 'chartArea';


  private Colors = require('modules/core/config/colors').Colors;

  //bindings:
  public pieChartClicked: (e: { searchElement: SearchElement }) => {};
  public searchResult?: SearchResult;
  public searchObject?: SearchObject;

  /* @ngInject */
  constructor(private $translate, private CsdmAnalyticsHelper: ICsdmAnalyticHelper) {
  }

  public $onInit() {

  }

  public $onChanges(_onChangesObj: IOnChangesObject) {
    if (!this.searchResult) {
      return;
    }
    this.currentAggregations = _.map(this.searchResult.aggregations, (a, k) => {
      return new NamedAggregation(k, a);
    });
    this.updateGraph(this.pickAggregate(this.currentAggregations, 'connectionStatus'), this.searchResult.hits.total,
      'key', 'docCount');
  }


  private updateGraph(incommingData?: BucketHolder, totalHits: number = 0, _titleField = 'name', valueField = 'value') {
    if (!incommingData) {
      incommingData = { bucketName: 'connectionStatus', buckets: [{ key: 'no_hits', docCount: 1 }] };
    } else if (_.isEmpty(incommingData.buckets)) {
      incommingData.buckets = [{ key: 'no_hits', docCount: 1 }];
    }
    const transformedData: BuckedDataChartHolder = this.fillBlankValues(incommingData);
    this.setChartLabelsAndColors(transformedData);
    this.selectedAggregation = transformedData;
    this.updateLegend(transformedData);
    const chartData = {
      type: 'pie',
      addClassNames: true,
      startDuration: 0,
      titleField: 'name',
      valueField: valueField,
      colorField: 'color',
      visibleInLegendField: 'visibleLegend',
      outlineThickness: 2,
      outlineColor: totalHits === 0 ? this.Colors['$gray-light-4'] : this.Colors['$color-white'],
      hoverAlpha: totalHits === 0 ? 1 : 0.5,
      labelRadius: 1,
      marginBottom: 0,
      marginLeft: 0,
      marginRight: 0,
      marginTop: 0,
      autoMargins: false,
      pullOutRadius: '0%',
      innerRadius: '82%',
      theme: 'light',
      allLabels: [],
      balloon: { enabled: false },
      fontSize: 10,
      fontFamily: 'CiscoSansTT Light',
      legend: {
        enabled: false,
      },
      labelText: '[[title]]:[[value]]',
      labelsEnabled: false,
      dataProvider: incommingData && incommingData.buckets || [],
      listeners: [{
        event: 'clickSlice',
        method: (e) => {
          if (incommingData) {
            const fieldQuery = new FieldQuery(e.dataItem.dataContext.key, incommingData.bucketName,
              FieldQuery.QueryTypeExact);
            this.pieChartClicked({ searchElement: fieldQuery });
            this.CsdmAnalyticsHelper.trackSuggestionAction(CsdmAnalyticsValues.SLICE, fieldQuery);
          }
        },
      }],
    };
    this.chart = AmCharts.makeChart(this.baseChart, chartData);
  }

  private colors = {
    connected: this.Colors['$color-green-base'],
    disconnected: this.Colors['$color-red-base'],
    offline_expired: this.Colors['$gray'],
    connected_with_issues: this.Colors['$color-yellow-base'],
    no_hits: '#FAFAFB',
  };

  public legendClick(legend: IBuckedDataChart) {
    const fieldQuery = new FieldQuery(legend.key, legend.bucketName, FieldQuery.QueryTypeExact);
    this.pieChartClicked({ searchElement: fieldQuery });
    this.CsdmAnalyticsHelper.trackSuggestionAction(CsdmAnalyticsValues.LEGEND, fieldQuery);
  }

  private updateLegend(data: BuckedDataChartHolder) {
    this.legend = _
      .chain(data.buckets)
      .filter('visibleLegend')
      .map((bucket: IBuckedDataChart) => {
        return {
          text: bucket.name,
          key: bucket.key,
          bucketName: data.bucketName,
          docCount: bucket.docCount,
          color: DeviceHelper.translateConnectionStatusToColor(_.toUpper(bucket.key)),
          selected: !!(this.searchObject && this.searchObject.containsElement(
            new FieldQuery(bucket.key, data.bucketName, FieldQuery.QueryTypeExact))),
        };
      }).value();
  }

  private setChartLabelsAndColors(data: BucketHolder) {
    _.each(data.buckets, (bucket: { key: string, name: string, color: string, visibleLegend: boolean }) => {
      bucket.name = this.$translate.instant(`CsdmStatus.${data.bucketName}.${_.toUpper(bucket.key)}`);
      bucket.color = this.colors[bucket.key];
      bucket.visibleLegend = bucket.key !== 'no_hits';
    });
  }

  private fillBlankValues(data: BucketHolder): BuckedDataChartHolder {
    switch (data.bucketName) {
      case 'connectionStatus':
        return this.fillConnectionStatusBlanks(data);
      default:
        return { bucketName: data.bucketName, buckets: data.buckets };
    }
  }

  private fillConnectionStatusBlanks(data: BucketHolder): BuckedDataChartHolder {
    const dataKeyed = _.keyBy(data.buckets, 'key');
    const merged = _.merge({
      connected_with_issues: { key: 'connected_with_issues', docCount: 0 },
      offline_expired: { key: 'offline_expired', docCount: 0 },
      disconnected: { key: 'disconnected', docCount: 0 },
      connected: { key: 'connected', docCount: 0 },
    }, dataKeyed);
    data.buckets = _.values(merged);
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
    this.updateGraph(
      this.pickAggregate(this.currentAggregations, name),
      this.searchResult && this.searchResult.hits.total || 0,
      'key',
      'docCount');
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
  public buckets: List<IBucketData>;
}

class BuckedDataChartHolder {
  public bucketName: string;
  public buckets: List<IBuckedDataChart>;
}

interface IBuckedDataChart extends IBucketData {
  name?: string;
  bucketName?: string;
  color?: string;
  visibleLegend?: boolean;
  selected?: boolean;
}

export class ChartComponent implements ng.IComponentOptions {
  public controller = Chart;
  public bindings = {
    searchResult: '<',
    pieChartClicked: '&',
    searchObject: '<',
  };
  public controllerAs = 'chart';
  public template = require('modules/csdm/devicesRedux/chart.html');
}
