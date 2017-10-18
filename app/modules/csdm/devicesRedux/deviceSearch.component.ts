import { Device } from '../services/deviceSearchConverter';
import { SearchObject } from '../services/search/searchObject';
import { SearchResult } from '../services/search/searchResult';
import { Caller, CsdmSearchService } from '../services/csdmSearch.service';
import { Notification } from '../../core/notifications/notification.service';
import { SearchElement } from '../services/search/queryParser';

export class DeviceSearch implements ng.IComponentController, ISearchHandler {

  private lastSearchInput = '';
  public searchInput = '';
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
  public searchResult: Device[];
  private isSearching: boolean;

  /* @ngInject */
  constructor(private CsdmSearchService: CsdmSearchService,
              private $translate,
              private Notification,
              private $timeout: ng.ITimeoutService) {
    this.updateSearchFilters();
  }

  get searching(): boolean {
    return this.inputActive;
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

  public setSortOrder(field: string, order: string) {
    this.searchObject.setSortOrder(field, order);
    this.searchChange();
  }

  public addToSearch(field: string, query: string) {
    this.searchObject.addSearchElement((field ? (field + ':') : '') + query);
  }

  public onInputSubmit() {
    if (this.searchObject.hasError) {
      return;
    }
    this.searchObject.submitWorkingElement();
    this.searchInput = '';
    this.lastSearchInput = '';
    this.searchChange();
  }

  public onInputChange() {
    if (this.lastSearchInput !== this.searchInput) {
      this.searchObject.setWorkingElementText(this.searchInput);
      this.lastSearchInput = this.searchInput;
      this.searchChange();
    }
  }

  public editBullet(bullet: SearchElement) {
    if (!this.searchObject.hasError) {
      this.searchObject.submitWorkingElement();
      this.searchInput = '';
      this.lastSearchInput = '';
    }
    this.searchObject.hasError = false;
    this.lastSearchInput = bullet.toQuery();
    this.searchInput = this.lastSearchInput;
    this.setFocusToInputField();
    bullet.setBeingEdited(true);
  }

  public clearSearchInput() {
    this.searchObject.setWorkingElementText('');
    this.searchInput = '';
    this.lastSearchInput = '';
    this.searchChange();
  }

  public setFocusToInputField() {
    angular.element('#searchFilterInput').focus();
  }

  public removeBullet(bullet: SearchElement) {
    this.searchObject.removeSearchElement(bullet);
    this.searchChange();
  }

  public setCurrentSearch(search: string) {
    const newSearch = (search || '').trim();
    if (newSearch !== this.searchField) {
      this.searchField = newSearch;
      this.searchObject.setQuery(this.searchField);
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
    } else if (this.searchObject.hasError && (!this.lastSearchObject || this.lastSearchObject.currentFilterValue === this.searchObject.currentFilterValue)) {
      return;
    }
    const searchClone = this.searchObject.clone();

    if (this.searchDelayTimer) {
      this.$timeout.cancel(this.searchDelayTimer);
      this.searchDelayTimer = null;
    }

    this.searchDelayTimer = this.$timeout(() => {
      this.performSearch(searchClone); //TODO avoid at now
      this.lastSearchObject = searchClone;

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

  public getBullets(): SearchElement[] {
    return this.searchObject.getBullets();
  }

  private updateSearchFilters(searchResult?: SearchResult) {
    this.searchFilters = [
      {
        count: searchResult && searchResult.hits.total || 0,
        name: this.$translate.instant('common.all'),
        filterValue: 'all',
      }, {
        count: this.getDocCount(searchResult, 'connectionStatus', 'connected_with_issues'),
        name: this.$translate.instant('CsdmStatus.connectionStatus.OnlineWithIssues'),
        filterValue: 'connectionStatus=CONNECTED_WITH_ISSUES',
      }, {
        count: this.getDocCount(searchResult, 'connectionStatus', 'offline')
        + this.getDocCount(searchResult, 'connectionStatus', 'disconnected'),
        name: this.$translate.instant('CsdmStatus.connectionStatus.Offline'),
        filterValue: 'connectionStatus=DISCONNECTED',
      }, {
        count: this.getDocCount(searchResult, 'connectionStatus', 'offline_expired'),
        name: this.$translate.instant('CsdmStatus.connectionStatus.OfflineExpired'),
        filterValue: 'connectionStatus=OFFLINE_EXPIRED',
      }, {
        count: this.getDocCount(searchResult, 'connectionStatus', 'connected'),
        name: this.$translate.instant('CsdmStatus.connectionStatus.Online'),
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
    searchInteraction: '<',
    searchResultChanged: '&',
    searchObject: '<',
    isSearching: '=',
  };
  public controllerAs = 'dctrl';
  public template = require('modules/csdm/devicesRedux/deviceSearch.html');
}
