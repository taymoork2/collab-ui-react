const DEFAULT_TIME_ZONE: string = 'America/Los_Angeles';
const DEFAULT_TIME_FORMAT: string = '24-hour';
const DEFAULT_DATE_FORMAT: string = 'M-D-Y';
const DEFAULT_LANGUAGE: string = 'en_US';
const DEFAULT_COUNTRY: string = 'US';
const DEFAULT_EXTENSION_LENGTH: string = '3';
const DEFAULT_STEERING_DIGIT: string = '9';
const DEFAULT_SITE_INDEX: string = '000001';
const NULL: string = 'null';

interface IBaseSite {
  uuid?: string;
  siteIndex: string;
  steeringDigit: string;
  siteCode?: string;
  timeZone: string;
  voicemailPilotNumber?: string;
  mediaTraversalMode?: string;
  siteDescription?: string;
  emergencyCallBackNumber?: EmergencyCallbackNumber;
  preferredLanguage: string;
  country: string;
  dateFormat: string;
  timeFormat: string;
  routingPrefix?: string;
}

export interface IRSite extends IBaseSite {
  disableVoicemail?: string;
  regionCodeDialing?: IRegionCodeDialingResponse;
  voicemailPilotNumberGenerated?: string;
  allowExternalTransfer?: string;
  extensionLength: string;
}

export interface ISite extends IBaseSite {
  disableVoicemail: boolean;
  regionCodeDialing: IRegionCodeDialing;
  voicemailPilotNumberGenerated: boolean;
  allowExternalTransfer: boolean;
  extensionLength: number;
}

export class Site implements ISite {
  public uuid?: string;
  public siteIndex: string;
  public steeringDigit: string;
  public siteCode?: string;
  public timeZone: string;
  public voicemailPilotNumber?: string;
  public mediaTraversalMode?: string;
  public siteDescription?: string;
  public emergencyCallBackNumber?: EmergencyCallbackNumber;
  public extensionLength: number;
  public preferredLanguage: string;
  public country: string;
  public dateFormat: string;
  public timeFormat: string;
  public routingPrefix?: string;
  public disableVoicemail: boolean;
  public regionCodeDialing: IRegionCodeDialing;
  public voicemailPilotNumberGenerated: boolean;
  public allowExternalTransfer: boolean;

  constructor(site: IRSite = {
    uuid: undefined,
    siteCode: undefined,
    siteIndex: DEFAULT_SITE_INDEX,
    steeringDigit: DEFAULT_STEERING_DIGIT,
    timeZone: DEFAULT_TIME_ZONE,
    voicemailPilotNumber: undefined,
    mediaTraversalMode: undefined,
    siteDescription: undefined,
    emergencyCallBackNumber: undefined,
    extensionLength: DEFAULT_EXTENSION_LENGTH,
    preferredLanguage: DEFAULT_LANGUAGE,
    country: DEFAULT_COUNTRY,
    dateFormat: DEFAULT_DATE_FORMAT,
    timeFormat: DEFAULT_TIME_FORMAT,
    routingPrefix: undefined,
    disableVoicemail: undefined,
    voicemailPilotNumberGenerated: undefined,
    allowExternalTransfer: undefined,
    regionCodeDialing: undefined,
  }) {
    this.uuid = site.uuid;
    this.siteCode = site.siteCode;
    this.siteIndex = site.siteIndex;
    this.steeringDigit = _.isNull(site.steeringDigit) ? NULL : site.steeringDigit;
    this.timeZone = site.timeZone;
    this.voicemailPilotNumber = site.voicemailPilotNumber;
    this.mediaTraversalMode = site.mediaTraversalMode;
    this.siteDescription = site.siteDescription;
    this.emergencyCallBackNumber = site.emergencyCallBackNumber;
    this.extensionLength = _.toSafeInteger(site.extensionLength);
    this.preferredLanguage = site.preferredLanguage;
    this.country = site.country;
    this.dateFormat = site.dateFormat;
    this.timeFormat = site.timeFormat;
    this.routingPrefix = site.routingPrefix;
    this.disableVoicemail = (site.disableVoicemail === 'true');
    this.allowExternalTransfer = (site.allowExternalTransfer === 'true');
    this.voicemailPilotNumberGenerated = (site.voicemailPilotNumberGenerated === 'true');
    this.regionCodeDialing = new RegionCodeDialing(_.get<IRegionCodeDialingResponse>(site, 'regionCodeDialing'));
  }
}

export class EmergencyCallbackNumber {
  public uuid: string;
  public pattern: string;
}

interface IBaseRegionCodeDialing {
  regionCode: string;
}

interface IRegionCodeDialingResponse extends IBaseRegionCodeDialing {
  useSimplifiedNationalDialing: string;
}

interface IRegionCodeDialing extends IBaseRegionCodeDialing {
  useSimplifiedNationalDialing: boolean;
}

export class RegionCodeDialing implements IRegionCodeDialing {
  public regionCode;
  public useSimplifiedNationalDialing;

  constructor(regionCode: IRegionCodeDialingResponse) {
    this.regionCode = _.get(regionCode, 'regionCode');
    this.useSimplifiedNationalDialing = (_.get(regionCode, 'useSimplifiedNationalDialing') === 'true');
  }
}
