import { PaginateOptions } from '../paging-option.model';
export class NumberModel {
  public addDisabled: boolean = true;
  public addLoading: boolean = false;
  public areaCode: {code} | null = null;
  public areaCodeOptions: string[] | null = null;
  public areaCodeEnable: boolean = false;
  public nxx: {code} | null = null;
  public block: boolean = false;
  public consecutive: boolean = false;
  public isSingleResult: boolean = false;
  public paginateOptions: PaginateOptions = new PaginateOptions();
  public quantity: number = 1;
  public searchEnable: boolean = false;
  public searchResults: any[] = [];
  public searchResultsModel = {};
  public showAdvancedOrder: boolean = false;
  public showNoResult: boolean;
}

export interface INumbersModel {
  pstn: NumberModel;
  tollFree: NumberModel;
}
