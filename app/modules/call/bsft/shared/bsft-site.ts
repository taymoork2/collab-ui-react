const DEFAULT_TIME_ZONE: string = 'America/Los_Angeles';

export interface ISite {
  name: string;
  timeZone: string;
  numbers: string[];
  emergencyAddress: IEmergencySiteAddress;
  contact: IContact;
}

export interface IEmergencySiteAddress {
  address1: string;
  address2: string | null;
  city: string;
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
  public emergencyAddress: IEmergencySiteAddress;
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
    emergencyAddress: {
      address1: '',
      address2: '',
      city: '',
      state: '',
      country: '',
    },
  }) {
    this.name = site.name;
    this.timeZone = site.timeZone;
    this.numbers = site.numbers;
    this.emergencyAddress = site.emergencyAddress;
    this.contact = site.contact;
  }
}
