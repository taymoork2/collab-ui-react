export enum EApplicationTypes {
  CUCM = 'CUCM',
  IMP = 'CUP',
  CUC = 'CUC',
  EXPY = 'EXPRESSWAY',
  PLM = 'PLM',
  CUCM_PLM = 'CUCM_PLM',
  CER = 'CER',
}

export interface IHcsCluster {
  uuid: string;
  name: string;
  url?: string;
  sftpServer?: ISftpServerItem | null;
  nodes: IHcsNode[] | null;
}

export interface IHcsNode {
  uuid: string;
  nodeUuid: string;
  application?: string | null;
  activeVersion?: string | null;
  inactiveVersion?: string | null;
  description?: string | null;
  publisher: boolean;
  hostname: string;
  ipAddress?: string | null;
  agentUuid: string | null;
  clusterUuid: string;
  latestTaskName?: string | null;
  latestTaskStatus?: string | null;
  sftpServer?: ISftpServerItem | null;
  status?: string;
  verificationCode?: string;
}

export interface ISftpServerItem {
  sftpServerUuid: string;
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
  public nodeUuid: string;
  public application?: string | null | undefined;
  public activeVersion?: string | null | undefined;
  public inactiveVersion?: string | null | undefined;
  public description?: string | null;
  public publisher: boolean;
  public hostname: string;
  public ipAddress?: string | null | undefined;
  public agentUuid: string | null;
  public clusterUuid: string;
  public latestTaskName?: string | null | undefined;
  public latestTaskStatus?: string | null | undefined;
  public sftpServer?: ISftpServerItem | null | undefined;
  public status?: string;
  public verificationCode?: string;
  constructor(obj: {
    uuid: '';
    nodeUuid: '',
    application?: undefined;
    activeVersion?: null;
    inactiveVersion?: null;
    description?: null;
    publisher: false;
    hostname: ''
    ipAddress?: null;
    agentUuid: '';
    clusterUuid: '';
    latestTaskName?: null
    latestTaskStatus?: null
    sftpServer?: null;
    status?: undefined;
    verificationCode?: undefined;
  }) {
    this.uuid = obj.uuid;
    this.nodeUuid = obj.nodeUuid;
    this.application = obj.application;
    this.activeVersion = obj.activeVersion;
    this.inactiveVersion = obj.inactiveVersion;
    this.description = obj.description;
    this.publisher = obj.publisher;
    this.hostname = obj.hostname;
    this.ipAddress = obj.ipAddress;
    this.agentUuid = obj.agentUuid;
    this.clusterUuid = obj.clusterUuid;
    this.latestTaskName = obj.latestTaskName;
    this.latestTaskStatus = obj.latestTaskStatus;
    this.sftpServer = obj.sftpServer;
    this.status = obj.status;
    this.verificationCode = obj.verificationCode;
  }
}

export class HcsCluster implements IHcsCluster {
  public uuid: string;
  public name: string;
  public nodes: IHcsNode[] | null;
  public url?: string;
  public sftpServer?: ISftpServerItem | null;
  constructor(obj: {
    uuid: '',
    name: '',
    nodes: null,
    url: undefined,
    sftpServer: null;
  }) {
    this.uuid = obj.uuid;
    this.name = obj.name;
    this.url = obj.url;
    this.sftpServer = obj.sftpServer;
    this.nodes = _.clone(obj.nodes);
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
  nodes: INodeSummaryItem[];
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

export interface ISftpServer {
  uuid: string;
  name: string;
  server: string;
  path: string;
  userName: string;
  url: string;
}

export interface ISftpServersObject {
  url: string;
  sftpServers: ISftpServer[];
  paging: IHcsPaging;
}
