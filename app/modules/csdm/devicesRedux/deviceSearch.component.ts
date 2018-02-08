import { Device } from '../services/deviceSearchConverter';
import { SearchObject } from '../services/search/searchObject';
import { SearchResult } from '../services/search/searchResult';
import { Caller, CsdmSearchService } from '../services/csdmSearch.service';
import { Notification } from '../../core/notifications';
import { SearchElement } from '../services/search/searchElement';
import { SearchTranslator } from 'modules/csdm/services/search/searchTranslator';
import { ISuggestion } from '../services/search/suggestion';
import { IBulletContainer } from './deviceSearchBullet.component';
import { KeyCodes } from '../../core/accessibility';
import { ISuggestionDropdown, SuggestionDropdown } from '../services/search/suggestionDropdown';

export class DeviceSearch implements ng.IComponentController, ISearchHandler, IBulletContainer {

  private static partialSearchError: boolean;
  private lastSearchObject: SearchObject;
  private _inputActive: boolean;
  private searchDelayTimer: ng.IPromise<any> | null;
  private static readonly SEARCH_DELAY_MS = 200;
  private interactedWithSearch = false;
  private bulletCreated = false;
  private queryCounter: number = 0;

  get inputActive(): boolean {
    return this._inputActive;
  }

  set inputActive(value: boolean) {
    this._inputActive = value;
    this.showSuggestions = value && this.interactedWithSearch && !this.bulletCreated;
    this.bulletCreated = false;
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
              private $timeout: ng.ITimeoutService,
              private DeviceSearchTranslator: SearchTranslator,
              private Analytics,
              private CsdmUpgradeChannelService) {
    const upgradeChannelsAvailable = this.CsdmUpgradeChannelService.getUpgradeChannelsPromise().then(channels => {
      return channels.length > 1;
    });
    this.suggestions = new SuggestionDropdown(this.DeviceSearchTranslator, this.$translate, upgradeChannelsAvailable);

    this.suggestions.updateSuggestionsBasedOnSearchResult(undefined, this.searchObject);
  }

  public $onInit(): void {
    let initialSearch = true;
    if (this.searchObject && this.searchObject.hasAnyBulletOrEditedText()) {
      const searchObject = this.searchObject.clone();
      searchObject.setQuery('');
      this.performSearch(searchObject, Caller.aggregator);
      initialSearch = false;
    }
    this.performSearch(this.searchObject, initialSearch ? Caller.aggregator : Caller.searchOrLoadMore);
    this.$timeout(() => {
      //DOM has finished rendering
      this.setFocusToInputField();
    });
    this.searchInteraction.receiver = this;
  }

  private updateSearchResult(result?: SearchResult, caller?: Caller) {
    this.searchResultChanged({ result: result });

    if (caller === Caller.aggregator) {
      this.suggestions.setInitialSearchResult(result);
    }
    this.suggestions.updateSuggestionsBasedOnSearchResult(result, this.searchObject);
  }

  public setSortOrder(field: string, order: string) {
    this.searchObject.setSortOrder(field, order);
    this.searchChange(true);
  }

  public addToSearch(searchElement: SearchElement, toggle: boolean) {
    this.searchObject.addParsedSearchElement(searchElement, toggle);
    this.searchChange(true);
  }

  get searchInput(): string {
    return this.searchObject.getWorkingElementText();
  }

  set searchInput(value: string) {
    if (this.searchObject.setWorkingElementText(value)) {
      this.searchChange(false);
      if (this.searchObject.hasError) {
        this.showSuggestions = false;
      } else {
        this.showSuggestions = true;
        this.suggestions.updateBasedOnInput(this.searchObject);
      }
    }
  }

  public editBullet(bullet: SearchElement) {
    if (!this.searchObject.hasError) {
      this.searchObject.submitWorkingElement();
    }
    this.searchObject.hasError = false;
    this.searchObject.setWorkingElementText(bullet.toQuery());
    this.setFocusToInputField();
    bullet.setBeingEdited(true);
    this.suggestions.updateBasedOnInput(this.searchObject);
  }

  public clearSearchInput() {
    this.searchObject.setQuery('');
    this.suggestions.updateBasedOnInput(this.searchObject);
    this.searchChange(true);
  }

