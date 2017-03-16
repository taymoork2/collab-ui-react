const DEFAULT_TIME_ZONE: string = 'America/Los_Angeles';
const DEFAULT_TIME_FORMAT: string = '24-hour';
const DEFAULT_DATE_FORMAT: string = 'M-D-Y';
const DEFAULT_LANGUAGE: string = 'en_US';
const DEFAULT_COUNTRY: string = 'US';
const DEFAULT_EXTENSION_LENGTH: string = '3';
const DEFAULT_STEERING_DIGIT: string = '9';
const DEFAULT_SITE_INDEX: string = '000001';

export class Site {
  public uuid?: string;
  public siteIndex: string;
  public steeringDigit: string;
  public siteCode: string;
  public timeZone: string;
  public voicemailPilotNumber: string | undefined;
  public mediaTraversalMode: string | undefined;
  public siteDescription: string | undefined;
  public allowInternationalDialing: string | undefined;
  public emergencyCallbackNumber: EmergencyCallbackNumber | undefined;
  public extensionLength: string;
  public voicemailPilotNumberGenerated: string;
  public preferredLanguage: string;
  public country: string;
  public dateFormat: string;
  public timeFormat: string;
  public routingPrefix?: string;
  public disableVoicemail?: boolean;

  constructor(obj: {
    uuid?: string,
    siteIndex: string,
    steeringDigit: string,
    timeZone: string,
    voicemailPilotNumber?: string,
    mediaTraversalMode?: string,
    siteDescription?: string,
    allowInternationalDialing?: string,
    emergencyCallbackNumber?: EmergencyCallbackNumber,
    extensionLength: string,
    voicemailPilotNumberGenerated: string,
    preferredLanguage: string,
    country: string,
    dateFormat: string,
    timeFormat: string,
    routingPrefix?: string,
    disableVoicemail?: boolean,
  } = {
    uuid: undefined,
    siteIndex: DEFAULT_SITE_INDEX,
    steeringDigit: DEFAULT_STEERING_DIGIT,
    timeZone: DEFAULT_TIME_ZONE,
    voicemailPilotNumber: undefined,
    mediaTraversalMode: undefined,
    siteDescription: undefined,
    allowInternationalDialing: undefined,
    emergencyCallbackNumber: undefined,
    extensionLength: DEFAULT_EXTENSION_LENGTH,
    voicemailPilotNumberGenerated: 'false',
    preferredLanguage: DEFAULT_LANGUAGE,
    country: DEFAULT_COUNTRY,
    dateFormat: DEFAULT_DATE_FORMAT,
    timeFormat: DEFAULT_TIME_FORMAT,
    routingPrefix: undefined,
    disableVoicemail: undefined,
  }) {
    this.uuid = obj.uuid;
    this.siteIndex = obj.siteIndex;
    this.steeringDigit = obj.steeringDigit;
    this.timeZone = obj.timeZone;
    this.voicemailPilotNumber = obj.voicemailPilotNumber;
    this.mediaTraversalMode = obj.mediaTraversalMode;
    this.siteDescription = obj.siteDescription;
    this.allowInternationalDialing = obj.allowInternationalDialing;
    this.emergencyCallbackNumber = obj.emergencyCallbackNumber;
    this.extensionLength = obj.extensionLength;
    this.voicemailPilotNumberGenerated = obj.voicemailPilotNumberGenerated;
    this.preferredLanguage = obj.preferredLanguage;
    this.country = obj.country;
    this.dateFormat = obj.dateFormat;
    this.timeFormat = obj.timeFormat;
    this.routingPrefix = obj.routingPrefix;
    this.disableVoicemail = obj.disableVoicemail;
  }
}

export class EmergencyCallbackNumber {
  public uuid: string;
  public pattern: string;
}
