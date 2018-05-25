import { IHcsPaging } from './hcs-upgrade';

export interface IApplicationVersion {
  typeApplication: string;
  fileData: IFileData[];
}

export interface IFileData {
  uuid: string;
  version?: string;
  fileName?: string;
}

export interface ISoftwareAppVersion extends IFileData {
  typeApplication: string;
}

export class SoftwareAppVersion implements ISoftwareAppVersion {
  public typeApplication: string;
  public uuid: string;
  public version?: string;
  public fileName?: string;
  constructor (obj: {
    typeApplication: '',
    uuid: '',
    version: '',
    fileName: '',
  }) {
    this.typeApplication = obj.typeApplication;
    this.uuid = obj.uuid;
    this.version = obj.version;
    this.fileName = obj.fileName;
  }
}

export interface ISoftwareProfile {
  name: string;
  uuid: string;
  url?: string;
  applicationVersions?: SoftwareAppVersion[] | null;
}

export interface ISoftwareVersion {
  typeApplication: string;
  uuid: string;
}


export class SoftwareProfile implements ISoftwareProfile {
  public name: string;
  public uuid: string;
  public url?: string;
  public applicationVersions?: SoftwareAppVersion[] | null;
  constructor (obj: {
    name: '',
    uuid: '',
    url?: '',
    applicationVersions?: SoftwareAppVersion[],
  }) {
    this.name = obj.name;
    this.uuid = obj.uuid;
    this.url = obj.url;
    this.applicationVersions = obj.applicationVersions;
  }
}

export interface ISoftwareProfilesObject {
  softwareProfiles: ISoftwareProfile[];
  url: string;
  paging: IHcsPaging;
}