  public getSearchPlaceholder() {
    return this.$translate.instant(_.isEmpty(this.getBullets()) ? 'spacesPage.deviceSearchPlaceholder' : '');
  }

  public userSetFocusToInputField() {
    this.interactedWithSearch = true;
    this.setFocusToInputField();
  }

  private setFocusToInputField() {
    angular.element('#searchFilterInput').focus();
  }

  public resetInputFieldCursor() {
    this.interactedWithSearch = true;
    const inputField = angular.element('#searchFilterInput');
    inputField.focus();
    (inputField[0] as HTMLInputElement).setSelectionRange(0, 0);
  }

  public removeBullet(bullet: SearchElement) {
    this.searchObject.removeSearchElement(bullet);
    this.searchChange(true);
  }

  public searchChange(nodelay: boolean) {
    if (this.lastSearchObject && this.lastSearchObject.equals(this.searchObject)) {
      return;
    } else if (this.searchObject.hasError && !this.lastSearchObject) {
      return;
    }
    const searchClone = this.searchObject.clone();

    if (this.searchDelayTimer) {
      this.$timeout.cancel(this.searchDelayTimer);
      this.searchDelayTimer = null;
    }

    this.searchDelayTimer = this.$timeout(() => {
      this.performSearch(searchClone, Caller.searchOrLoadMore);
      this.lastSearchObject = searchClone;
      this.suggestions.onSearchChanged(this.searchObject);
    }, nodelay ? 0 : DeviceSearch.SEARCH_DELAY_MS);
  }

  public selectSuggestion(suggestion: ISuggestion | null, byMouse: boolean) {
    this.trackSuggestionAction(byMouse
      ? 'MOUSE'
      : 'KEYBOARD',
      suggestion);
    if (suggestion) {
      this.searchObject.setWorkingElementText(suggestion.searchString);
      if (suggestion.isFieldSuggestion) {
        this.searchObject.setWorkingElementText(suggestion.searchString);
        this.searchChange(true);
        this.suggestions.updateBasedOnInput(this.searchObject);
        return;
      }
    }
    this.searchObject.submitWorkingElement();
    this.searchChange(true);
    this.showSuggestions = false;
    this.bulletCreated = true;
    this.suggestions.updateBasedOnInput(this.searchObject);
  }

  public onSearchInputKeyDown($keyEvent: KeyboardEvent) {
    this.showSuggestions = true;
    if ($keyEvent && $keyEvent.keyCode) {
      switch ($keyEvent.keyCode) {
        case KeyCodes.BACKSPACE:
          const target = $keyEvent.target;
          if (target instanceof HTMLInputElement) {
            if (target.selectionEnd === 0) {
              this.deleteLastBullet();
            } else if (target.selectionStart === target.selectionEnd
              && target.value[target.selectionEnd] === '"'
              && target.value[target.selectionEnd - 1] === '"') {
              const selectionEnd = target.selectionEnd;
              target.value = [target.value.slice(0, selectionEnd), target.value.slice(selectionEnd + 1)].join('');
              target.selectionEnd = selectionEnd;
            } else if (target.selectionStart === target.selectionEnd
              && target.value[target.selectionEnd] === ')'
              && target.value[target.selectionEnd - 1] === '(') {
              const selectionEnd = target.selectionEnd;
              target.value = [target.value.slice(0, selectionEnd), target.value.slice(selectionEnd + 1)].join('');
              target.selectionEnd = selectionEnd;
            }
          }
          break;
        case KeyCodes.DOWN:
          this.suggestions.setNextActiveByKeyboard();
          break;
        case KeyCodes.UP:
          this.suggestions.setPreviousActiveByKeyboard();
          break;
        case KeyCodes.ESCAPE:
          this.showSuggestions = false;
          break;
        case KeyCodes.ENTER:
          if (!this.searchObject.hasError) {
            this.selectSuggestion(this.suggestions.getActiveSuggestionByKeyboard(), false);
          }
      }
    }
  }

