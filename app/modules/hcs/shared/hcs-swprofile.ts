export interface IApplicationVersion {
  typeApplication: string;
  applicationUuid: string;
}

export interface ISoftwareProfile {
  name: string;
  uuid: string;
}

export interface ISoftwareVersions {
  name: string;
  versions: IApplicationVersion[];
}

export class SoftwareProfile implements ISoftwareProfile {
  public name: string;
  public uuid: string;
  constructor (obj: {
    name: '',
    uuid: '',
  }) {
    this.name = obj.name;
    this.uuid = obj.uuid;
  }
}
