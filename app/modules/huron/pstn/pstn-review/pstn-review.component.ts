import { PstnModel, IOrder } from '../pstn.model';
import {
  NUMBER_ORDER, PORT_ORDER,
  NUMTYPE_DID, NUMTYPE_TOLLFREE,
} from '../pstn.const';
import { PstnCarrier } from '../pstnProviders';

export class PstnReviewComponent implements ng.IComponentOptions {
  public controller = PstnReviewController;
  public template = require('modules/huron/pstn/pstn-review/pstn-review.component.html');
  public bindings = {};
}

const PORT_HOUR: number = 13;
const PORT_DATE_NUMBER_OF_DAYS_IN_THE_FUTURE: number = 22;
const FRIDAY: number = 5;
const SATURDAY: number = 6;
const SUNDAY: number = 0;
const MONDAY: number = 1;
const TUESDAY: number = 2;

class PstnReviewController implements ng.IComponentController {
  public numbersDID: string[] = [];
  public numbersToll: string[] = [];
  public numbersPort: string[] = [];
  public logoSrc: string = '';
  public logoAlt: string = '';
  public carrierName: string = '';
  public packageName: string = '';

  /* @ngInject */
  constructor(
    private PstnModel: PstnModel,
 ) {}

  public $onInit(): void {
    const pstnCarrier: PstnCarrier = this.PstnModel.getProvider();
    if (!_.isEmpty(pstnCarrier)) {
      this.logoAlt = pstnCarrier.logoAlt;
      this.logoSrc = pstnCarrier.logoSrc;
      this.carrierName = pstnCarrier.vendor;
      this.packageName = pstnCarrier.displayName;
    }
    //build number lists
    //find all DID numbers
    this.loadNumbers(this.numbersDID, (order: IOrder) => {
      return order.orderType === NUMBER_ORDER && order.numberType === NUMTYPE_DID;
    });
    //find all Tollfree numbers
    this.loadNumbers(this.numbersToll, (order: IOrder) => {
      return order.orderType === NUMBER_ORDER && order.numberType === NUMTYPE_TOLLFREE;
    });
    //find all Port numbers
    this.loadNumbers(this.numbersPort, (order: IOrder) => {
      return order.orderType === PORT_ORDER;
    });
  }

  public isOrdersEmpty(): boolean {
    return this.PstnModel.getOrders().length === 0;
  }

  public getPortDate(date_: Date = new Date()): string {
    const date: Date = _.cloneDeep(date_);
    date.setDate(date.getDate() + PORT_DATE_NUMBER_OF_DAYS_IN_THE_FUTURE);
    if (!this.isValidPortDate(date)) {
      while (date.getDay() !== TUESDAY) {
        date.setDate(date.getDate() + 1);
      }
    }
    return date.toLocaleDateString();
  }

  private isValidPortDate(date: Date): boolean {
    const today: number = date.getDay();
    if (today !== SATURDAY && today !== SUNDAY && today !== MONDAY) {
      if (today === FRIDAY) {
        if (date.getHours() >= PORT_HOUR) {
          return false;
        }
      }
      return true;
    }
    return false;
  }

  private loadNumbers(numbers: string[], fnOrderFilter: Function): void {
    let i, j: number;
    const orders: IOrder[] = _.filter(this.PstnModel.getOrders(), fnOrderFilter);
    for (i = 0; i < orders.length; i++) {
      if (_.isArray(orders[i].data.numbers)) {
        for (j = 0; j < orders[i].data.numbers.length; j++) {
          numbers.push(orders[i].data.numbers[j]);
        }
      } else {
        numbers.push(<string>orders[i].data.numbers);
      }
    }
  }

}
