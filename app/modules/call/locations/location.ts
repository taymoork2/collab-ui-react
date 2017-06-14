export interface IVoicemailPilotNumber {
  number: string;
  voicemailPilotNumberGenerated: boolean;
}

export class VoicemailPilotNumber implements IVoicemailPilotNumber {
  public number: string;
  public voicemailPilotNumberGenerated: boolean;

  public setVoicemailPilotNumber(voicemailPilotNumber: IVoicemailPilotNumber): void {
    this.number = voicemailPilotNumber.number;
    this.voicemailPilotNumberGenerated = voicemailPilotNumber.voicemailPilotNumberGenerated;
  }
}

export interface IRegionalCodeDialing {
  regionCode: string;
  simplifiedNationalDialing: boolean;
}

export class RegionalCodeDialing implements IRegionalCodeDialing {
  public regionCode: string;
  public simplifiedNationalDialing: boolean;

  public setRegionalCodeDialing(regionalCodeDialing: IRegionalCodeDialing) {
    this.regionCode = regionalCodeDialing.regionCode;
    this.simplifiedNationalDialing = regionalCodeDialing.simplifiedNationalDialing;
  }
}

export interface ILocationDetail {
  name: string;
  timeZone: string;
  preferredLanguage: string;
  tone: string;
  dateFormat: string;
  timeFormat: string;
  routingPrefix: string;
  steeringDigit: number;
  defaultLocation: boolean;
  allowExternalTransfer: boolean;
  voicemailPilotNumber: IVoicemailPilotNumber;
  regionCodeDialing: IRegionalCodeDialing;
  callerIdNumber: string;
}

export class LocationDetail implements ILocationDetail {
  public name: string;
  public timeZone: string;
  public preferredLanguage: string;
  public tone: string;
  public dateFormat: string;
  public timeFormat: string;
  public routingPrefix: string;
  public steeringDigit: number;
  public defaultLocation: boolean;
  public allowExternalTransfer: boolean;
  public voicemailPilotNumber: VoicemailPilotNumber;
  public regionCodeDialing: RegionalCodeDialing;
  public callerIdNumber: string;

  public constructor () {
    this.name = '';
    this.timeZone = '';
    this.preferredLanguage = '';
    this.tone = '';
    this.dateFormat = '';
    this.timeFormat = '';
    this.routingPrefix = '';
    this.steeringDigit = 9;
    this.defaultLocation = false;
    this.allowExternalTransfer = false;
    this.voicemailPilotNumber = new VoicemailPilotNumber();
    this.regionCodeDialing = new RegionalCodeDialing();
    this.callerIdNumber = '';
  }

  public setLocationDetail(locationDetail: ILocationDetail): void {
    this.name = locationDetail.name;
    this.timeZone = locationDetail.timeZone;
    this.preferredLanguage = locationDetail.preferredLanguage;
    this.tone = locationDetail.tone;
    this.dateFormat = locationDetail.dateFormat;
    this.timeFormat = locationDetail.timeFormat;
    this.routingPrefix = locationDetail.routingPrefix;
    this.steeringDigit = locationDetail.steeringDigit;
    this.defaultLocation = locationDetail.defaultLocation;
    this.allowExternalTransfer = locationDetail.allowExternalTransfer;
    this.voicemailPilotNumber.setVoicemailPilotNumber(locationDetail.voicemailPilotNumber);
    this.regionCodeDialing.setRegionalCodeDialing(locationDetail.regionCodeDialing);
    this.callerIdNumber = locationDetail.callerIdNumber;
  }
}

export interface ILocation {
  uuid: string;
  name: string;
  routingPrefix: string;
  defaultLocation: boolean;
  userCount: number;
  placeCount: number;
  url: string;
}

export interface ILocationsGet {
  locations: ILocation[];
  url: string;
  paging: string;
}

export class Location implements ILocation {
  public uuid: string;
  public name: string;
  public routingPrefix: string;
  public defaultLocation: boolean;
  public userCount: number;
  public placeCount: number;
  public url: string;

  public constructor () {
    this.uuid = '';
    this.name = '';
    this.routingPrefix = '';
    this.defaultLocation = false;
    this.userCount = 0;
    this.placeCount = 0;
    this.url = '';
  }

  public setLocation(location: ILocation): void {
    this.uuid = location.uuid;
    this.name = location.name;
    this.routingPrefix = location.routingPrefix;
    this.defaultLocation = location.defaultLocation;
    this.userCount = location.userCount;
    this.placeCount = location.placeCount;
    this.url = location.url;
  }
}
