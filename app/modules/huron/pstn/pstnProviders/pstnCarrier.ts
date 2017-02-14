export interface IPstnCarrierGet {
  apiImplementation: String;
  country: String;
  countryCode: String;
  defaultOffer: String;
  description: String;
  displayName: String;
  name: String;
  offers: Array<any>;
  services: Array<any>;
  url: String;
  uuid: String;
  vendor: String;
  voiceCarrierRef: String;
}

export class PstnCarrierGet implements IPstnCarrierGet {
  public apiImplementation: String;
  public country: String;
  public countryCode: String;
  public defaultOffer: String;
  public description: String;
  public displayName: String;
  public name: String;
  public offers: Array<any>;
  public services: Array<any>;
  public url: String;
  public uuid: String;
  public vendor: String;
  public voiceCarrierRef: String;

  public constructor() {
    this.apiImplementation = '';
    this.country = '';
    this.countryCode = '';
    this.defaultOffer = '';
    this.description = '';
    this.displayName = '';
    this.name = '';
    this.offers = [];
    this.services = [];
    this.url = '';
    this.uuid = '';
    this.vendor = '';
    this.voiceCarrierRef = '';
  }
}

export interface IPstnCarrierStatic {
  name: String;
  logoSrc: String;
  logoAlt: String;
  docSrc: String;
  features: Array<any>;
}

export class PstnCarrier {
  public apiImplementation: String;
  public country: String;
  public countryCode: String;
  public defaultOffer: String;
  public description: String;
  public displayName: String;
  public name: String;
  public offers: Array<any>;
  public services: Array<any>;
  public url: String;
  public uuid: String;
  public vendor: String;
  public voiceCarrierRef: String;
  public logoSrc: String;
  public logoAlt: String;
  public docSrc: String;
  public features: Array<any>;
  public title: String;

  constructor() {
    this.offers = new Array<any>();
    this.services = new Array<any>();
    this.features = new Array<any>();
    this.title = '';
  }

  public setPstnCarrierGet(carrier: IPstnCarrierGet): void {
    this.apiImplementation = carrier.apiImplementation;
    this.country = carrier.country;
    this.countryCode = carrier.countryCode;
    this.defaultOffer = carrier.defaultOffer;
    this.description = carrier.description;
    this.displayName = carrier.displayName;
    this.name = carrier.name;
    carrier.offers.forEach(offer => {
      this.offers.push(offer);
    });
    carrier.services.forEach(service => {
      this.services.push(service);
    });
    this.url = carrier.url;
    this.uuid = carrier.uuid;
    this.vendor = carrier.vendor;
    this.voiceCarrierRef = carrier.voiceCarrierRef;

    if (_.isString(this.displayName) && this.displayName.length > 0) {
      this.title = this.displayName;
    } else if (_.isString(this.name) && this.name.length > 0) {
      this.title = this.name;
    }
  }

  public setPstnCarrierStatic(carrier: IPstnCarrierStatic): void {
    this.logoSrc = carrier.logoSrc;
    this.logoAlt = carrier.logoAlt;
    this.docSrc = carrier.docSrc;
    carrier.features.forEach(feature => {
      this.features.push(feature);
    });
  }
}
