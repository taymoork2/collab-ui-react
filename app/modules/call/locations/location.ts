const DEFAULT_TIME_ZONE: string = 'America/Los_Angeles';
const DEFAULT_TIME_FORMAT: string = '24-hour';
const DEFAULT_DATE_FORMAT: string = 'M-D-Y';
const DEFAULT_TONE: string = 'US';

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

export class LocationListItem implements ILocationListItem {
  public uuid?: string;
  public name: string;
  public routingPrefix?: string;
  public defaultLocation: boolean;
  public userCount: number;
  public placeCount: number;

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
  public steeringDigit?: number;
  public allowExternalTransfer: boolean;
  public voicemailPilotNumber: IVoicemailPilotNumber;
  public regionCodeDialing: IRegionCodeDialing;
  public callerIdNumber?: string;

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
