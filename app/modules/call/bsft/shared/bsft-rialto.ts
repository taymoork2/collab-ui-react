import { Site } from './bsft-site';

interface IRialtoSiteAddress {
  address1: string;
  address2: string | null;
  city: string;
  postalCode: string;
  state: string;
  country: string;
}

interface IRialtoContact {
  contactFirstName: string;
  contactLastName: string;
  emailAddress: string;
  telephoneNumber: {
    e164: string,
  };
}

interface IRialtoStatus {
  code: string;
  message: string;
  type: string;
}

interface IRialtoCustomerResponse {
  companyName: string;
  rialtoId: string;
  status: IRialtoStatus;
}

export class RialtoCustomer {
  public custCIOrgID: string;
  public customerName: string;
  public flexOrigin: boolean;
  public customerAddress: IRialtoSiteAddress;
  public customerContact: IRialtoContact;

  constructor(orgId: string, customerName: string, site: Site) {
    this.custCIOrgID = orgId;
    this.customerName = customerName;
    this.flexOrigin = true;
    this.customerAddress = {
      address1: site.address.address1,
      address2: site.address.address2,
      city: site.address.city,
      state: _.get(site, 'address.state.abbreviation'),
      postalCode: site.address.zipcode,
      country: _.get(site, 'address.country.abbreviation'),
    };
    this.customerContact = {
      contactFirstName: site.contact.firstName,
      contactLastName: site.contact.lastName,
      emailAddress: site.contact.email,
      telephoneNumber: {
        e164: site.contact.phoneNumber,
      },
    };
  }
}

export class RialtoSite {
  public siteName: string;
  public timezone: string;
  public emailAddress: string;
  public defaultSite: boolean;
  public siteType: string;
  public siteAddress: IRialtoSiteAddress;
  public siteContact: IRialtoContact;

  constructor(site: Site) {
    this.siteName = site.name;
    this.timezone = site.timeZone;
    this.emailAddress = site.contact.email,
    this.defaultSite = site.defaultLocation,
    this.siteType = 'FLEX';
    this.siteAddress = {
      address1: site.address.address1,
      address2: site.address.address2,
      city: site.address.city,
      state: _.get(site, 'address.state.abbreviation', ''),
      postalCode: site.address.zipcode,
      country: _.get(site, 'address.country.abbreviation', ''),
    };
    this.siteContact = {
      contactFirstName: site.contact.firstName,
      contactLastName: site.contact.lastName,
      emailAddress: site.contact.email,
      telephoneNumber: {
        e164: site.contact.phoneNumber,
      },
    };
  }
}

export class RialtoCustomerResponse {
  public companyName: string;
  public rialtoId: string;
  public status: IRialtoStatus;

  constructor(rialtoResponse: IRialtoCustomerResponse = {
    companyName: '',
    rialtoId: '',
    status: {
      code: '',
      message: '',
      type: '',
    },
  }) {
    this.companyName = rialtoResponse.companyName;
    this.rialtoId = rialtoResponse.companyName;
    this.status = rialtoResponse.status;
  }
}
