export interface IVoicemailPilotNumber {
  number: string | null;
  generated: boolean;
}

export class VoicemailPilotNumber implements IVoicemailPilotNumber {
  public number: string | null = null;
  public generated: boolean = false;

  public setVoicemailPilotNumber(voicemailPilotNumber: IVoicemailPilotNumber): void {
    this.number = voicemailPilotNumber.number;
    this.generated = voicemailPilotNumber.generated;
  }
}

export interface IRegionalCodeDialing {
  regionCode: string | null;
  simplifiedNationalDialing: boolean;
}

export class RegionalCodeDialing implements IRegionalCodeDialing {
  public regionCode: string | null = null;
  public simplifiedNationalDialing: boolean = true;

  public setRegionalCodeDialing(regionalCodeDialing: IRegionalCodeDialing) {
    this.regionCode = regionalCodeDialing.regionCode;
    this.simplifiedNationalDialing = regionalCodeDialing.simplifiedNationalDialing;
  }
}

export const updateAction: ng.resource.IActionDescriptor = {
  method: 'PUT',
};

export const saveAction: ng.resource.IActionDescriptor = {
  method: 'POST',
  headers: {
    'Access-Control-Expose-Headers': 'Location',
  },
};

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

export interface ILocationGetResource extends ng.resource.IResourceClass<ng.resource.IResource<ILocationsGet>> {}

export class Location implements ILocation {
  public uuid: string = '';
  public name: string = '';
  public routingPrefix: string = '';
  public defaultLocation: boolean = false;
  public userCount: number = 0;
  public placeCount: number = 0;
  public url: string = '';

  public setLocation(location: ILocation): void {
    this.uuid = location.uuid;
    this.name = location.name;
    this.routingPrefix = location.routingPrefix;
    this.defaultLocation = location.defaultLocation;
    this.userCount = location.userCount;
    this.placeCount = location.placeCount;
    this.url = location.url;
  }

  public setLocationResource(location: ng.resource.IResource<ILocation>): void {
    this.uuid = _.get<string>(location, 'uuid');
    this.name = _.get<string>(location, 'name');
    this.routingPrefix = _.get<string>(location, 'routingPrefix');
    this.defaultLocation = _.get<boolean>(location, 'defaultLocation');
    this.userCount = _.get<number>(location, 'userCount');
    this.placeCount = _.get<number>(location, 'placeCount');
    this.url = _.get<string>(location, 'url');
  }
}

export interface ILocationDetail {
  uuid?: string;
  name: string;
  timeZone: string;
  preferredLanguage?: string;
  tone: string;
  dateFormat: string ;
  timeFormat: string ;
  routingPrefix?: string;
  steeringDigit?: number;
  defaultLocation: boolean;
  allowExternalTransfer: boolean;
  voicemailPilotNumber: IVoicemailPilotNumber;
  regionCodeDialing: IRegionalCodeDialing;
  callerIdNumber?: string;
}

export interface ILocationDetailResource extends ng.resource.IResourceClass<ng.resource.IResource<ILocationDetail>> {
  update: ng.resource.IResourceMethod<ng.resource.IResource<void>>;
}

export class LocationDetail implements ILocationDetail {
  public uuid?: string;
  public name: string = '';
  public timeZone: string = '';
  public preferredLanguage?: string;
  public tone: string = 'US';
  //dateFormat and timeFormat must both be set, or neither
  public dateFormat: string = 'M-D-Y';
  public timeFormat: string = '12-hour';
  public routingPrefix?: string;
  public steeringDigit?: number;
  public defaultLocation: boolean = false;
  public allowExternalTransfer: boolean = false;
  public voicemailPilotNumber: VoicemailPilotNumber = new VoicemailPilotNumber();
  public regionCodeDialing: RegionalCodeDialing = new RegionalCodeDialing();
  public callerIdNumber?: string;

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
