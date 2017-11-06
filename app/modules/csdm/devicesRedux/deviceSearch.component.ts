import { Device } from '../services/deviceSearchConverter';
import { SearchObject } from '../services/search/searchObject';
import { SearchResult } from '../services/search/searchResult';
import { Caller, CsdmSearchService } from '../services/csdmSearch.service';
import { Notification } from '../../core/notifications/notification.service';
import { SearchElement } from '../services/search/queryParser';
import { SearchTranslator } from 'modules/csdm/services/search/searchTranslator';
import { KeyCodes } from 'collab-ui-ng/src/directives/dropdown/keyCodes';
import { ISuggestion, ISuggestionDropdown, SuggestionDropdown } from '../services/search/suggestion';
import { IBulletContainer } from './deviceSearchBullet.component';

export class DeviceSearch implements ng.IComponentController, ISearchHandler, IBulletContainer {

  private static partialSearchError: boolean;

  private lastSearchInput = '';
  public searchInput = '';
  public searchField = '';
  public searchFilters;
  private lastSearchObject: SearchObject;
  private _inputActive: boolean;
  private searchDelayTimer: ng.IPromise<any> | null;
  private static readonly SEARCH_DELAY_MS = 200;

  get inputActive(): boolean {
    return this._inputActive;
  }

  set inputActive(value: boolean) {
    this._inputActive = value;
    this.showHideSuggestionDropdown(value);
  }

  public suggestions: ISuggestionDropdown;
  public showSuggestions = false;

  //bindings
  private searchResultChanged: (e: { result?: SearchResult }) => {};
  public searchObject: SearchObject;
  private searchInteraction: SearchInteraction;
  public searchResult: Device[];
  private isSearching: boolean;

  /* @ngInject */
  constructor(private CsdmSearchService: CsdmSearchService,
              private $translate: ng.translate.ITranslateService,
              private Notification,
              private $timeout: ng.ITimeoutService) {
    this.suggestions = new SuggestionDropdown($translate);
    this.updateSearchFilters();
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
    this.suggestions.showEmpty();
    this.searchChange();
  }

  public onInputChange() {
    if (this.lastSearchInput !== this.searchInput) {
      this.searchObject.setWorkingElementText(this.searchInput);
      this.lastSearchInput = this.searchInput;
      this.searchChange();
      this.suggestions.updateBasedOnInput(this.searchInput);
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
    this.searchObject.setQuery('');
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
      this.suggestions.onSearchChanged(this.getBullets(), this.searchInput);

      if (this.searchObject.currentFilterValue) {
        this.performFilterUpdateSearch();
      }
    }, DeviceSearch.SEARCH_DELAY_MS);
  }

  public selectSuggestion = (suggestion: ISuggestion) => {
    if (suggestion) {
      this.searchObject.setWorkingElementText(suggestion.searchString);
    }
    this.searchObject.submitWorkingElement();
    this.searchInput = '';
    this.lastSearchInput = '';
    this.searchChange();
    this.suggestions.showEmpty();
  }

  public onSearchInputKeyDown($keyEvent: KeyboardEvent) {
    if ($keyEvent && $keyEvent.keyCode) {
      switch ($keyEvent.keyCode) {
        case KeyCodes.BACKSPACE:
          const target = $keyEvent.target;
          if (target instanceof HTMLInputElement && target.selectionEnd === 0) {
            this.deleteLastBullet();
          }
          break;
        case KeyCodes.DOWN:
          this.suggestions.nextSuggestion();
          break;
        case KeyCodes.UP:
          this.suggestions.previousSuggestion();
          break;
        case KeyCodes.ESCAPE:
          this.showHideSuggestionDropdown(false);
          break;
        case KeyCodes.ENTER:
          const activeSuggestion = this.suggestions.getActiveSuggestion();
          if (activeSuggestion) {
            this.selectSuggestion(activeSuggestion);
          }
      }
    }
  }

  private showHideSuggestionDropdown(showDropdown: boolean) {
    this.showSuggestions = showDropdown;
  }

  private performSearch(search: SearchObject) {
    this.isSearching = true;
    this.CsdmSearchService.search(search, Caller.searchOrLoadMore).then((response) => {
      if (response && response.data) {
        this.updateSearchResult(response.data);
        DeviceSearch.ShowPartialSearchErrors(response, this.Notification);
      } else {
        this.updateSearchResult();
      }
      this.isSearching = false;
    }).catch(e => {
      this.isSearching = false;
      DeviceSearch.ShowSearchError(this.Notification, e);
    });
  }

  public static ShowPartialSearchErrors(response, Notification: Notification) {
    if (response && response.data) {
      const trackingId = response.config && response.config.headers && response.config.headers.TrackingID;
      if (!response.data.successfullyRetrievedFromCmi && !response.data.successfullyRetrievedFromCsdm) {
        DeviceSearch.ShowSearchError(Notification, null);
      } else if (!response.data.successfullyRetrievedFromCmi || !response.data.successfullyRetrievedFromCsdm) {
        if (!DeviceSearch.partialSearchError) {
          DeviceSearch.partialSearchError = true;
          DeviceSearch.ShowPartialSearchError(Notification, trackingId);
        }
      } else {
        DeviceSearch.partialSearchError = false;
      }
    }
  }

  private static ShowPartialSearchError(Notification: Notification, trackingId: string) {
    Notification.error('spacesPage.failedToLoadAllDevicesDetails',
      { trackingID: trackingId },
      'spacesPage.failedToLoadAllDevicesTitle',
      true);
  }

  public static ShowSearchError(Notification: Notification, e) {
    if (e) {
      if (e.status === 400) {
        Notification.errorWithTrackingId(e, 'spacesPage.searchFailedQuery');
      } else {
        Notification.errorResponse(e, 'spacesPage.searchFailed');
      }
    } else {
      Notification.error('spacesPage.searchFailed');
    }
  }

  private performFilterUpdateSearch() {
    this.CsdmSearchService.search(this.searchObject.cloneWithoutFilters(), Caller.aggregator)
      .then(response => {
        if (response && response.data) {
          this.updateSearchFilters(response.data);
          DeviceSearch.ShowPartialSearchErrors(response.data, this.Notification);
          return;
        }
        this.updateSearchFilters();
      })
      .catch(e => DeviceSearch.ShowSearchError(this.Notification, e));
  }

  public getBullets(): SearchElement[] {
    return this.searchObject.getBullets();
  }

  public getTranslatedQuery(): string {
    return this.searchObject.getTranslatedQueryString(new SearchTranslator(this.$translate));
  }

  private updateSearchFilters(searchResult?: SearchResult) {
    this.suggestions.updateSuggestionsBasedOnSearchResult(this.getDocCount, searchResult, this.searchInput);
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

  private deleteLastBullet() {
    const bulletList = this.searchObject.getBullets();
    const lastBullet = _.findLast(bulletList, b => !b.isBeingEdited());
    if (lastBullet) {
      this.removeBullet(lastBullet);
    }
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
