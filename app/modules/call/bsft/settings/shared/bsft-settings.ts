import { ISite, Site } from 'modules/call/bsft/shared';

export interface IBsftSettings {
  orgId: string;
  name: string;
  postalAddress: IPostalAddress | null;
  contactInfo: IContactInfo | null;
  site: ISite | null;
  order: IBsftOrder | null;
}

export class BsftSettings implements IBsftSettings {
  public orgId: string;
  public name: string;
  public postalAddress: IPostalAddress | null;
  public contactInfo: IContactInfo | null;
  public site: ISite;
  public order: IBsftOrder | null;

  constructor(bsftSettings: IBsftSettings = {
    orgId: '',
    name: '',
    postalAddress: null,
    contactInfo: null,
    site: null,
    order: null,
  }) {
    this.name = bsftSettings.name;
    this.postalAddress = _.isNull(bsftSettings.postalAddress) ? new PostalAddress() : new PostalAddress({
      address1: _.get(bsftSettings.postalAddress, 'address1'),
      city: _.get(bsftSettings.postalAddress, 'city'),
      state: _.get(bsftSettings.postalAddress, 'state'),
      postalCode: _.get(bsftSettings.postalAddress, 'postalCode'),
      country: _.get(bsftSettings.postalAddress, 'country'),
    });
    this.contactInfo = _.isNull(bsftSettings.contactInfo) ? new ContactInfo() : new ContactInfo({
      contactFirstName: _.get(bsftSettings.contactInfo, 'contactFirstName'),
      contactLastName: _.get(bsftSettings.contactInfo, 'contactLastName'),
      emailAddress: _.get(bsftSettings.contactInfo, 'emailAddress'),
      telephoneNumber: _.get(bsftSettings.contactInfo, 'telephoneNumber'),
    });
    this.site = _.isNull(bsftSettings.site) ? new Site() : new Site({
      name: _.get(bsftSettings.site, 'name'),
      timeZone: _.get(bsftSettings.site, 'timeZone'),
      numbers: _.get(bsftSettings.site, 'numbers'),
      address: _.get(bsftSettings.site, 'address'),
      contact: _.get(bsftSettings.site, 'contact'),
      defaultLocation: _.get(bsftSettings.site, 'defaultLocation'),
      licenses: _.get(bsftSettings.site, 'licenses'),
    });
  }
}

export interface IPostalAddress {
  address1: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export class PostalAddress implements IPostalAddress {
  public address1: string;
  public city: string;
  public state: string;
  public postalCode: string;
  public country: string;

  constructor(postalAddress: IPostalAddress = {
    address1: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
  }) {
    this.address1 = postalAddress.address1;
    this.city = postalAddress.city;
    this.country = postalAddress.country;
    this.postalCode = postalAddress.postalCode;
    this.state = postalAddress.state;
  }
}

export interface IContactInfo {
  contactFirstName: string;
  contactLastName: string;
  emailAddress: string;
  telephoneNumber: ITelephoneNumber | null;
}

export class ContactInfo implements IContactInfo {
  public contactFirstName: string;
  public contactLastName: string;
  public emailAddress: string;
  public telephoneNumber: ITelephoneNumber | null;

  constructor(contactInfo: IContactInfo = {
    contactFirstName: '',
    contactLastName: '',
    emailAddress: '',
    telephoneNumber: null,
  }) {
    this.contactFirstName = contactInfo.contactFirstName;
    this.contactLastName = contactInfo.contactLastName;
    this.emailAddress = contactInfo.emailAddress;
    this.telephoneNumber = _.isNull(contactInfo.telephoneNumber) ? new TelephoneNumber() : new TelephoneNumber({
      countryCode: _.get(contactInfo.telephoneNumber, 'countryCode'),
      number: _.get(contactInfo.telephoneNumber, 'number'),
    });
  }
}

export interface ITelephoneNumber {
  countryCode: string;
  number: string;
  npa?: string;
  orgId?: string;
  assigned?: boolean;
}

export class TelephoneNumber implements ITelephoneNumber {
  public countryCode: string;
  public number: string;

  constructor(telephoneNumber: ITelephoneNumber = {
    countryCode: '1',
    number: '9725551212',
  }) {
    this.countryCode = telephoneNumber.countryCode;
    this.number = telephoneNumber.number;
  }
}

export interface IBsftCustomerStatus {
  rialtoCustomerId: string;
  rialtoSiteId: string;
  completed: boolean;
  failed: boolean;
  errorMessage: string;
}

export class BsftCustomerStatus implements IBsftCustomerStatus {
  public rialtoCustomerId: string;
  public rialtoSiteId: string;
  public completed: boolean;
  public failed: boolean;
  public errorMessage: string;

  constructor(bsftCustomerStatus: IBsftCustomerStatus = {
    rialtoCustomerId: '',
    rialtoSiteId: '',
    completed: false,
    failed: false,
    errorMessage: '',
  }) {
    this.rialtoCustomerId = bsftCustomerStatus.rialtoCustomerId;
    this.rialtoSiteId = bsftCustomerStatus.rialtoSiteId;
    this.completed = bsftCustomerStatus.completed;
    this.failed = bsftCustomerStatus.failed;
    this.errorMessage = bsftCustomerStatus.errorMessage;
  }
}

export interface IBsftCustomerLogin {
  crossLaunchUrl: string;
}

export interface IBsftOrder {
  billingNumber: ITelephoneNumber | null;
  numbers: ITelephoneNumber[];
}

export class BsftOrder implements IBsftOrder {
  public billingNumber: ITelephoneNumber;
  public numbers: ITelephoneNumber[];

  constructor (bsftOrder: IBsftOrder = {
    billingNumber: null,
    numbers: [],
  }) {
    this.billingNumber = _.isNull(bsftOrder.billingNumber) ? new TelephoneNumber() : new TelephoneNumber({
      countryCode: _.get(bsftOrder.billingNumber, 'countryCode'),
      number: _.get(bsftOrder.billingNumber, 'number'),
    });
    this.numbers = bsftOrder.numbers;
  }
}
