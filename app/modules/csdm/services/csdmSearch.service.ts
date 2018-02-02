import { DeviceSearchConverter } from './deviceSearchConverter';
import IHttpPromise = angular.IHttpPromise;
import { SearchObject } from './search/searchObject';
import { SearchResult } from './search/searchResult';
import { IDeferred, IHttpService, IQService } from 'angular';
import { SearchTranslator } from './search/searchTranslator';

export class CsdmSearchService {
  private pendingPromise: Map<Caller, IDeferred<undefined>> = {};

  /* @ngInject */
  constructor(private $http: IHttpService, private $q: IQService, private UrlConfig, private Authinfo,
              private DeviceSearchConverter: DeviceSearchConverter, private DeviceSearchTranslator: SearchTranslator) {

  }

  public search(search: SearchObject, caller: Caller): IHttpPromise<SearchResult> {
    if (this.pendingPromise[caller]) {
      this.pendingPromise[caller].resolve();
    }
    // note the /devices/_search is whitelisted in readonly.interceptor.js
    const url = this.UrlConfig.getCsdmServiceUrl() + '/organization/' + this.Authinfo.getOrgId() + '/devices/_search';
    this.pendingPromise[caller] = this.$q.defer();
    return this.$http
      .post<SearchResult>(
        url,
        this.constructSearchRequest(search),
        { timeout: this.pendingPromise[caller].promise })
      .then(data => this.DeviceSearchConverter.convertSearchResult(data))
      .catch(response => {
        return this.$q.reject(response);
      });
  }

  public constructSearchRequest(so: SearchObject): any {
    if (!so) {
      throw new Error('Invalid search state.');
    }
    return {
      query: so.getTranslatedSearchElement(this.DeviceSearchTranslator),
      aggregates: so.aggregates,
      size: so.size,
      from: so.from,
      sortField: so.sortField,
      sortOrder: so.sortOrder,
    };
  }
}

export enum Caller {
  aggregator = 'aggregator',
  searchOrLoadMore = 'search',
}
