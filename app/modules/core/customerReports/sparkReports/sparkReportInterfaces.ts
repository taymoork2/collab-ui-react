import {
  IActiveUserData,
  IActiveTableBase,
  IDropdownBase,
  IGraphBase,
  IMediaQualityData,
} from '../../partnerReports/partnerReportInterfaces';

export interface IActiveUserWrapper {
  graphData: Array<IActiveUserData>;
  isActiveUsers: boolean;
}

export interface IActiveTableWrapper {
  tableData: Array<IActiveTableBase>;
  error: boolean;
}

export interface IAvgRoomData extends IGraphBase {
  totalRooms: number;
  oneToOneRooms: number;
  groupRooms: number;
  avgRooms: number | string;
}

export interface IEndpointWrapper {
  deviceType: string;
  graph: Array<IEndpointData>;
  balloon: boolean;
  emptyGraph: boolean;
}

export interface IEndpointData {
  date: string;
  totalRegisteredDevices: number;
}

export interface IEndpointContainer {
  graphData: Array<IEndpointWrapper>;
  filterArray: Array<IDropdownBase>;
}

export interface IFilesShared extends IGraphBase {
  contentShared: number;
  contentShareSizes: number | string;
}

export interface IMetricsData {
  dataProvider: Array<IMetricsDataProvider>;
  displayData: IMetricsLabel | undefined;
  dummy: boolean;
}

export interface IMetricsLabel {
  totalCalls: number;
  totalAudioDuration: number;
  totalFailedCalls: number | string;
}

export interface IMetricsDataProvider {
  callCondition: string;
  numCalls: number;
  percentage: number;
  color: string;
}

export interface IMediaData extends IMediaQualityData {
  totalAudioDurationSum: number;
  goodAudioQualityDurationSum: number;
  fairAudioQualityDurationSum: number;
  poorAudioQualityDurationSum: number;
  partialAudioSum: number;
  totalVideoDurationSum: number;
  goodVideoQualityDurationSum: number;
  fairVideoQualityDurationSum: number;
  poorVideoQualityDurationSum: number;
  partialVideoSum: number;
}
