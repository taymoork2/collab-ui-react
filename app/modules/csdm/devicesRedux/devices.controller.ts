import { SearchObject } from '../services/csdmSearch.service';
import { Device } from '../services/deviceSearchConverter';
export class DevicesCtrl {
  public anyDevicesOrCodesLoaded = true; //TODO remove

  private _searchString: string = '';
  private _searchResult: Device[] = [];
  private _searchObject: SearchObject;
  /* @ngInject */
  constructor() {
  }

  set searchResult(value: Device[]) {
    this._searchResult = value;
  }

  get searchResult(): Device[] {
    return this._searchResult;
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

  public searchChanged(search: SearchObject) {
    this._searchString = search.query || '';
    this._searchObject = search;
  }

  public searchResultChanged(result: Device[]) {
    this.searchResult = result;
    // this._searchResult.splice(0, this._searchResult.length);
    // if (result && result.length) {
    //   Array.prototype.push.apply(this._searchResult, result);
    // }
  }
}
