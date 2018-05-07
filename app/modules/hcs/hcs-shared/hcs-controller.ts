export interface IFileInfo {
  uuid: string;
  fileName: string;
  md5: string;
  location: string;
  size: number;
  fileType: string;
  downloadUrl: string;
}

export interface IHcsInstallables {
  uuid: string;
  label: string;
  proxies: string[];
  fileInfo?: IFileInfo[];
}

export interface IControllerNode {
  uuid: string;
  hostname: string;
  ipAddress: string;
  applicationType: string;
  partnerOrgId: string;
  customerOrgId: string | null;
  agent: IAgent;
  nodeStatus: string;
}

export interface IAgent {
  uuid: string;
  agentVersion: string;
  agentType: string;
  verificationCode: string;
  machineAccountUuid: string | null;
  lastAuthMethod: string;
  lastCheckIn: string;
  installed: string;
  verified: string | null;
}

export class FileInfo implements IFileInfo {
  public uuid: string;
  public fileName: string;
  public md5: string;
  public location: string;
  public size: number;
  public fileType: string;
  public downloadUrl: string;
  constructor(obj: IFileInfo = {
    uuid: '',
    fileName: '',
    md5: '',
    location: '',
    size: 0,
    fileType: '',
    downloadUrl: '',
  }) {
    this.uuid = obj.uuid;
    this.fileName = obj.fileName;
    this.md5 = obj.md5;
    this.location = obj.location;
    this.size = obj.size;
    this.fileType = obj.fileType;
    this.downloadUrl = obj.downloadUrl;
  }
}

export class HcsInstallables implements IHcsInstallables {
  public uuid: string;
  public label: string;
  public proxies: string[];
  public fileInfo?: IFileInfo[];
  constructor(obj: IHcsInstallables = {
    uuid: '',
    label: '',
    proxies: [],
    fileInfo: [],
  }) {
    this.uuid = obj.uuid;
    this.label = obj.label;
    this.proxies = obj.proxies;
    this.fileInfo = obj.fileInfo;
  }
}
