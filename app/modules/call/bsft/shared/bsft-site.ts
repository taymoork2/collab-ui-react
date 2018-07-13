const DEFAULT_TIME_ZONE: string = 'America/Los_Angeles';

export interface ISite {
  name: string;
  timeZone: string;
  numbers: string[];
  address: ISiteAddress;
  contact: IContact;
  defaultLocation: boolean;
  licenses: ILicenses;
}

export interface ISiteAddress {
  address1: string;
  address2: string | null;
  city: string;
  zipcode: string;
  state: string;
  country: string;
}

export interface IContact {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
}

export interface ILicenses {
  standard: number;
  places: number;
}

export class Site implements ISite {
  public name: string;
  public timeZone: string;
  public numbers: string[];
  public address: ISiteAddress;
  public contact: IContact;
  public defaultLocation: boolean;
  public licenses: ILicenses;

  constructor(site: ISite = {
    name: '',
    timeZone: DEFAULT_TIME_ZONE,
    numbers: [],
    defaultLocation: false,
    licenses: {
      standard: 0,
      places: 0,
    },
    contact: {
      firstName: '',
      lastName: '',
      phoneNumber: '',
      email: '',
    },
    address: {
      address1: '',
      address2: '',
      city: '',
      zipcode: '',
      state: '',
      country: '',
    },
  }) {
    this.name = site.name;
    this.timeZone = site.timeZone;
    this.numbers = site.numbers;
    this.address = site.address;
    this.contact = site.contact;
    this.defaultLocation = site.defaultLocation;
    this.licenses = site.licenses;
  }
}

export interface ILicenseInfo {
  available: number;
  total: number;
  name: string;
}

export class LicenseInfo implements ILicenseInfo {
  public available: number;
  public total: number;
  public name: string;

  constructor(license: ILicenseInfo = {
    available: 0,
    total: 0,
    name: '',
  }) {
    this.available = license.available;
    this.total = license.total;
    this.name = license.name;
  }
}
