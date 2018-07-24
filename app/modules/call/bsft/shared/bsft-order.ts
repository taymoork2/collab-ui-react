import { IPhoneNumber, PhoneNumber } from './bsft-number';

export interface IPortingNumber {
  telephoneNumber: IPhoneNumber;
  btNumber?: IPhoneNumber | null;
  provisionAsActive: boolean;
  assignProductId?: string | null; //SKU for the product or service
}

export class PortingNumber implements IPortingNumber {
  public telephoneNumber: IPhoneNumber;
  public btNumber?: IPhoneNumber | null;
  public provisionAsActive: boolean;
  public assignProductId?: string | null;

  constructor (portingNumber: IPortingNumber = {
    telephoneNumber: new PhoneNumber(),
    btNumber: null,
    provisionAsActive: false,
    assignProductId: null,
  }) {
    this.telephoneNumber = portingNumber.telephoneNumber;
    this.btNumber = _.isNull(portingNumber.btNumber) ? new PhoneNumber() : new PhoneNumber({
      countryCode: _.get(portingNumber.btNumber, 'countryCode'),
      number: _.get(portingNumber.btNumber, 'number'),
      e164Number: _.get(portingNumber.btNumber, 'e164Number'),
    });
    this.provisionAsActive = portingNumber.provisionAsActive;
    this.assignProductId = portingNumber.assignProductId;
  }
}
export interface IMainNumber {
  telephoneNumber: IPhoneNumber;
}

export interface IBsftOrder {
  siteId: string;
  portedNumbers: IPortingNumber[];
  mainNumber: IMainNumber;
  vmNumber: IMainNumber;
}

export class BsftOrder implements IBsftOrder {
  public siteId: string;
  public portedNumbers: IPortingNumber[];
  public mainNumber: IMainNumber;
  public vmNumber: IMainNumber;

  constructor (bsftOrder: IBsftOrder = {
    siteId: '',
    portedNumbers: [],
    mainNumber: { telephoneNumber: new PhoneNumber() },
    vmNumber:  { telephoneNumber: new PhoneNumber() },
  }) {
    this.siteId = bsftOrder.siteId;
    this.portedNumbers = bsftOrder.portedNumbers;
    this.mainNumber = bsftOrder.mainNumber;
    this.vmNumber = bsftOrder.vmNumber;
  }
}
