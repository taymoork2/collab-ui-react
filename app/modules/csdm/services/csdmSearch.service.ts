import { DeviceSearchConverter } from './deviceSearchConverter';
import IHttpPromise = angular.IHttpPromise;
import { SearchObject } from './search/searchObject';
import { SearchResult } from './search/searchResult';
import { IDeferred, IHttpService, IQService } from 'angular';
import * as _ from 'lodash';
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
    const url = this.UrlConfig.getCsdmServiceUrl() + '/organization/' + this.Authinfo.getOrgId() + '/devices/_search';
    this.pendingPromise[caller] = this.$q.defer();
    return this.$http
      .get<SearchResult>(
        url + this.constructSearchString(search),
        { timeout: this.pendingPromise[caller].promise })
      .then(data => this.DeviceSearchConverter.convertSearchResult(data));
  }

  public constructSearchString(so: SearchObject): string {
    if (!so) {
      throw new Error('Invalid search state.');
    }

    const params = {
      query: so.getSearchQuery(this.DeviceSearchTranslator),
      aggregates: so.aggregates,
      size: so.size,
      from: so.from,
      sortField: so.sortField,
      sortOrder: so.sortOrder,
    };

    const search = _.join(_.map(params, (v: any, k: string) => {
      return k + '=' + encodeURIComponent(v);
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
