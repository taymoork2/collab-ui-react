import { NUMBER_ORDER, PORT_ORDER, BLOCK_ORDER, NXX, MIN_BLOCK_QUANTITY, MAX_BLOCK_QUANTITY } from './index';
class PstnSelectorCtrl implements ng.IComponentController {
  public search: Function;
  public addToCart: Function;
  public resultChange: Function;
  public searchVal: string;
  public numberType: string;
  public quant: number;
  public paginateOptions;
  public searchResultsModel;
  public addDisabled: boolean = true;
  public maxLength: string;
  public block: boolean;
  public quantity: number | null;
  public consecutive: boolean;
  public error: boolean;
  public maxSelection: number;
  public form: ng.IFormController;
  public validSearch;

  /* @ngInject */
  constructor(private TelephoneNumberService,
              private $translate) { }

  public $onInit() {
    this.numberType = this.numberType || 'DID';
    if (this.numberType === 'TOLLFREE') {
      this.maxLength = '3';
    } else {
      this.maxLength = '6';
    }
  }

  public lookup() {
    this.searchResultsModel = {};
    this.searchResultChange();
    this.form.search.$setUntouched();
    this.search({
      value: this.searchVal,
      block: this.block,
      quantity: this.quantity,
      consecutive: this.consecutive,
    });
  }

  public nextPage() {
    this.searchResultsModel = {};
    this.searchResultChange();
    this.paginateOptions.nextPage();
  }

  public previousPage() {
    this.searchResultsModel = {};
    this.searchResultChange();
    this.paginateOptions.previousPage();
  }

  public searchResultChange() {
    this.addDisabled = !_.includes(this.searchResultsModel, true);
    if (_.filter(this.searchResultsModel, (value) => value === true).length > this.maxSelection) {
      this.error = true;
      this.addDisabled = true;
    } else {
      this.error = false;
    }
  }

  public addCart(order_type) {
    this.addToCart({
      order_type: order_type,
      number_type: this.numberType,
      quantity: this.quant,
      searchResultModel: this.searchResultsModel,
    });
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

  public getCommonPattern(telephoneNumber) {
    if (_.isString(telephoneNumber)) {
      return this.TelephoneNumberService.getDIDLabel(telephoneNumber);
    } else {
      let firstNumber = this.TelephoneNumberService.getDIDLabel(_.head(telephoneNumber));
      let lastNumber = this.TelephoneNumberService.getDIDLabel(_.last(telephoneNumber));
      if (this.isConsecutiveArray(telephoneNumber)) {
        return firstNumber + ' - ' + _.last(lastNumber.split('-'));
      } else {
        let commonNumber = this.getLongestCommonSubstring(firstNumber, lastNumber);
        return commonNumber + _.repeat('X', firstNumber.length - commonNumber.length);
      }
    }
  }

  public getLongestCommonSubstring(x, y) {
    if (!_.isString(x) || !_.isString(y)) {
      return '';
    }
    let i = 0;
    let length = x.length;
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

  public blockClick() {
    if (this.block) {
      if (this.quantity == null) {
        this.quantity = MIN_BLOCK_QUANTITY;
      } else if (!(this.quantity >= MIN_BLOCK_QUANTITY || this.quantity <= MAX_BLOCK_QUANTITY)) {
        this.quantity = MIN_BLOCK_QUANTITY;
      }
    } else {
      this.quantity = null;
    }
  }

  public searchChange() {
    if (this.searchVal && this.validSearch) {
      if (this.validSearch.filter((valid) => valid.code === this.searchVal).length === 0) {
        this.form.search.$setValidity('invalid', false);
      } else {
        this.form.search.$setValidity('invalid', true);
      }
    } else {
      this.form.search.$setValidity('invalid', true);
    }
  }
}

export class PstnSelectorComponent implements ng.IComponentOptions {
  public controller = PstnSelectorCtrl;
  public templateUrl = 'modules/huron/pstnSetup/pstnSelector/pstnSelector.html';
  public bindings = {
    search: '&',
    addToCart: '&',
    resultChange: '&',
    searchResults: '<',
    addLoading: '<',
    addDisabled: '<',
    paginateOptions: '<',
    showAdvancedOrder: '<',
    showNoResult: '<',
    maxSelection: '<',
    simple: '@',
    numberType: '@',
    errorMessage: '@',
    validSearch: '<',
  };
}
