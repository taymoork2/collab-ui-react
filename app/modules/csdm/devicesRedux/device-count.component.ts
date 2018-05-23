import { SearchResult } from '../services/search/searchResult';
import { IOnChangesObject } from 'angular';

class DeviceCount implements ng.IComponentController {
  public chartTitle: string;
  public deviceCount: number;
  public isSearch: boolean;

  //bindings:
  public searchResult?: SearchResult;

  private updateDeviceCount(data?: SearchResult) {
    if (!data || !data.hits) {
      this.chartTitle = '';
      return;
    }
    this.chartTitle = `${data.hits.total}`;
    this.deviceCount = data.hits.total;
    this.isSearch = !!data.query;
  }

  public $onChanges(_onChangesObj: IOnChangesObject) {
    if (!this.searchResult) {
      return;
    }
    this.updateDeviceCount(this.searchResult);
  }
}

export class DeviceCountComponent implements ng.IComponentOptions {
  public controller = DeviceCount;
  public bindings = {
    searchResult: '<',
  };
  public controllerAs = 'count';
  public template = require('modules/csdm/devicesRedux/deviceCount.html');
}
