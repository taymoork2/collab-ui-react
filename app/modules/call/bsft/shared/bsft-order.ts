import { IPhoneNumber, PhoneNumber } from './bsft-number';

export interface IBsftOrder {
  siteId: string;
  billingNumber?: IPhoneNumber | null;
  numbers: IPhoneNumber[];
}

export class BsftOrder implements IBsftOrder {
  public siteId: string;
  public billingNumber?: IPhoneNumber | null;
  public numbers: IPhoneNumber[];

  constructor (bsftOrder: IBsftOrder = {
    siteId: '',
    billingNumber: null,
    numbers: [],
  }) {
    this.siteId = bsftOrder.siteId;
    this.billingNumber = _.isNull(bsftOrder.billingNumber) ? new PhoneNumber() : new PhoneNumber({
      countryCode: _.get(bsftOrder.billingNumber, 'countryCode'),
      number: _.get(bsftOrder.billingNumber, 'number'),
      e164Number: _.get(bsftOrder.billingNumber, 'e164Number'),
    });
    this.numbers = bsftOrder.numbers;
  }
}
