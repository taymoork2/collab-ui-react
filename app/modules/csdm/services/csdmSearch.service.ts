import { DeviceSearchConverter } from './deviceSearchConverter';
import IHttpPromise = angular.IHttpPromise;
import { SearchObject } from './search/searchObject';
import { SearchResult } from './search/searchResult';
import { IHttpService } from 'angular';
import * as _ from 'lodash';

export class CsdmSearchService {

  /* @ngInject */
  constructor(private $http: IHttpService, private UrlConfig, private Authinfo, private DeviceSearchConverter: DeviceSearchConverter) {

  }

  public search(search: SearchObject): IHttpPromise<SearchResult> {
    const url = this.UrlConfig.getCsdmServiceUrl() + '/organization/' + this.Authinfo.getOrgId() + '/devices/_search';
    SearchObject.initDefaults(search);
    return this.$http.get<SearchResult>(url + CsdmSearchService.constructSearchString(search)).then(data => this.DeviceSearchConverter.convertSearchResult(data));
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
