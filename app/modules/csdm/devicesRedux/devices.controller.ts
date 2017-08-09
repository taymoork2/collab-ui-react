import { SearchObject, SearchResult } from '../services/csdmSearch.service';
import { SearchInteraction } from './deviceSearch.component';
export class DevicesCtrl {
  public anyDevicesOrCodesLoaded = true; //TODO remove
  public searchMinimized = false;
  public searchInteraction = new SearchInteraction();
  private _searchString: string = '';
  private _searchResult: SearchResult;
  private _searchObject: SearchObject;
  /* @ngInject */
  constructor() {
    this.searchResult = { aggregations: {}, hits: { hits: [], total: 0 } };
  }

  get searchResult(): SearchResult {
    return this._searchResult;
  }

  set searchResult(value: SearchResult) {
    this._searchResult = value;
  }

  get searchObject(): SearchObject {
    return this._searchObject;
  }

  set search(value: string) {
    this._searchString = value;
  }

  get search() {
    return this._searchString;
  }

  public $onInit(): void {

  }

  public addToSearch(field: string, query: string) {
    this.searchInteraction.addToSearch(field, query);
  }

  public searchChanged(search: SearchObject) {
    this._searchString = search.query || '';
    this._searchObject = search;
  }

  public searchResultChanged(result: SearchResult) {
    this._searchResult = result;
    // this._searchResult.splice(0, this._searchResult.length);
    // if (result && result.length) {
    //   Array.prototype.push.apply(this._searchResult, result);
    // }
  }
}
