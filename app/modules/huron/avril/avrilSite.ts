export interface IAvrilSite {
  guid: string;
  extensionLength: string;
  language: string;
  pilotNumber: string;
  siteSteeringDigit: string;
  timeZone: string;
  features: IAvrilFeatures;
}

export interface IAvrilFeatures {
  VM2E: boolean;
  VM2E_PT: boolean;
  VM2S: boolean;
  VM2T: boolean;
  VMOTP: boolean;
}

export class AvrilSite implements IAvrilSite {
  public guid: string;
  public extensionLength: string;
  public language: string;
  public pilotNumber: string;
  public siteSteeringDigit: string;
  public timeZone: string;
  public features: IAvrilFeatures;

  constructor(obj: {
    guid: string,
    extensionLength: string,
    language: string,
    pilotNumber: string,
    siteSteeringDigit: string,
    timeZone: string,
    features: IAvrilFeatures,
  } = {
    guid: '',
    extensionLength: '',
    language: '',
    pilotNumber: '',
    siteSteeringDigit: '',
    timeZone: '',
    features: new AvrilFeatures(),
  }) {
    this.guid = obj.guid;
    this.extensionLength = obj.extensionLength;
    this.language = obj.language;
    this.pilotNumber = obj.pilotNumber;
    this.siteSteeringDigit = obj.siteSteeringDigit;
    this.timeZone = obj.timeZone;
    this.features = obj.features;
  }
}

export class AvrilFeatures implements IAvrilFeatures {
  public VM2E: boolean;
  public VM2E_PT: boolean;
  public VM2S: boolean;
  public VM2T: boolean;
  public VMOTP: boolean;

  constructor(obj: {
    VM2E: boolean,
    VM2E_PT: boolean,
    VM2S: boolean,
    VM2T: boolean,
    VMOTP: boolean,
  } = {
    VM2E: false,
    VM2E_PT: false,
    VM2S: true,
    VM2T: false,
    VMOTP: false,
  }) {
    this.VM2E = obj.VM2E;
    this.VM2E_PT = obj.VM2E_PT;
    this.VM2S = obj.VM2S;
    this.VM2T = obj.VM2T;
    this.VMOTP = obj.VMOTP;
  }
}
