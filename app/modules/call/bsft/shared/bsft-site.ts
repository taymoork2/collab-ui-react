const DEFAULT_TIME_ZONE: string = 'America/Los_Angeles';

export interface ISite {
  name: string;
  timeZone: string;
  numbers: string[];
  address: ISiteAddress;
  contact: IContact;
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

export class Site implements Site {
  public name: string;
  public timeZone: string;
  public numbers: string[];
  public address: ISiteAddress;
  public contact: IContact;

  constructor(site: ISite = {
    name: '',
    timeZone: DEFAULT_TIME_ZONE,
    numbers: [],
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
  }
}
