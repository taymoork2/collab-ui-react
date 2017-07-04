import List = _.List;
import { Device, DeviceSearchConverter } from './deviceSearchConverter';
import IHttpPromise = angular.IHttpPromise;

export class CsdmSearchService {

  /* @ngInject */
  constructor(private $http: ng.IHttpService, private UrlConfig, private Authinfo, private DeviceSearchConverter: DeviceSearchConverter) {

  }

  public search(search: SearchObject): IHttpPromise<SearchResult> {
    const url = this.UrlConfig.getCsdmServiceUrl() + '/organization/' + this.Authinfo.getOrgId() + '/devices/_search';
    SearchObject.initDefaults(search);
    return this.$http.get<SearchResult>(url + this.constructSearchString(search)).then(data => this.DeviceSearchConverter.convertSearchResult(data));
  }

  private constructSearchString(searchObject): string {
    if (!searchObject) {
      return 'empty';
    }
    const so = _.cloneDeep(searchObject);
    delete so['tokenizedQuery'];
    const search = _.join(_.map(so, (v: any, k: string) => {
      return k + '=' + v;
    }), '&');
    if (search && search.length > 0) {
      return '?' + search;
    }
    return '';
  }

  public getIndex() {
    // return this.$http.get(this.url);
  }
}
enum Aggregate {connectionStatus, product, productFamily, activeInterface, errorCodes,
upgradeChannel, software}
export enum SearchFields {product, software, ip, serial, mac, any}

export class SearchResult {
  public aggregations: Aggregations;
  public hits: { hits: Device[], total: number };
}
export class Aggregations {
  [key: string]: Aggregation
}
export class Aggregation {
  public buckets: List<BucketData>;
}

export class BucketData {
  public key: string;
  public docCount: number;
}

export class SearchObject {
  public static SearchFields: { [x: string]: string } = {
    [SearchFields[SearchFields.product]]: 'Product',
    [SearchFields[SearchFields.software]]: 'Software',
    ip: 'IP',
    serial: 'Serial',
    mac: 'Mac',
    connectionStatus: 'Status',
    displayname: 'DisplayName',
    tags: 'Tags',
  };

  // public type?: string;
  public query?: string;  //product:sx10,faosdiv
  public tokenizedQuery?: { [key: string]: string };
  public aggregates?: string;
  public size?: number;

  public static initDefaults(object: SearchObject) {
    object.size = object.size || 20;
    // object.query = object.query || '';
    object.aggregates = object.aggregates ||
      _.join([
        Aggregate[Aggregate.product],
        Aggregate[Aggregate.connectionStatus],
        Aggregate[Aggregate.productFamily],
        Aggregate[Aggregate.activeInterface],
        Aggregate[Aggregate.errorCodes],
        Aggregate[Aggregate.software],
        Aggregate[Aggregate.upgradeChannel],
      ], ',');
  }

  public static create(search: string): SearchObject {
    const sobject = new SearchObject();
    sobject.query = search;

    // return sobject;
    sobject.tokenizedQuery = _.chain(search)
      .split(',')
      .reduce((r, token) => {
        const splitted = _.split(token, ':');
        if (splitted.length === 2) {
          if (_.some(_.keys(SearchObject.SearchFields)), (a) => splitted === a) {
            r[splitted[0]] = splitted[1];
            // return { [splitted[0]]: splitted[1] };
          } else {
            r['any'] = splitted[1];
          }
        } else {
          r['any'] = token;
        }
        return r;
      }, {})
      .value();
    return sobject;
  }
}
