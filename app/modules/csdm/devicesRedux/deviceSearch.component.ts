import {
  Aggregation, Aggregations, BucketData, CsdmSearchService, SearchFields, SearchObject,
  SearchResult,
} from '../services/csdmSearch.service';
import { Device } from '../services/deviceSearchConverter';
import List = _.List;

export class DeviceSearch implements ng.IComponentController {

  private searchResultChanged: any;
  private searchChanged: (e: { search: SearchObject }) => {};
  public search: string;
  private baseChart = 'chartArea';
  private chart: any;
  public chartTitle: string;
  public searchResult: Device[];
  public searchField: string;
  private currentSearchObject: SearchObject;
  public currentBullet: Bullet;
  public searchObject: SearchObject;
  private currentAggregations: Aggregations;
  /* @ngInject */
  constructor(private CsdmSearchService: CsdmSearchService) {
    this.currentSearchObject = SearchObject.create('');
    this.currentBullet = new Bullet(this.currentSearchObject);
  }

  public $onInit(): void {
    this.performSearch(SearchObject.create(''));
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

  private updateGraph(data?: BucketHolder, titleField = 'name', valueField = 'value') {
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
            const search = data.bucketName + ':' + e.dataItem.title;
            this.currentBullet.text = (this.currentBullet.text ? this.currentBullet.text + ',' : '') + search;
            // this.search = (this.search ? this.search + ',' : '') + search;
            this.searchChanged2();
          }
        },
      }],
    };
    // const chartData = this.CommonMetricsGraphService.getDummyPieChart();
    this.chart = AmCharts.makeChart(this.baseChart, chartData);

  }

  public searchChanged2() {
    // const prev = (this.search || '');
    // const searchField = (this.searchField || '');
    // // if(prev.length > 0 && searchField> 0) {
    // let s = prev;
    // if (searchField.length > 0) {
    //   s = prev.length > 0 ? prev + ',' + searchField : searchField;
    // }
    // const search = SearchObject.create(s);
    const search = _.cloneDeep(this.currentSearchObject);

    this.performSearch(search); //TODO avoid at now
    // this.searchObject = search;
    this.searchChanged({ search: search });
  }

  private pickAggregate(aggregations: Aggregations, bucketName?: string): BucketHolder {
    const buckets = _.chain(aggregations)
      .map((a, k) => {
        return { bucketName: k, buckets: a.buckets };
      })
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

  private performSearch(search: SearchObject) {
    this.CsdmSearchService.search(search).then((response) => {
      if (response && response.data) {
        this.currentAggregations = response.data.aggregations;
        this.updateGraph(this.pickAggregate(this.currentAggregations, 'errorCodes'), 'key', 'docCount');
        this.setChartTitle(response.data);
        this.updateSearchResult(response.data.hits.hits);
        return;
      }
      this.updateGraph();
      this.setChartTitle();
      this.updateSearchResult();
    });
  }

  public getTokens() {
    return _.filter(this.currentSearchObject.tokenizedQuery, (t) => !t.active);
  }

  // public getFinishedTokens() {
  //   return _.
  //   chain(this.currentSearchObject.tokenizedQuery)
  //     .map((v,k)=>{return {}})
  //   _.filter(this.currentSearchObject.tokenizedQuery, (__, k) => this.currentBullet.isCurrentField(k || ''));
  // }
}

class BucketHolder {
  public bucketName: string;
  public buckets: List<BucketData>;
}

class Bullet {
  private _text = '';
  public searchField = '';
  public active = false;

  get searchfieldWithPrefix() {
    return this.searchField.length > 0 ? this.searchField + ':' : this.searchField;
  }

  get text(): string {
    return this._text;
  }

  set text(value: string) {
    const tokens = Bullet.createTokens(this.searchfieldWithPrefix + (value || ''));
    const token = tokens.pop();
    if (!token) {
      return;
    }
    tokens.forEach((t) => {
      this.searchObject.setTokenizedQuery(t.searchField, t.query, false);
    });

    if (token.valid) {
      this._text = token.query;
      this.searchField = token.searchField;
      this.active = true;
      const anyField = this.searchObject.tokenizedQuery[SearchFields[SearchFields.any]];
      if (anyField && anyField.active && token.searchField.search(anyField.query) >= 0) {
        this.searchObject.removeToken(anyField.searchField);
      }
      this.searchObject.setTokenizedQuery(token.searchField, token.query, true);
    } else {
      this.searchField = '';
      this._text = token.query || '';
      if (tokens.length === 0 || this._text.length > 0) {
        this.searchObject.setTokenizedQuery('any', token.query, true);
      }
    }
  }

  constructor(private searchObject: SearchObject) {
  }

  public static createTokens(search: string) {
    const splitted = _.split(search, ',');
    const token = _.map(splitted, (s) => Bullet.createToken(s));
    return token;
  }

  public static createToken(search: string): { searchField: string, query: string, valid: boolean } {
    const splitted = _.split(search, ':');
    if (splitted.length === 2) {
      if (_.some(_.keys(SearchObject.SearchFields)), (a) => splitted === a) {
        return { searchField: splitted[0], query: splitted[1], valid: true };
      }
      return { searchField: SearchFields[SearchFields.any], query: splitted[1], valid: false };
    }
    return { searchField: SearchFields[SearchFields.any], query: search, valid: false };
  }

  public isCurrentField(field: string) {
    return (this.searchField || 'any') === (field || 'any');
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
