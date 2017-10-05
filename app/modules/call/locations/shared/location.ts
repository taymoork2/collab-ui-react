export const HIDDEN: string = 'hidden';

const DEFAULT_TIME_ZONE: string = 'America/Los_Angeles';
const DEFAULT_TIME_FORMAT: string = '24-hour';
const DEFAULT_DATE_FORMAT: string = 'M-D-Y';
const DEFAULT_TONE: string = 'US';
const NULL: string = 'null';

interface IBaseLocation {
  uuid?: string;
  name: string;
  routingPrefix?: string;
  defaultLocation: boolean;
}

export interface IRLocationListItem extends IBaseLocation {
  userCount: number;
  placeCount: number;
}

export interface ILocationListItem extends IRLocationListItem {}

export class LocationListItem implements ILocationListItem {
  public uuid?: string;
  public name: string;
  public routingPrefix?: string;
  public defaultLocation: boolean;
  public userCount: number;
  public placeCount: number;

  constructor(locationListItem: IRLocationListItem = {
    uuid: undefined,
    name: '',
    routingPrefix: undefined,
    defaultLocation: false,
    userCount: 0,
    placeCount: 0,
  }) {
    this.uuid = locationListItem.uuid;
    this.name = locationListItem.name;
    this.routingPrefix = locationListItem.routingPrefix;
    this.defaultLocation = locationListItem.defaultLocation;
    this.userCount = locationListItem.userCount;
    this.placeCount = locationListItem.placeCount;
  }
}

interface IBaseLocationDetails extends IBaseLocation {
  timeZone: string;
  preferredLanguage?: string;
  tone: string;
  dateFormat: string;
  timeFormat: string;
  allowExternalTransfer: boolean;
  voicemailPilotNumber: IVoicemailPilotNumber | null;
  regionCodeDialing: IRegionCodeDialing;
  callerId: ILocationCallerId | null;
}

export interface IRLocation extends IBaseLocationDetails {
  steeringDigit: number | null;
}

export interface ILocation extends IBaseLocationDetails {
  steeringDigit: string;
}

export class Location implements ILocation {
  public uuid?: string;
  public name: string;
  public routingPrefix?: string;
  public defaultLocation: boolean;
  public userCount: number;
  public placeCount: number;
  public timeZone: string;
  public preferredLanguage?: string;
  public tone: string;
  public dateFormat: string;
  public timeFormat: string;
  public steeringDigit: string;
  public allowExternalTransfer: boolean;
  public voicemailPilotNumber: IVoicemailPilotNumber | null;
  public regionCodeDialing: IRegionCodeDialing;
  public callerId: ILocationCallerId | null;

  constructor (location: IRLocation = {
    uuid: undefined,
    name: '',
    timeZone: DEFAULT_TIME_ZONE,
    timeFormat: DEFAULT_TIME_FORMAT,
    dateFormat: DEFAULT_DATE_FORMAT,
    preferredLanguage: undefined,
    tone: DEFAULT_TONE,
    routingPrefix: undefined,
    steeringDigit: null,
    defaultLocation: false,
    allowExternalTransfer: false,
    voicemailPilotNumber: null,
    regionCodeDialing: new RegionCodeDialing(),
    callerId: null,
  }) {
    this.uuid = location.uuid;
    this.name = location.name;
    this.timeZone = location.timeZone;
    this.timeFormat = location.timeFormat;
    this.dateFormat = location.dateFormat;
    this.preferredLanguage = location.preferredLanguage;
    this.tone = location.tone;
    this.routingPrefix = location.routingPrefix;
    this.steeringDigit = _.isNull(location.steeringDigit) ? NULL : _.toString(location.steeringDigit);
    this.defaultLocation = location.defaultLocation;
    this.allowExternalTransfer = location.allowExternalTransfer;
    this.voicemailPilotNumber = new VoicemailPilotNumber({
      number: _.get(location.voicemailPilotNumber, 'number'),
      generated: _.get(location.voicemailPilotNumber, 'generated'),
    });
    this.regionCodeDialing = location.regionCodeDialing;
    this.callerId = _.isNull(location.callerId) ? location.callerId : new LocationCallerId({
      name: _.get(location.callerId, 'name'),
      number: _.get(location.callerId, 'number'),
      uuid: _.get(location.callerId, 'uuid'),
    });
  }
}

