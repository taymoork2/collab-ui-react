export interface IApplicationVersion {
  typeApplication: string;
  fileData: IFileData[];
}

export interface IFileData {
  uuid: string;
  version?: string;
  fileName?: string;
}

export interface ISoftwareProfileAppVersion extends IFileData {
  typeApplication: string;
}

export class SoftwareProfileAppVersion implements ISoftwareProfileAppVersion {
  public typeApplication: string;
  public uuid: string;
  public version?: string;
  public fileName?: string;
  constructor (obj: {
    typeApplication: '',
    uuid: '',
    version?: '',
    fileName?: '',
  }) {
    this.typeApplication = obj.typeApplication;
    this.uuid = obj.uuid;
    this.version = obj.version;
    this.fileName = obj.fileName;
  }
}

export interface ISoftwareProfile {
  name: string;
  uuid?: string;
  url?: string;
  applicationVersions?: ISoftwareProfileAppVersion[];
}

export interface ISoftwareVersions {
  name: string;
  versions: ISoftwareProfileAppVersion[];
}

export class SoftwareProfile implements ISoftwareProfile {
  public name: string;
  public uuid?: string;
  public url?: string;
  public applicationVersions?: ISoftwareProfileAppVersion[];
  constructor (obj: {
    name: '',
    uuid?: '',
    url?: '',
  }) {
    this.name = obj.name;
    this.uuid = obj.uuid;
    this.url = obj.url;
  }
}
