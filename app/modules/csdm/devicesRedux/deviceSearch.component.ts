import { Device } from '../services/deviceSearchConverter';
import { SearchFields, SearchObject } from '../services/search/searchObject';
import { SearchResult } from '../services/search/searchResult';
import { Caller, CsdmSearchService } from '../services/csdmSearch.service';
import { SearchTranslator } from '../services/search/searchTranslator';
import { Notification } from '../../core/notifications/notification.service';

export class DeviceSearch implements ng.IComponentController, ISearchHandler {
  public searchField = '';
  public searchFilters;
  private lastSearchObject: SearchObject;
  private inputActive: boolean;
  private searchDelayTimer: ng.IPromise<any> | null;
  private static readonly SEARCH_DELAY_MS = 200;

  //bindings
  private searchResultChanged: (e: { result?: SearchResult }) => {};
  public searchObject: SearchObject;
  private searchInteraction: SearchInteraction;
  public search: string;
  public searchResult: Device[];
  private isSearching: boolean;

  /* @ngInject */
  constructor(private CsdmSearchService: CsdmSearchService,
              private $translate,
              private Notification,
              private $timeout: ng.ITimeoutService,
              private DeviceSearchTranslator: SearchTranslator) {
    this.updateSearchFilters();
  }

  get searching(): boolean {
    return this.inputActive || !!this.search;
  }

  public $onInit(): void {
    this.performSearch(this.searchObject);
    this.searchInteraction.receiver = this;
  }

  private updateSearchResult(result?: SearchResult) {
    this.searchResultChanged({ result: result });
    if (!this.searchObject.currentFilterValue) {
      this.updateSearchFilters(result);
    }
  }

  public addToSearch(field: string, query: string) {
    this.searchObject.setTokenizedQuery(field, query, false);
    this.searchChange();
  }

  public setSortOrder(field: string, order: string) {
    this.searchObject.setSortOrder(field, order);
    this.searchChange();
  }

  public setCurrentSearch(search: string) {
    const newSearch = (search || '').trim();
    if (newSearch !== this.searchField) {
      this.searchField = newSearch;
      this.searchObject.setQuery(this.DeviceSearchTranslator.translate(this.searchField));
      this.searchChange();
    }
  }

  public setCurrentFilterValue(value: string) {
    value = value === 'all' ? '' : value;
    if (this.searchObject.currentFilterValue !== value) {
      this.searchObject.setFilterValue(value);
      this.searchChange();
    }
  }

  public searchChange() {
    if (this.lastSearchObject && this.lastSearchObject.equals(this.searchObject)) {
      return;
    } else if (this.searchObject.hasError && this.lastSearchObject.currentFilterValue === this.searchObject.currentFilterValue) {
      return;
    }
    const search = _.cloneDeep(this.searchObject);

    if (this.searchDelayTimer) {
      this.$timeout.cancel(this.searchDelayTimer);
      this.searchDelayTimer = null;
    }

    this.searchDelayTimer = this.$timeout(() => {
      this.performSearch(search); //TODO avoid at now
      this.lastSearchObject = search;

      if (this.searchObject.currentFilterValue) {
        this.performFilterUpdateSearch();
      }
    }, DeviceSearch.SEARCH_DELAY_MS);
  }

  private performSearch(search: SearchObject) {
    this.isSearching = true;
    this.CsdmSearchService.search(search, Caller.searchOrLoadMore).then((response) => {
      if (response && response.data) {
        this.updateSearchResult(response.data);
        return;
      }
      this.updateSearchResult();
    }).catch(e => {
      this.isSearching = false;
      DeviceSearch.ShowSearchError(this.Notification, e);
    });
  }

  public static ShowSearchError(Notification: Notification, e) {
    if (e) {
      if (e.status === 400) {
        Notification.errorWithTrackingId(e, 'spacesPage.searchFailedQuery');
      } else {
        Notification.errorResponse(e, 'spacesPage.searchFailed');
      }
    }
  }

  private performFilterUpdateSearch() {
    this.CsdmSearchService.search(this.searchObject.cloneWithoutFilters(), Caller.aggregator)
      .then(response => {
        if (response && response.data) {
          this.updateSearchFilters(response.data);
          return;
        }
        this.updateSearchFilters();
      })
      .catch(e => DeviceSearch.ShowSearchError(this.Notification, e));
  }

  public getTokens() {
    return _.filter(this.searchObject.tokenizedQuery, (t) => !t.active);
  }

  public removeBullet(bullet: Bullet) {
    this.searchObject.removeToken(bullet.searchField);
    this.searchChange();
  }

  private updateSearchFilters(searchResult?: SearchResult) {
    this.searchFilters = [
      {
        count: searchResult && searchResult.hits.total || 0,
        name: this.$translate.instant('common.all'),
        filterValue: 'all',
      }, {
        count: this.getDocCount(searchResult, 'connectionStatus', 'connected_with_issues'),
        name: this.$translate.instant('CsdmStatus.OnlineWithIssues'),
        filterValue: 'connectionStatus=CONNECTED_WITH_ISSUES',
      }, {
        count: this.getDocCount(searchResult, 'connectionStatus', 'offline')
        + this.getDocCount(searchResult, 'connectionStatus', 'disconnected'),
        name: this.$translate.instant('CsdmStatus.Offline'),
        filterValue: 'connectionStatus=DISCONNECTED',
      }, {
        count: this.getDocCount(searchResult, 'connectionStatus', 'offline_expired'),
        name: this.$translate.instant('CsdmStatus.OfflineExpired'),
        filterValue: 'connectionStatus=OFFLINE_EXPIRED',
      }, {
        count: this.getDocCount(searchResult, 'connectionStatus', 'connected'),
        name: this.$translate.instant('CsdmStatus.Online'),
        filterValue: 'connectionStatus="CONNECTED"',
      }];
  }

  private getDocCount(searchResult: SearchResult | undefined, aggregation: string, bucketName: string) {
    const buckets = searchResult
      && searchResult.aggregations
      && searchResult.aggregations[aggregation]
      && searchResult.aggregations[aggregation].buckets;
    const bucket = _.find(buckets || [], { key: bucketName });
    return bucket && bucket.docCount || 0;
  }
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

export interface ISearchHandler {
  addToSearch(field: string, query: string);

  setSortOrder(field?: string, order?: string);
}

export class SearchInteraction implements ISearchHandler {
  public receiver: ISearchHandler;

  public addToSearch(field: string, query: string) {
    if (this.receiver) {
      this.receiver.addToSearch(field, query);
    }
  }

  public setSortOrder(field: string, order: string) {
    if (this.receiver) {
      this.receiver.setSortOrder(field, order);
    }
  }
}

export class DeviceSearchComponent implements ng.IComponentOptions {
  public controller = DeviceSearch;
  public bindings = {
    search: '=',
    searchInteraction: '<',
    searchResultChanged: '&',
    searchObject: '<',
    isSearching: '=',
    clearSearch: '&',
  };
  public controllerAs = 'dctrl';
  public templateUrl = 'modules/csdm/devicesRedux/deviceSearch.html';
}
