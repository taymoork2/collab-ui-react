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
  public dialPlanDetails: DialPlanDetails;
  public links: Array<Link>;

  constructor(obj: {
    uuid: string,
    name: string,
    regionCode: string,
    dialPlanDetails: DialPlanDetails,
    links: Array<Link>,
  }) {
    this.uuid = obj.uuid;
    this.name = obj.name;
    this.regionCode = obj.regionCode;
    this.links = obj.links;
    this.dialPlanDetails = obj.dialPlanDetails;
  }
}

export class DialPlanDetails {
  public callingSearchSpace: string;
  public countryCode: string;

  constructor (obj: {
    callingSearchSpace: string,
    countryCode: string,
  }) {
    this.callingSearchSpace = obj.callingSearchSpace;
    this.countryCode = obj.countryCode;
  }
}