export interface IVoicemailPilotNumber {
  number: string | null;
  generated: boolean;
}

export class VoicemailPilotNumber implements IVoicemailPilotNumber {
  public number: string | null;
  public generated: boolean;

  constructor(voicemailPilotNumber: IVoicemailPilotNumber = {
    number: null,
    generated: false,
  }) {
    this.number = voicemailPilotNumber.number;
    this.generated = voicemailPilotNumber.generated;
  }
}

export interface IRegionCodeDialing {
  regionCode: string | null;
  simplifiedNationalDialing: boolean;
}

export class RegionCodeDialing implements IRegionCodeDialing {
  public regionCode: string | null;
  public simplifiedNationalDialing: boolean;

  constructor(regionalCodeDialing: IRegionCodeDialing = {
    regionCode: null,
    simplifiedNationalDialing: true,
  }) {
    this.regionCode = regionalCodeDialing.regionCode;
    this.simplifiedNationalDialing = regionalCodeDialing.simplifiedNationalDialing;
  }
}

export interface ILocationCallerId {
  name: string;
  number: string;
  uuid?: string;
}

export class LocationCallerId implements ILocationCallerId {
  public name: string;
  public number: string;
  public uuid?: string;

  constructor(locationCallerId: ILocationCallerId = {
    name: '',
    number: '',
  }) {
    this.name = locationCallerId.name;
    this.number = locationCallerId.number;
    this.uuid = locationCallerId.uuid;
  }
}

export interface IRLocationInternalNumberPoolList {
  pattern: string;
  directoryNumber: IDirectoryNumber;
  range: IRange;
  uuid?: string;
}

export interface ILocationInternalNumberPoolList extends IRLocationInternalNumberPoolList {}

export class LocationInternalNumberPoolList implements ILocationInternalNumberPoolList {
  public pattern: string;
  public directoryNumber: IDirectoryNumber;
  public range: IRange;
  public uuid?: string;

  constructor(locationInternalNumberPoolList: IRLocationInternalNumberPoolList = {
    pattern: '',
    directoryNumber: new DirectoryNumber(),
    range: new Range(),
    uuid: undefined,
  }) {
    this.pattern = locationInternalNumberPoolList.pattern;
    this.directoryNumber = locationInternalNumberPoolList.directoryNumber;
    this.range = locationInternalNumberPoolList.range;
    this.uuid = locationInternalNumberPoolList.uuid;
  }
}

export interface IDirectoryNumber {
  uuid: string;
  pattern: string;
}

export class DirectoryNumber implements IDirectoryNumber {
  public uuid: string;
  public pattern: string;

  constructor(directoryNumber: IDirectoryNumber = {
    uuid: '',
    pattern: '',
  }) {
    this.uuid = directoryNumber.uuid;
    this.pattern = directoryNumber.pattern;
  }
}

export interface IRange {
  uuid?: string;
  name: string;
  customer: ICustomer;
}

export class Range implements IRange {
  public uuid?: string;
  public name: string;
  public customer: ICustomer;

  constructor(range: IRange = {
    uuid: undefined,
    name: '',
    customer: new Customer(),
  }) {
    this.uuid = range.uuid;
    this.name = range.name;
    this.customer = range.customer;
  }
}

export interface ICustomer {
  uuid: string;
  name: string;
}

export class Customer implements ICustomer {
  public uuid: string;
  public name: string;

  constructor(customer: ICustomer = {
    uuid: '',
    name: '',
  }) {
    this.uuid = customer.uuid;
    this.name = customer.name;
  }
}
