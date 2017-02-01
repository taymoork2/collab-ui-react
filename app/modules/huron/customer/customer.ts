export class Customer {
  public uuid: string;
  public name: string;
  public servicePackage: string;
  public links: Array<Link>;

  constructor(obj: {
    uuid: string,
    name: string,
    servicePackage: string,
    links: Array<Link>,
  }) {
    this.uuid = obj.uuid;
    this.name = obj.name;
    this.servicePackage = obj.servicePackage;
    this.links = obj.links;
  }
}

export class Link {
  public rel: string;
  public href: string;

  constructor(obj: {
    rel: string,
    href: string,
  }) {
    this.rel = obj.rel;
    this.href = obj.href;
  }
}

export class CustomerVoice {
  public uuid: string;
  public name: string;
  public regionCode: string;
  public dialPlan?: DialPlan | null;
  public dialPlanDetails: DialPlanDetails;
  public links: Array<Link>;

  constructor(obj: {
    uuid: string,
    name: string,
    regionCode: string,
    dialPlan?: DialPlan | null,
    dialPlanDetails: DialPlanDetails,
    links: Array<Link>,
  }) {
    this.uuid = obj.uuid;
    this.name = obj.name;
    this.regionCode = obj.regionCode;
    this.links = obj.links;
    this.dialPlan = obj.dialPlan;
    this.dialPlanDetails = obj.dialPlanDetails;
  }
}

export class DialPlan {
  public uuid: string;
  public name: string;

  constructor(obj: {
    uuid: string,
    name: string,
  }) {
    this.uuid = obj.uuid;
    this.name = obj.name;
  }
}

export class DialPlanDetails {
  public countryCode?: string;
  public extensionGenerated?: string;
  public steeringDigitRequired?: string;
  public supportSiteCode?: string;
  public supportSiteSteeringDigit?: string;

  constructor (obj: {
    countryCode?: string,
    extensionGenerated?: string,
    steeringDigitRequired?: string,
    supportSiteCode?: string,
    supportSiteSteeringDigit?: string,
  } = {
    countryCode: '+1',
    extensionGenerated: 'false',
    steeringDigitRequired: 'true',
    supportSiteCode: 'true',
    supportSiteSteeringDigit: 'true',
  }) {
    this.countryCode = obj.countryCode;
    this.extensionGenerated = obj.extensionGenerated;
    this.steeringDigitRequired = obj.steeringDigitRequired;
    this.supportSiteCode = obj.supportSiteCode;
    this.supportSiteSteeringDigit = obj.supportSiteSteeringDigit;
  }
}
