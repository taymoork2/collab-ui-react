export class CmiSite {
  constructor(obj = {
    siteIndex: undefined,
    steeringDigit: undefined,
    timeZone: undefined,
    voicemailPilotNumberGenerated: undefined,
    extensionLength: undefined,
    preferredLanguage: undefined,
    country: undefined,
    dateFormat: undefined,
    timeFormat: undefined,
    routingPrefix: undefined,
    regionCodeDialing: undefined,
    toggleEnabled: undefined,
  }) {
    this.siteIndex = obj.siteIndex || '000001';
    this.steeringDigit = obj.steeringDigit || '9';
    this.timeZone = obj.timeZone || 'America/Los_Angeles';
    this.voicemailPilotNumberGenerated = obj.voicemailPilotNumberGenerated || false;
    this.extensionLength = obj.extensionLength || '3';
    this.preferredLanguage = obj.preferredLanguage || 'en_US';
    this.country = obj.country || 'US';
    this.dateFormat = obj.dateFormat || 'M-D-Y';
    this.timeFormat = obj.timeFormat || '24-hour';
    this.routingPrefix = obj.routingPrefix || null;
    this.regionCodeDialing = obj.regionCodeDialing || { useSimplifiedNationalDialing: false };
    this.toggleEnabled = obj.toggleEnabled || true;
  }
}
