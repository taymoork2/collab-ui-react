export class UserV1 {
  public uuid?: string;
  public firstName?: string;
  public lastName?: string;
  public userName?: string;
  public preferredLanguage?: string;
  public services: Array<string>;
  public voicemail?: Voicemail;

  constructor(obj: {
    uuid: string | undefined,
    firstName: string | undefined,
    lastName: string | undefined,
    userName: string | undefined,
    preferredLanguage: string | undefined,
    services: Array<string>,
    voicemail: Voicemail | undefined,
  }) {
    this.uuid = obj.uuid;
    this.firstName = obj.firstName;
    this.lastName = obj.lastName;
    this.userName = obj.userName;
    this.preferredLanguage = obj.preferredLanguage;
    this.services = obj.services;
    this.voicemail = obj.voicemail;
  }
}

export class Voicemail {
  public dtmfAccessId?: string;

  constructor(obj: {
    dtmfAccessId: string | undefined,
  }) {
    this.dtmfAccessId = obj.dtmfAccessId;
  }
}

export class UserV2 {
  public uuid?: string;
  public firstName?: string;
  public lastName?: string;
  public userName?: string;
  public sipAddress?: string;
  public preferredLanguage?: string;
  public numbers: Array<UserNumber>;

  constructor(obj: {
    uuid: string | undefined,
    firstName: string | undefined,
    lastName: string | undefined,
    userName: string | undefined,
    sipAddress: string | undefined,
    preferredLanguage: string | undefined,
    numbers: Array<UserNumber>,

  }) {
    this.uuid = obj.uuid;
    this.firstName = obj.firstName;
    this.lastName = obj.lastName;
    this.userName = obj.userName;
    this.preferredLanguage = obj.preferredLanguage;
    this.sipAddress = obj.sipAddress;
    this.numbers = obj.numbers;
  }
}

export class UserNumber {
  public uuid?: string;
  public internal?: string;
  public external?: string;
  public siteToSite?: string;
  public incomingCallMaximum: number;
  public primary: boolean;
  public shared: boolean;

  constructor(obj: {
    uuid: string | undefined,
    internal: string | undefined,
    external: string | undefined,
    siteToSite: string | undefined,
    incomingCallMaximum: number,
    primary: boolean,
    shared: boolean,

  }) {
    this.uuid = obj.uuid;
    this.internal = obj.internal;
    this.external = obj.external;
    this.siteToSite = obj.siteToSite;
    this.incomingCallMaximum = obj.incomingCallMaximum;
    this.primary = obj.primary;
    this.shared = obj.shared;
  }
}

export class UserRemoteDestination {
  public uuid?: string;
  public enableMobileConnect: string;

  constructor(obj: {
    uuid: string | undefined,
    enableMobileConnect: string,

  }) {
    this.uuid = obj.uuid;
    this.enableMobileConnect = obj.enableMobileConnect;
  }
}
