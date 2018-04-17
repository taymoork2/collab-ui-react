export interface ICheckbox {
  license: boolean;
  upgrade: boolean;
}
export interface ISoftwareProfile {
  softwareProfileName: string;
  cucmVersion: string;
  ucxnVersion: string;
  plmVersion: string;
  cerVersion: string;
  expyVersion: string;
}

export class SoftwareProfile implements ISoftwareProfile {
  public softwareProfileName: string;
  public cucmVersion: string;
  public ucxnVersion: string;
  public plmVersion: string;
  public cerVersion: string;
  public expyVersion: string;
  constructor (obj: {
    softwareProfileName: '',
    cucmVersion: '',
    ucxnVersion: '',
    plmVersion: '',
    cerVersion: '',
    expyVersion: '',
  }) {
    this.softwareProfileName = obj.softwareProfileName;
    this.cucmVersion = obj.cucmVersion;
    this.ucxnVersion = obj.ucxnVersion;
    this.plmVersion = obj.plmVersion;
    this.cerVersion = obj.cerVersion;
    this.expyVersion = obj.expyVersion;
  }
}
