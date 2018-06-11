import { DeviceSearchConverter } from './deviceSearchConverter';
import IHttpPromise = angular.IHttpPromise;
import { SearchObject } from './search/searchObject';
import { SearchResult } from './search/searchResult';
import { IDeferred, IHttpService, IQService } from 'angular';
import { SearchTranslator } from './search/searchTranslator';
import { SearchElement } from './search/searchElement';
import { QueryParser } from './search/queryParser';

interface ISearchRequest {
  query: SearchElement | null;
  aggregates?: string[];
  size: number;
  from: number;
  sortField?: string;
  sortOrder?: string;
}

export class CsdmSearchService {
  private pendingPromise: Map<Caller, IDeferred<undefined>> = {};

  /* @ngInject */
  constructor(private $http: IHttpService, private $q: IQService, private UrlConfig, private Authinfo,
              private DeviceSearchConverter: DeviceSearchConverter, private DeviceSearchTranslator: SearchTranslator) {
  }

  public search(search: SearchObject, caller: Caller): IHttpPromise<SearchResult> {
    return this.searchWithRequest(this.constructSearchRequest(search), null, caller);
  }
  public searchWithQueryString(queryString: string, orgId: string | null, size: number, caller: Caller): IHttpPromise<SearchResult> {
    return this.searchWithRequest(this.constructSearchRequestFromQueryString(queryString, size), orgId, caller);
  }

  public searchWithRequest(searchRequest: ISearchRequest, orgId: string | null, caller?: Caller): IHttpPromise<SearchResult> {
    if (caller && this.pendingPromise[caller]) {
      this.pendingPromise[caller].resolve();
    }
    // note the /devices/_search is whitelisted in readonly.interceptor.js
    const url = this.UrlConfig.getCsdmServiceUrl() + '/organization/' + (orgId ? encodeURIComponent(orgId) : this.Authinfo.getOrgId()) + '/devices/_search';
    if (caller) {
      this.pendingPromise[caller] = this.$q.defer();
    }
    return this.$http
      .post<SearchResult>(
        url,
        searchRequest,
        caller ? { timeout: this.pendingPromise[caller].promise } : undefined)
      .then(data => this.DeviceSearchConverter.convertSearchResult(data))
      .catch(response => {
        return this.$q.reject(response);
      });
  }

  private constructSearchRequestFromQueryString(queryString: string, size: number): ISearchRequest {

    const parser = new QueryParser(this.DeviceSearchTranslator);
    const se = parser.parseQueryString(queryString);
    const translatedSE = this.DeviceSearchTranslator.translateQuery(se);

    return {
      query: translatedSE,
      aggregates: ['product', 'connectionStatus', 'productFamily', 'activeInterface', 'errorCodes', 'software', 'upgradeChannel', 'tag'],
      size: size,
      from: 0,
      sortField: 'connectionStatus',
      sortOrder: 'asc',
    };
  }

  public constructSearchRequest(so: SearchObject): ISearchRequest {
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
  initialSearchAndAggregator = 'initialSearchAndAggregator',
  aggregator = 'aggregator',
  searchOrLoadMore = 'search',
  helpdesk = 'helpdesk',
}
