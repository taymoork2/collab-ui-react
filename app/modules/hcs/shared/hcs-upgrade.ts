export interface IHcsCluster {
  uuid: string;
  name: string;
  hcsNodes?: IHcsNode[] | null | undefined;
  url?: string;
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

export interface ISftpServerItem {
  uuid: string;
  name: string;
}

export interface IApplicationItem {
  name: string;
  count: number;
}

export interface IClusterItem {
  id: string;
  name: string;
  status: string;
  applications: IApplicationItem[];
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
  public hcsNodes?: IHcsNode[] | null | undefined;
  public url?: string;
  constructor(obj: {
    uuid: '',
    name: '',
    hcsNodes: null,
    url: undefined,
  }) {
    this.uuid = obj.uuid;
    this.name = obj.name;
    this.url = obj.url;
    this.hcsNodes = _.clone(obj.hcsNodes);
  }
}

export interface INodeSummaryItem {
  hostName: string;
  typeApplication: string;
  isPublisher: boolean;
  ipAddress: string;
}

export interface IHcsClusterSummaryItem {
  uuid: string;
  name: string;
  hcsNodes: INodeSummaryItem[];
  url?: string;
  sftpServer?: ISftpServerItem;
  status?: string;
}

export interface IHcsPaging {
  next?: number| null;
  prev?: number| null;
  limit: number| null;
  offset: number| null;
  pages?: number| null;
  count?: number| null;
}

export interface IHcsCustomerClusters {
  url: string;
  clusters: IHcsClusterSummaryItem[];
  paging: IHcsPaging;
}
