const DEFAULT_TIME_ZONE: string = 'America/Los_Angeles';
const DEFAULT_TIME_FORMAT: string = '24-hour';
const DEFAULT_DATE_FORMAT: string = 'M-D-Y';
const DEFAULT_TONE: string = 'US';

export interface IVoicemailPilotNumber {
  number: string | null;
  generated: boolean;
}

export class VoicemailPilotNumber implements IVoicemailPilotNumber {
  public number;
  public generated;

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
  public regionCode;
  public simplifiedNationalDialing;

  constructor(regionalCodeDialing: IRegionCodeDialing = {
    regionCode: null,
    simplifiedNationalDialing: true,
  }) {
    this.regionCode = regionalCodeDialing.regionCode;
    this.simplifiedNationalDialing = regionalCodeDialing.simplifiedNationalDialing;
  }
}

interface IBaseLocation {
  uuid?: string;
  name: string;
  routingPrefix?: string;
  defaultLocation: boolean;
}

export interface ILocationListItem extends IBaseLocation {
  userCount: number;
  placeCount: number;
}

export class ILocationListItem implements ILocationListItem {
  constructor(locationListItem: ILocationListItem = {
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

export interface ILocation extends IBaseLocation {
  timeZone: string;
  preferredLanguage?: string;
  tone: string;
  dateFormat: string;
  timeFormat: string;
  steeringDigit?: number;
  allowExternalTransfer: boolean;
  voicemailPilotNumber: IVoicemailPilotNumber;
  regionCodeDialing: IRegionCodeDialing;
  callerIdNumber?: string;
}

export class Location implements ILocation {
  public uuid;
  public name;
  public timeZone;
  public timeFormat;
  public dateFormat;
  public preferredLanguage;
  public tone;
  public routingPrefix;
  public steeringDigit;
  public defaultLocation;
  public allowExternalTransfer;
  public voicemailPilotNumber;
  public regionCodeDialing;
  public callerIdNumber;

  constructor (location: ILocation = {
    uuid: undefined,
    name: '',
    timeZone: DEFAULT_TIME_ZONE,
    timeFormat: DEFAULT_TIME_FORMAT,
    dateFormat: DEFAULT_DATE_FORMAT,
    preferredLanguage: undefined,
    tone: DEFAULT_TONE,
    routingPrefix: undefined,
    steeringDigit: undefined,
    defaultLocation: false,
    allowExternalTransfer: false,
    voicemailPilotNumber: new VoicemailPilotNumber(),
    regionCodeDialing: new RegionCodeDialing(),
    callerIdNumber: undefined,
  }) {
    this.uuid = location.uuid;
    this.name = location.name;
    this.timeZone = location.timeZone;
    this.timeFormat = location.timeFormat;
    this.dateFormat = location.dateFormat;
    this.preferredLanguage = location.preferredLanguage;
    this.tone = location.tone;
    this.routingPrefix = location.routingPrefix;
    this.steeringDigit = location.steeringDigit;
    this.defaultLocation = location.defaultLocation;
    this.allowExternalTransfer = location.allowExternalTransfer;
    this.voicemailPilotNumber = location.voicemailPilotNumber;
    this.regionCodeDialing = location.regionCodeDialing;
    this.callerIdNumber = location.callerIdNumber;
  }
}
