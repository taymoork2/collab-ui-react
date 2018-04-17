import {
  IActiveUserData,
  IDropdownBase,
  IGraphBase,
  IMediaQualityData,
} from '../../partnerReports/partnerReportInterfaces';

export interface IActiveUserWrapper {
  graphData: IActiveUserData[];
  isActiveUsers: boolean;
}

// TODO: remove IAvgRoomData when the switch from column graphs to line graphs is finalized
export interface IAvgRoomData extends IGraphBase {
  totalRooms: number;
  oneToOneRooms: number;
  groupRooms: number;
  avgRooms: number | string;
}

export interface ICharts {
  active?: any;
  rooms?: any;
  files?: any;
  media?: any;
  device?: any;
  metrics?: any;
}

export interface IEndpointWrapper {
  deviceType: string;
  graph: IEndpointData[];
  balloon: boolean;
  emptyGraph: boolean;
}

export interface IEndpointData {
  date: string;
  totalRegisteredDevices: number;
}

export interface IEndpointContainer {
  graphData: IEndpointWrapper[];
  filterArray: IDropdownBase[];
}

// TODO: remove IFilesShared when the switch from column graphs to line graphs is finalized
export interface IFilesShared extends IGraphBase {
  contentShared: number;
  contentShareSizes: number | string;
}

export interface IConversation extends IGraphBase {
  avgRooms: number | string;
  contentShared: number;
  contentShareSizes: number | string;
  totalRooms: number;
  oneToOneRooms: number;
  groupRooms: number;
}

export interface IConversationPopulated {
  files: boolean;
  rooms: boolean;
}

export interface IConversationWrapper {
  array: IConversation[];
  hasRooms: boolean;
  hasFiles: boolean;
}

export interface IMetricsData {
  dataProvider: IMetricsDataProvider[];
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

export interface IMinMax {
  min: number;
  max: number;
}

export interface IPlaceHolder {
  searchbox: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  to: string;
}
