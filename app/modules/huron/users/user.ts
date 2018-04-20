import { PrimaryNumber } from 'modules/huron/primaryLine';

export class UserV1 {
  public uuid?: string;
  public firstName?: string;
  public lastName?: string;
  public userName?: string;
  public preferredLanguage?: string;
  public services: string[];
  public voicemail?: Voicemail;

  constructor(obj: {
    uuid: string | undefined,
    firstName: string | undefined,
    lastName: string | undefined,
    userName: string | undefined,
    preferredLanguage: string | undefined,
    services: string[],
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
  public numbers?: IUserNumber[];
  public primaryNumber?: PrimaryNumber;

  constructor(obj: {
    uuid: string | undefined,
    firstName: string | undefined,
    lastName: string | undefined,
    userName: string | undefined,
    sipAddress: string | undefined,
    preferredLanguage: string | undefined,
    numbers: UserNumber[] | undefined,
    primaryNumber: PrimaryNumber | undefined,

  }) {
    this.uuid = obj.uuid;
    this.firstName = obj.firstName;
    this.lastName = obj.lastName;
    this.userName = obj.userName;
    this.preferredLanguage = obj.preferredLanguage;
    this.sipAddress = obj.sipAddress;
    this.numbers = obj.numbers;
    this.primaryNumber = obj.primaryNumber;
  }
}

export interface IBaseCallNumber {
  uuid?: string;
  internal?: string;
  external?: string;
  siteToSite?: string;
  primary: boolean;
  shared: boolean;
}

export interface IUserNumber extends IBaseCallNumber {
  incomingCallMaximum: number;
}

export class UserNumber implements IUserNumber {
  public uuid?: string;
  public internal?: string;
  public external?: string;
  public siteToSite?: string;
  public incomingCallMaximum: number;
  public primary: boolean;
  public shared: boolean;

  constructor(userNumber: IUserNumber = {
    uuid: '',
    internal: undefined,
    external: undefined,
    siteToSite: undefined,
    incomingCallMaximum: 3,
    primary: false,
    shared: false,
  }) {
    this.uuid = userNumber.uuid;
    this.internal = userNumber.internal;
    this.external = userNumber.external;
    this.siteToSite = userNumber.siteToSite;
    this.incomingCallMaximum = userNumber.incomingCallMaximum;
    this.primary = userNumber.primary;
    this.shared = userNumber.shared;
  }
}

export interface IUserRemoteDestination {
  uuid?: string;
  enableMobileConnect: string;
}

export class UserRemoteDestination implements IUserRemoteDestination {
  public uuid?: string;
  public enableMobileConnect: string;

  constructor(userRemoteDestination: IUserRemoteDestination = {
    uuid: '',
    enableMobileConnect: '',
  }) {
    this.uuid = userRemoteDestination.uuid;
    this.enableMobileConnect = userRemoteDestination.enableMobileConnect;
  }
}

