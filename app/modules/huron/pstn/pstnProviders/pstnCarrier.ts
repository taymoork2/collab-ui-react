import { BYO_PSTN } from '../pstn.const';
import { PRIVATE_PSTN_TRUNK } from '../pstn.const';
export interface IPstnCarrierGet {
  apiImplementation: string;
  country: string;
  countryCode: string;
  defaultOffer: string;
  description: string;
  displayName: string;
  name: string;
  offers: any[];
  services: any[];
  url: string;
  uuid: string;
  vendor: string;
  voiceCarrierRef: string;
}

export class PstnCarrierGet implements IPstnCarrierGet {
  public apiImplementation: string;
  public country: string;
  public countryCode: string;
  public defaultOffer: string;
  public description: string;
  public displayName: string;
  public name: string;
  public offers: any[];
  public services: any[];
  public url: string;
  public uuid: string;
  public vendor: string;
  public voiceCarrierRef: string;

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
  name: string;
  logoSrc: string;
  logoAlt: string;
  countryCode: string;
  docSrc: string;
  features: any[];
  note: string;
}

export class PstnCarrierStatic implements IPstnCarrierStatic {
  public name: string;
  public logoSrc: string;
  public logoAlt: string;
  public countryCode: string;
  public docSrc: string;
  public features: any[];
  public note: string;

  public constructor() {
    this.name = '';
    this.logoSrc = '';
    this.logoAlt = '';
    this.countryCode = '';
    this.docSrc = '';
    this.features = [];
    this.note = '';
  }
}

export interface IPstnCarrierCapability {
  capability: string;
  url: string;
}

export class PstnCarrier {
  public apiImplementation: string;
  public country: string;
  public countryCode: string;
  public defaultOffer: string;
  public description: string;
  public displayName: string;
  public name: string;
  public offers: any[];
  public services: any[];
  public url: string;
  public uuid: string;
  public vendor: string;
  public voiceCarrierRef: string;
  public logoSrc: string;
  public logoAlt: string;
  public docSrc: string;
  public features: any[];
  public note: string;
  public title: string;
  public selected: boolean;
  private capabilities: IPstnCarrierCapability[];

  constructor() {
    this.logoSrc = '';
    this.logoAlt = '';
    this.docSrc = '';
    this.offers = new Array<any>();
    this.services = new Array<any>();
    this.features = new Array<any>();
    this.note = '';
    this.title = '';
    this.selected = false;
    this.capabilities = [];
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

    if (_.isString(this.name) && this.name ===  BYO_PSTN) {
      this.title = PRIVATE_PSTN_TRUNK;
    } else if (_.isString(this.displayName) && this.displayName.length > 0) {
      this.title = this.displayName;
    } else if (_.isString(this.name) && this.name.length > 0) {
      this.title = this.name;
    } else if (_.isString(this.description) && this.description.length > 0) {
      this.title = this.description;
    }
  }

  public setPstnCarrierStatic(carrier: IPstnCarrierStatic): void {
    this.logoSrc = carrier.logoSrc;
    this.logoAlt = carrier.logoAlt;
    this.docSrc = carrier.docSrc;
    this.note = carrier.note;
    carrier.features.forEach(feature => {
      this.features.push(feature);
    });
  }

  public setCapabilities(capablities: IPstnCarrierCapability[]): void {
    if (_.isArray(capablities)) {
      this.capabilities = capablities;
    }
  }

  public getCapabilities(): IPstnCarrierCapability[] {
    return this.capabilities;
  }

  public getCapability(capability: string): boolean {
    if (_.isString(capability) && capability.length > 0) {
      for (let i: number = 0; i < this.capabilities.length; i++) {
        if (this.capabilities[i].capability === capability) {
          return true;
        }
      }
    }
    return false;
  }
}
