import {
  ICallMetricsBase,
  IGraphBase,
} from '../partnerReports/partnerReportInterfaces';

export interface IAvgRoomData extends IGraphBase {
  totalRooms: number;
  oneToOneRooms: number;
  groupRooms: number;
  avgRooms: number;
}

export interface IEndpointWrapper {
  deviceType: string;
  graph: Array<IEndpointData>;
  balloon: boolean;
}

export interface IEndpointData {
  date: string;
  totalRegisteredDevices: number;
}

export interface IFilesShared extends IGraphBase {
  contentShared: number;
  contentShareSizes: number;
}

export interface IMetricsData extends ICallMetricsBase {
  dataProvider: Array<IMetricsDataProvider>;
}

export interface IMetricsDataProvider {
  callCondition: string;
  numCalls: number;
  percentage: number;
  color: string;
}
