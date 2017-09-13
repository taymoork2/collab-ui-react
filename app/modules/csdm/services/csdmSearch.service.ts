import { DeviceSearchConverter } from './deviceSearchConverter';
import IHttpPromise = angular.IHttpPromise;
import { SearchObject } from './search/searchObject';
import { SearchResult } from './search/searchResult';
import { IDeferred, IHttpService, IQService } from 'angular';
import * as _ from 'lodash';

export class CsdmSearchService {
  private pendingPromise: Map<Caller, IDeferred<undefined>> = {};

  /* @ngInject */
  constructor(private $http: IHttpService, private $q: IQService, private UrlConfig, private Authinfo, private DeviceSearchConverter: DeviceSearchConverter) {

  }

  public search(search: SearchObject, caller: Caller): IHttpPromise<SearchResult> {
    if (this.pendingPromise[caller]) {
      this.pendingPromise[caller].resolve();
    }
    const url = this.UrlConfig.getCsdmServiceUrl() + '/organization/' + this.Authinfo.getOrgId() + '/devices/_search';
    SearchObject.initDefaults(search);
    this.pendingPromise[caller] = this.$q.defer();
    return this.$http
      .get<SearchResult>(
        url + CsdmSearchService.constructSearchString(search),
        { timeout: this.pendingPromise[caller].promise })
      .then(data => this.DeviceSearchConverter.convertSearchResult(data));
  }

  private static constructSearchString(searchObject): string {
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
}

export enum Caller {
  aggregator = 'aggregator',
  searchOrLoadMore = 'search',
}
