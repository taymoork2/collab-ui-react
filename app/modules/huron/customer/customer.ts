export enum ServicePackage {
  VOICE_ONLY = 'VOICE_ONLY',
  VOICE_VOICEMAIL = 'VOICE_VOICEMAIL', // Avril Only
  VOICE_VOICEMAIL_AVRIL = 'VOICE_VOICEMAIL_AVRIL', // Unity and Avril
  DEMO_STANDARD = 'DEMO_STANDARD', // Unity only
}

export interface IRCustomer {
  uuid: string;
  name: string;
  servicePackage: string;
  links: Link[];
}

export interface ICustomer extends IRCustomer {}

export class Customer implements ICustomer {
  public uuid: string;
  public name: string;
  public servicePackage: string;
  public links: Link[];

  constructor(customer: IRCustomer = {
    uuid: '',
    name: '',
    servicePackage: '',
    links: [],
  }) {
    this.uuid = customer.uuid;
    this.name = customer.name;
    this.servicePackage = customer.servicePackage;
    this.links = customer.links;
  }
}

export interface ICustomerVoiceBase {
  uuid: string;
  name: string;
  regionCode: string;
  dialPlan?: DialPlan | null;
  dialPlanDetails: DialPlanDetails;
}

export interface IRCustomerVoice extends ICustomerVoiceBase {
  routingPrefixLength: string | null;
  extensionLength: string | null;
}

export interface ICustomerVoice extends ICustomerVoiceBase {
  routingPrefixLength: number | null;
  extensionLength: number | null;
}

export class CustomerVoice implements ICustomerVoice {
  public uuid: string;
  public name: string;
  public regionCode: string;
  public dialPlan?: DialPlan | null;
  public dialPlanDetails: DialPlanDetails;
  public routingPrefixLength: number | null;
  public extensionLength: number | null;

  //Default/Copy constructor
  constructor(customerVoice: IRCustomerVoice = {
    uuid: '',
    name: '',
    regionCode: '',
    dialPlanDetails: new DialPlanDetails(),
    routingPrefixLength: null,
    extensionLength: null,
  }) {
    this.uuid = customerVoice.uuid;
    this.name = customerVoice.name;
    this.regionCode = customerVoice.regionCode;
    this.dialPlan = customerVoice.dialPlan;
    this.dialPlanDetails = customerVoice.dialPlanDetails;
    this.routingPrefixLength = customerVoice.routingPrefixLength ? parseInt(customerVoice.routingPrefixLength, 10) : null;
    this.extensionLength = customerVoice.extensionLength ? parseInt(customerVoice.extensionLength, 10) : null;
  }
}

export interface ILink {
  rel: string;
  href: string;
}

export class Link implements ILink {
  public rel: string;
  public href: string;

  constructor(link: Link) {
    this.rel = link.rel;
    this.href = link.href;
  }
}

export interface IDialPlan {
  uuid: string;
  name: string;
}

export class DialPlan implements IDialPlan {
  public uuid: string;
  public name: string;

  constructor(dialPlan: DialPlan) {
    this.uuid = dialPlan.uuid;
    this.name = dialPlan.name;
  }
}

export interface IDialPlanDetails {
  countryCode?: string;
  extensionGenerated?: string;
  steeringDigitRequired?: string;
  supportSiteCode?: string;
  supportSiteSteeringDigit?: string;
}

export class DialPlanDetails implements IDialPlanDetails {
  public countryCode?: string;
  public extensionGenerated?: string;
  public steeringDigitRequired?: string;
  public supportSiteCode?: string;
  public supportSiteSteeringDigit?: string;

  //Default/Copy constructor
  constructor (dialPlanDetails: IDialPlanDetails = {
    countryCode: '+1',
    extensionGenerated: 'false',
    steeringDigitRequired: 'true',
    supportSiteCode: 'true',
    supportSiteSteeringDigit: 'true',
  }) {
    this.countryCode = dialPlanDetails.countryCode;
    this.extensionGenerated = dialPlanDetails.extensionGenerated;
    this.steeringDigitRequired = dialPlanDetails.steeringDigitRequired;
    this.supportSiteCode = dialPlanDetails.supportSiteCode;
    this.supportSiteSteeringDigit = dialPlanDetails.supportSiteSteeringDigit;
  }
}
