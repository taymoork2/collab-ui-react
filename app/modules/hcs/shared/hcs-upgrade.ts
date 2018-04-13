export interface IHcsCluster {
  uuid: string;
  name: string;
  hcsNodes?: IHcsNode[] | null | undefined;
}

export interface IHcsNode {
  uuid: string;
  application?: string | null;
  activeVersion?: string | null;
  inactiveVersion?: string | null;
  publisher: boolean;
  hostname: string;
  ipAddress?: string | null;
  clusterUuid: string;
  latestTaskName?: string | null;
  latestTaskStatus?: string | null;
  sftpServer?: string | null;
}

export class HcsNode implements IHcsNode {
  public uuid: string;
  public application?: string | null | undefined;
  public activeVersion?: string | null | undefined;
  public inactiveVersion?: string | null | undefined;
  public publisher: boolean;
  public hostname: string;
  public ipAddress?: string | null | undefined;
  public clusterUuid: string;
  public latestTaskName?: string | null | undefined;
  public latestTaskStatus?: string | null | undefined;
  public sftpServer?: string | null | undefined;
  constructor(obj: {
    uuid: '';
    application?: undefined;
    activeVersion?: null;
    inactiveVersion?: null;
    publisher: false;
    hostname: ''
    ipAddress?: null;
    clusterUuid: '';
    latestTaskName?: null
    latestTaskStatus?: null
    sftpServer?: null;
  }) {
    this.uuid = obj.uuid;
    this.application = obj.application;
    this.activeVersion = obj.activeVersion;
    this.inactiveVersion = obj.inactiveVersion;
    this.publisher = obj.publisher;
    this.hostname = obj.hostname;
    this.ipAddress = obj.ipAddress;
    this.clusterUuid = obj.clusterUuid;
    this.latestTaskName = obj.latestTaskName;
    this.latestTaskStatus = obj.latestTaskStatus;
    this.sftpServer = obj.sftpServer;
  }
}

export class HcsCluster implements IHcsCluster {
  public uuid: string;
  public name: string;
  public hcsNodes: null | undefined;
  constructor(obj: {
    uuid: '',
    name: '',
    hcsNodes: null,
  }) {
    this.uuid = obj.uuid;
    this.name = obj.name;
    this.hcsNodes = _.clone(obj.hcsNodes);
  }
}
