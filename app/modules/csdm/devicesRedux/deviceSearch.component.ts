import {
  Aggregation, Aggregations, CsdmSearchService, SearchObject,
  SearchResult,
} from '../services/csdmSearch.service';
import head = require('lodash/fp/head');
import map = require('lodash/fp/map');
import orderBy = require('lodash/fp/orderBy');
import { Device } from '../services/deviceSearchConverter';

export class DeviceSearch implements ng.IComponentController {

  private searchResultChanged: any;
  private searchChanged: any;
  public search: string;
  private baseChart = 'chartArea';
  private chart: any;
  public chartTitle: string;
  public searchResult: Device[];
  public searchField;
  public searchObject;
  /* @ngInject */
  constructor(private CsdmSearchService: CsdmSearchService) {

  }

  public $onInit(): void {
    this.performSearch('');
  }

  private updateSearchResult(devices?: Device[]) {
    this.searchResultChanged({ result: devices });
  }

  private setChartTitle(data?: SearchResult) {
    if (!data || !data.hits) {
      this.chartTitle = '';
      return;
    }
    this.chartTitle = 'Total:' + data.hits.total;
  }

  private updateGraph(data?: Aggregation, titleField = 'name', valueField = 'value') {
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
      dataProvider: data,
    };
    // const chartData = this.CommonMetricsGraphService.getDummyPieChart();
    this.chart = AmCharts.makeChart(this.baseChart, chartData);

  }

  public searchChanged2() {
    this.performSearch(this.search);
    this.searchChanged({ search: this.search });
  }

  private pickAggregate(aggregations: Aggregations) {
    return _.flowRight(
      head,
      map('buckets'),
      orderBy((a: Aggregation) => a.buckets.length, 'desc'))(aggregations);
  }

  private performSearch(search: string) {
    this.CsdmSearchService.search(SearchObject.create(search)).then((response) => {
      if (response && response.data) {
        this.updateGraph(this.pickAggregate(response.data.aggregations), 'key', 'docCount');
        this.setChartTitle(response.data);
        this.updateSearchResult(response.data.hits.hits);
        return;
      }
      this.updateGraph();
      this.setChartTitle();
      this.updateSearchResult();
    });
  }
}

export class DeviceSearchComponent implements ng.IComponentOptions {
  public controller = DeviceSearch;
  public bindings = {
    search: '=',
    searchResultChanged: '&',
    searchObject: '=',
    searchChanged: '&',
    clearSearch: '&',
  };
  public controllerAs = 'dctrl';
  public templateUrl = 'modules/csdm/devicesRedux/deviceSearch.tpl.html';
}
