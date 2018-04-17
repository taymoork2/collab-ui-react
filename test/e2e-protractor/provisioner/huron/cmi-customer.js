const PACKAGE_VOICE_ONLY = 'VOICE_ONLY';

export class CmiCustomer {
  constructor(obj = {
    uuid: undefined,
    name: undefined,
    servicePackage: undefined,
    countryCode: undefined,
  }) {
    this.uuid = obj.uuid;
    this.name = obj.name;
    this.servicePackage = obj.servicePackage || PACKAGE_VOICE_ONLY;
    this.countryCode = obj.countryCode || 'US';
  }
}
