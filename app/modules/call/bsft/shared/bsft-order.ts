import { IPhoneNumber, PhoneNumber } from './bsft-number';
export enum ProductSKU {
  FLEX001 = 'flex-001',
  FLEX002 = 'flex-002',
  FLEX012 = 'flex-012',
  SP009 = 'sp-009',
}

export interface IPortingNumber {
  telephoneNumber: IPhoneNumber;
}

export class PortingNumber implements IPortingNumber {
  public telephoneNumber: IPhoneNumber;
  constructor (portingNumber: IPortingNumber = {
    telephoneNumber: new PhoneNumber(),
  }) {
    this.telephoneNumber = portingNumber.telephoneNumber;
  }
}

export interface IPortedNumber {
  portingNumber: IPortingNumber;
  btNumber?: IPhoneNumber | null;
  provisionAsActive: boolean;
  assignProductId?: string | null; //SKU for the product or service
}

export class PortedNumber implements IPortedNumber {
  public portingNumber: IPortingNumber;
  public btNumber?: IPhoneNumber | null;
  public provisionAsActive: boolean;
  public assignProductId?: string | null;

  constructor (portedNumber: IPortedNumber = {
    portingNumber: new PortingNumber(),
    btNumber: null,
    provisionAsActive: true,
    assignProductId: null,
  }) {
    this.portingNumber = portedNumber.portingNumber;
    this.btNumber = _.isNull(portedNumber.btNumber) ? new PhoneNumber() : new PhoneNumber({
      countryCode: _.get(portedNumber.btNumber, 'countryCode'),
      number: _.get(portedNumber.btNumber, 'number'),
      e164: _.get(portedNumber.btNumber, 'e164'),
    });
    this.provisionAsActive = portedNumber.provisionAsActive;
    this.assignProductId = portedNumber.assignProductId;
  }
}

export interface IBsftOrder {
  siteId: string;
  portedNumbers: IPortedNumber[];
  mainNumber?: string;
  vmNumber?: string;
}

export class BsftOrder implements IBsftOrder {
  public siteId: string;
  public portedNumbers: IPortedNumber[];
  public mainNumber?: string;
  public vmNumber?: string;

  constructor (bsftOrder: IBsftOrder = {
    siteId: '',
    portedNumbers: [],
    mainNumber: '',
    vmNumber: '',
  }) {
    this.siteId = bsftOrder.siteId;
    this.portedNumbers = bsftOrder.portedNumbers;
    this.mainNumber = bsftOrder.mainNumber;
    this.vmNumber = bsftOrder.vmNumber;
  }
}
