import { NumberModel } from '../number.model';
import {
  MIN_BLOCK_QUANTITY, MAX_BLOCK_QUANTITY,
  MIN_VALID_CODE, MAX_VALID_CODE, NUMTYPE_TOLLFREE,
} from 'modules/huron/pstn/pstn.const';

class PstnSelectorCtrl implements ng.IComponentController {
  public model: NumberModel;
  public search: Function;
  public simple: boolean;
  public numberType: string;

  public resultChange: Function;
  public searchVal: string;
  public maxLength: string;
  public error: boolean;
  public form: ng.IFormController;

  /* @ngInject */
  constructor() {}

  public $onInit() {
    if (this.numberType === NUMTYPE_TOLLFREE) {
      this.maxLength = MIN_VALID_CODE.toString();
    } else {
      this.maxLength = MAX_VALID_CODE.toString();
    }
  }

  public onSearch(): void {
    this.search({
      value: this.searchVal,
      block: this.model.block,
      quantity: this.model.quantity,
      consecutive: this.model.consecutive,
    });
  }

  public onBlockClick() {
    if (this.model.block) {
      if (this.model.quantity == null) {
        this.model.quantity = MIN_BLOCK_QUANTITY;
      } else if (!(this.model.quantity >= MIN_BLOCK_QUANTITY && this.model.quantity <= MAX_BLOCK_QUANTITY)) {
        this.model.quantity = MIN_BLOCK_QUANTITY;
      }
    } else {
      this.model.quantity = MIN_BLOCK_QUANTITY;
      this.model.consecutive = false;
    }
  }

  public searchChange() {
    this.form.search.$setValidity('invalid', true);
  }
}

export class PstnSelectorComponent implements ng.IComponentOptions {
  public controller = PstnSelectorCtrl;
  public template = require('modules/huron/pstn/pstnNumberSearch/pstnSelector/pstnSelector.html');
  public bindings = {
    model: '<',
    search: '&',
    simple: '<',
    numberType: '<',
  };
}

export function StartFromFilter() {
  return filter;

  function filter(input, startFrom) {
    return _.slice(input, _.parseInt(startFrom));
  }
}
