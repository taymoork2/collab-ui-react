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
  VMOTP: boolean;
  VM2E_TLS: boolean;
}

export class AvrilSite implements IAvrilSite {
  public guid: string;
  public extensionLength: string;
  public language: string;
  public pilotNumber: string;
  public siteSteeringDigit: string;
  public timeZone: string;
  public features: IAvrilFeatures;

  constructor(obj: IAvrilSite  = {
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
    this.features = new AvrilFeatures(obj.features);
  }
}

export class AvrilFeatures implements IAvrilFeatures {
  public VM2E: boolean;
  public VM2E_PT: boolean;
  public VMOTP: boolean;
  public VM2E_TLS: boolean;

  constructor(obj: IAvrilFeatures  = {
    VM2E: false,
    VM2E_PT: false,
    VMOTP: true,
    VM2E_TLS: true,
  }) {
    this.VM2E = obj.VM2E;
    this.VM2E_PT = obj.VM2E_PT;
    this.VMOTP = obj.VMOTP;
    this.VM2E_TLS = obj.VM2E_TLS;
  }
}
