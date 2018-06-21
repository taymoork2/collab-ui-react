import { ISoftwareProfile, SoftwareProfile } from './hcs-swprofile';

export const GROUP_TYPE_UNASSIGNED: string = 'Unassigned';

export enum EApplicationTypes {
  CUCM = 'CUCM',
  CUP = 'CUP',
  IMP = 'IM&P',
  CUC = 'CUC',
  EXPY = 'EXPRESSWAY',
  PLM = 'PLM',
  CUCM_PLM = 'CUCM_PLM',
  CER = 'CER',
}

export interface IHcsCluster {
  uuid?: string;
  name: string;
  url?: string;
  sftpServer?: ISftpServerItem | null;
  nodes?: IHcsNode[] | null;
  customerUuid?: string | null;
  sftpServerUuid?: string;
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
  isAccepted?: boolean;
  isRejected?: boolean;
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
  public isAccepted?: boolean;
  public isRejected?: boolean;
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
    isAccepted?: false;
    isRejected?: false;
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
    this.isAccepted = obj.isAccepted;
    this.isRejected = obj.isRejected;
  }
}

export class HcsCluster implements IHcsCluster {
  public uuid?: string;
  public name: string;
  public nodes?: IHcsNode[] | null;
  public url?: string;
  public sftpServer?: ISftpServerItem | null;
  public customerUuid?: string | null;
  constructor(obj: {
    uuid?: '',
    name: '',
    nodes?: null,
    url?: undefined,
    sftpServer?: null;
    customerUuid?: null;
  }) {
    this.uuid = obj.uuid;
    this.name = obj.name;
    this.url = obj.url;
    this.sftpServer = obj.sftpServer;
    this.nodes = _.clone(obj.nodes);
    this.customerUuid = obj.customerUuid;
  }
}

export interface INodeSummaryItem {
  hostName: string;
  typeApplication: string;
  publisher: boolean;
  ipAddress: string;
  activeVersion: string;
}

export interface IHcsClusterSummaryItem {
  uuid: string;
  name: string;
  nodes: INodeSummaryItem[];
  url?: string;
  sftpServer?: ISftpServerItem;
  clusterStatus?: string;
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

export interface IHcsUpgradeCustomer {
  uuid: string;
  name?: string | null;
  status?: string | null;
  softwareProfile: ISoftwareProfile;
}

export class HcsUpgradeCustomer implements IHcsUpgradeCustomer {
  public uuid: string;
  public softwareProfile: ISoftwareProfile;

  constructor(obj: {
    uuid: '',
    softwareProfile: SoftwareProfile,
  }) {
    this.uuid = obj.uuid;
    this.softwareProfile = obj.softwareProfile;
  }
}

export interface IUpgradeClusterGridRow {
  customerId: string;
  clusterUuid: string;
  clusterName: string;
  applicationName: string;
  currentVersion: string;
  upgradeTo: string | undefined;
  clusterStatus: string;
  rowWidth: number;
}

export interface IHcsClusterTask {
  taskUuid: string;
  status: string;
  estimatedCompletion: any;
  nodeStatuses: INodeTaskStatus[];
}

export interface INodeTaskStatus {
  nodeUuid: string;
  order: number;
  hostName: string;
  typeApplication: string;
  publisher: boolean;
  previousDuration: any;
  started: any;
  elapsedTime: any;
  status: string;
}

export interface INodeTaskGridRow {
  name: string;
  application: string;
  isPublisher: boolean;
  uuid?: string;
}

export interface IClusterStatusGridRow {
  orderNumber: number;
  nodeDetails: INodeTaskGridRow;
  previousUpgradeTime: any;
  startTime: any;
  nodeStatus: string;
  elapsedTime: any;
}
