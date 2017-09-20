import { NumberModel } from './number.model';
import { CCODE_CA, CCODE_US } from '../pstnAreaService';
import {
  MAX_SEARCH_SELECTION, NUMBER_ORDER, PORT_ORDER, BLOCK_ORDER,
  NXX, NUMTYPE_DID,
} from '../pstn.const';
import { PstnModel } from '../pstn.model';
import { PhoneNumberService } from 'modules/huron/phoneNumber';

class PstnNumberSearchCtrl implements ng.IComponentController {
  //Passed-in Properties
  public model: NumberModel;
  public search: Function;
  public addToCart: Function;
  public numberType: string;
  public countryCode: string;
  public errorMessage: string;
  //Ctrl Properties
  public isTrial: boolean = true;
  public error: boolean = false;

  /* @ngInject */
  constructor(
    private PstnModel: PstnModel,
    private PhoneNumberService: PhoneNumberService,
    private $translate: ng.translate.ITranslateService,
  ) {}

  public $onInit(): void {
    if (!_.isString(this.countryCode)) {
      this.countryCode = CCODE_US;
    }
    if (!_.isString(this.numberType)) {
      this.numberType = NUMTYPE_DID;
    }
    this.isTrial = this.PstnModel.getIsTrial();
    if (this.isTrial) {
      this.model.quantity = MAX_SEARCH_SELECTION;
    }
  }

  public isDetailSearchEnabled(): boolean {
    let detailSearchEnable: boolean = false;
    if (this.numberType === NUMTYPE_DID) {
      //using a switch due possibly adding other countries
      switch (this.countryCode) {
        case CCODE_CA:
        case CCODE_US:
          detailSearchEnable = true;
          break;
      }
    }
    return detailSearchEnable;
  }

  //Bypass method to parent binding
  public searchFn(value_: string, block_: boolean, quantity_: number, consecutive_: boolean, stateAbbreviation_: string): void {
    this.model.searchResultsModel = [];
    this.searchResultChange();
    this.search({
      value: value_,
      block: block_,
      quantity: quantity_,
      consecutive: consecutive_,
      stateAbbreviation: stateAbbreviation_,
    });
  }

  //Bypass method to parent binding
  public onAddToCart(orderType: string): void {
    this.model.addLoading = true;
    this.addToCart({
      order_type: orderType,
      number_type: this.numberType,
      quantity: this.model.quantity,
      searchResultModel: this.model.searchResultsModel,
    });
  }

  public searchResultChange() {
    this.model.addDisabled = !_.includes(this.model.searchResultsModel, true);
    if (_.filter(this.model.searchResultsModel, (value) => value === true).length > MAX_SEARCH_SELECTION) {
      this.error = true;
      this.model.addDisabled = true;
    } else {
      this.error = false;
    }
  }

  public previousPage(): void {
    this.model.searchResultsModel = [];
    this.searchResultChange();
    this.model.paginateOptions.previousPage();
  }

  public showPreviousButton(): boolean {
    return this.model.paginateOptions.currentPage === 0;
  }

  public nextPage(): void {
    this.model.searchResultsModel = [];
    this.searchResultChange();
    this.model.paginateOptions.nextPage();
  }

  public showNextButton(): boolean {
    const numberPages = (this.model.searchResults.length / this.model.paginateOptions.pageSize) - 1;
    return this.model.paginateOptions.currentPage >= numberPages;
  }

  public getLongestCommonSubstring(x, y) {
    if (!_.isString(x) || !_.isString(y)) {
      return '';
    }
    let i = 0;
    const length = x.length;
    while (i < length && x.charAt(i) === y.charAt(i)) {
      i++;
    }
    return x.substring(0, i);
  }

  public isConsecutiveArray(array) {
    return _.every(array, (value: any, index, arr) => {
      // return true for the first element
      if (index === 0) {
        return true;
      }
      // check the difference with the previous element
      return _.parseInt(value) - _.parseInt(arr[index - 1]) === 1;
    });
  }

  public getCommonPattern(telephoneNumber) {
    if (_.isString(telephoneNumber)) {
      return this.PhoneNumberService.getNationalFormat(telephoneNumber);
    } else {
      const firstNumber = this.PhoneNumberService.getNationalFormat(_.head<string>(telephoneNumber));
      const lastNumber = this.PhoneNumberService.getNationalFormat(_.last<string>(telephoneNumber));
      if (this.isConsecutiveArray(telephoneNumber)) {
        return firstNumber + ' - ' + _.last(lastNumber.split('-'));
      } else {
        const commonNumber = this.getLongestCommonSubstring(firstNumber, lastNumber);
        return commonNumber + _.repeat('X', firstNumber.length - commonNumber.length);
      }
    }
  }

  public formatTelephoneNumber(telephoneNumber) {
    switch (_.get(telephoneNumber, 'orderType')) {
      case NUMBER_ORDER:
        return this.getCommonPattern(telephoneNumber.data.numbers);
      case PORT_ORDER:
        return this.$translate.instant('pstnSetup.portNumbersLabel');
      case BLOCK_ORDER: {
        let pstn = 'XXX-XXXX';
        if (_.has(telephoneNumber.data, NXX)) {
          pstn = telephoneNumber.data.nxx + '-' + 'XXXX';
        }
        return '(' + telephoneNumber.data.areaCode + ') ' + pstn;
      }
      case undefined:
        return this.getCommonPattern(telephoneNumber);
      default:
        return undefined;
    }
  }
}

export class PstnNumberSearchComponent implements ng.IComponentOptions {
  public controller = PstnNumberSearchCtrl;
  public template = require('modules/huron/pstn/pstnNumberSearch/pstnNumberSearch.html');
  public bindings = {
    model: '=',
    search: '&',
    addToCart: '&',
    numberType: '@',
    countryCode: '<',
    errorMessage: '@',
  };
}
