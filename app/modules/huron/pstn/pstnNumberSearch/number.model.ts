import { PaginateOptions } from '../paging-option.model';
import { MIN_BLOCK_QUANTITY, MAX_SEARCH_SELECTION } from '../pstn.const';

export interface IAreaCodeOption {
  code: string;
}

export interface INxxOption {
  code: string | null;
}

export class NumberModel {
  public addDisabled: boolean = true;
  public addLoading: boolean = false;
  public areaCode: IAreaCodeOption | null = null;
  public areaCodeOptions: IAreaCodeOption[] | null = null;
  public areaCodeEnable: boolean = false;
  public nxx: INxxOption | null = null;
  public nxxOptions: INxxOption[] | null = null;
  public nxxEnable: boolean = false;
  public block: boolean = false;
  public quantity: number = MIN_BLOCK_QUANTITY;
  public consecutive: boolean = false;
  public isSingleResult: boolean = false;
  public paginateOptions: PaginateOptions = new PaginateOptions();
  public searchEnable: boolean = false;
  public searchResults: any[] = [];
  public searchResultsModel: boolean[] = [];
  public searchMaxSelection = MAX_SEARCH_SELECTION;
  public showAdvancedOrder: boolean = false;
  public showNoResult: boolean;
}

export interface INumbersModel {
  pstn: NumberModel;
  tollFree: NumberModel;
}

export function NumberModelFactory(): any {
  return {
    create: function () {
      return new NumberModel();
    },
  };
}
