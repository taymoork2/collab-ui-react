export interface IAvrilSite {
  guid: string;
  extensionLength: string;
  language: string;
  pilotNumber: string;
  siteSteeringDigit: string;
  timeZone: string;
  features: IAvrilSiteFeatures;
}

export interface IAvrilSiteFeatures {
  VM2T: boolean;
  VM2E: boolean;
  VM2E_PT?: boolean | undefined; //tobe obsoleted when I1559 GA
  VM2E_Attachment?: boolean | undefined;
  VM2E_Transcript: boolean;
  VM2E_TLS: boolean;
  VM2S: boolean;
  VM2S_Attachment: boolean;
  VM2S_Transcript: boolean;
  VMOTP: boolean;
}

export class AvrilSite implements IAvrilSite {
  public guid: string;
  public extensionLength: string;
  public language: string;
  public pilotNumber: string;
  public siteSteeringDigit: string;
  public timeZone: string;
  public features: IAvrilSiteFeatures;

  constructor(obj: IAvrilSite  = {
    guid: '',
    extensionLength: '',
    language: '',
    pilotNumber: '',
    siteSteeringDigit: '',
    timeZone: '',
    features: new AvrilSiteFeatures(),
  }) {
    this.guid = obj.guid;
    this.extensionLength = obj.extensionLength;
    this.language = obj.language;
    this.pilotNumber = obj.pilotNumber;
    this.siteSteeringDigit = obj.siteSteeringDigit;
    this.timeZone = obj.timeZone;
    this.features = new AvrilSiteFeatures(obj.features);
  }
}

export class AvrilSiteFeatures implements IAvrilSiteFeatures {
  public VM2T: boolean ;
  public VM2E: boolean;
  public VM2E_PT?: boolean | undefined;
  public VM2E_Attachment?: boolean | undefined;
  public VM2E_Transcript: boolean;
  public VM2E_TLS: boolean;
  public VM2S: boolean;
  public VM2S_Attachment: boolean;
  public VM2S_Transcript: boolean;
  public VMOTP: boolean;

  constructor(obj: IAvrilSiteFeatures  = {
    VM2T: false,
    VM2E: false,
    VM2E_Transcript: false,
    VM2E_TLS: false,
    VM2S: false,
    VM2S_Attachment: false,
    VM2S_Transcript: false,
    VMOTP: true,
  }) {
    this.VM2T = obj.VM2T;
    this.VM2E = obj.VM2E;
    this.VM2E_PT = obj.VM2E_PT;
    this.VM2E_Attachment = obj.VM2E_Attachment;
    this.VM2E_Transcript = obj.VM2E_Transcript;
    this.VM2E_TLS = obj.VM2E_TLS;
    this.VM2S = obj.VM2S;
    this.VM2S_Attachment = obj.VM2S_Attachment;
    this.VM2S_Transcript = obj.VM2S_Transcript;
    this.VMOTP = obj.VMOTP;
  }
}