  public onSearchInputKeyPress($keyEvent: KeyboardEvent) {
    if ($keyEvent && $keyEvent.which) {
      this.interactedWithSearch = true;
      const target = $keyEvent.target;
      if (!(target instanceof HTMLInputElement)) {
        return;
      }
      switch ($keyEvent.key) {
        case '"':
          if (!this.searchObject.hasError) {
            if (!target.value[target.selectionEnd]) {
              const selectionStart = target.selectionStart;
              target.value = [target.value.slice(0, selectionStart), '"', target.value.slice(target.selectionEnd)].join('');
              target.selectionEnd = selectionStart;
            } else if (target.value[target.selectionEnd] === '"') {
              target.selectionEnd += 1;
              return false;
            }
          }
          break;
        case '(':
          if (!target.value[target.selectionEnd]) {
            const selectionStart = target.selectionStart;
            target.value = [target.value.slice(0, selectionStart), ')', target.value.slice(target.selectionEnd)].join('');
            target.selectionEnd = selectionStart;
          }
          break;
        case ')':
          if (target.value.length >= 2 && target.value[target.selectionEnd - 1] === '(' && target.value[target.selectionEnd] === ')') {
            target.selectionEnd += 1;
            return false;
          }
          break;
      }
    }
  }

  private performSearch(search: SearchObject, caller: Caller) {
    this.isSearching = true;
    this.CsdmSearchService.search(search, caller).then((response) => {
      if (response && response.data) {
        this.updateSearchResult(response.data, caller);
        DeviceSearch.ShowPartialSearchErrors(response, this.Notification);
      } else {
        this.updateSearchResult();
      }
      this.isSearching = false;
    }).catch(e => {
      if (e.xhrStatus !== 'abort') {
        this.isSearching = false;
        DeviceSearch.ShowSearchError(this.Notification, e.data && e.data.trackingId);
      }
    });
    this.trackSearchAction(caller === Caller.aggregator
      ? 'INITIAL_SEARCH'
      : 'SEARCH',
      search);
  }

  private trackSuggestionAction(clickSource: string, suggestion: ISuggestion | null) {
    if (!suggestion) {
      return;
    }
    this.Analytics.trackEvent(this.Analytics.sections.DEVICE_SEARCH.eventNames.SELECT_SUGGESTION, {
      suggestion_click: clickSource,
      suggestion_field: _.toLower(suggestion.field || 'ANY_FIELD'),
      suggestion_length: (suggestion.searchString || '').length,
      suggestion_rank: suggestion.rank,
      suggestion_count: suggestion.count,
      suggestion_field_only: suggestion.isFieldSuggestion,
    });
  }

  private trackSearchAction(querySource: string, search: SearchObject) {
    if (!search) {
      return;
    }
    const query = search.getTranslatedQueryString(null) || '';
    this.Analytics.trackEvent(this.Analytics.sections.DEVICE_SEARCH.eventNames.PERFORM_SEARCH, {
      query_length: query.length,
      query_error: search.hasError,
      query_source: querySource,
      query_count: this.queryCounter++,
    });
  }

  public static ShowPartialSearchErrors(response, Notification: Notification) {
    if (response && response.data) {
      const trackingId = response.config && response.config.headers && response.config.headers.TrackingID;
      if (!response.data.successfullyRetrievedFromCmi && !response.data.successfullyRetrievedFromCsdm) {
        DeviceSearch.ShowSearchError(Notification, trackingId);
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

  public static ShowSearchError(Notification: Notification, trackingId) {
    Notification.error('spacesPage.searchFailedDetails',
      { trackingID: trackingId },
      'spacesPage.searchFailedTitle',
      true);
  }

  public getBullets(): SearchElement[] {
    return this.searchObject.getBullets();
  }

  public getTranslatedQuery(): string {
    return this.searchObject.getTranslatedQueryString(this.DeviceSearchTranslator);
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
  addToSearch(searchElement: SearchElement, toggle: boolean);

  searchChange(nodelay: boolean);

  setSortOrder(field?: string, order?: string);
}

export class SearchInteraction implements ISearchHandler {
  public receiver: ISearchHandler;

  public addToSearch(searchElement: SearchElement, toggle: boolean) {
    if (this.receiver) {
      this.receiver.addToSearch(searchElement, toggle);
    }
  }

  public searchChange(nodelay: boolean) {
    if (this.receiver) {
      this.receiver.searchChange(nodelay);
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
