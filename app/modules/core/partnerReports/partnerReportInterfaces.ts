// Used by the time Filter
export interface ITimespan {
  value: number;
  label: string;
  description: string;
}

// Used by the Customer Filter
export interface IReportsCustomer {
  value: string;
  label: string;
  isAllowedToManage: boolean;
  isSelected: boolean;
}

// Table information used by the report-card
export interface IReportsTable {
  headers: Array<IReportsHeader>;
  data: any;
  dummy: boolean;
}

export interface IReportsHeader {
  title: string;
  class: string;
}

export interface IReportSortOption {
  option: string;
  direction: boolean;
}

// Endpoint interface
export interface IEndpointData {
  class: string;
  output: Array<string>;
  splitClasses: string | void;
}

// Call Metrics Interfaces
export interface ICallMetricsData {
  dataProvider: Array<ICallMetricsDataProvider>;
  labelData: ICallMetricsLabels;
  dummy: boolean;
}

export interface ICallMetricsLabels {
  numTotalCalls: number;
  numTotalMinutes: number;
}

export interface ICallMetricsDataProvider {
  label: string;
  // value can be string or number
  value: any;
  color: string;
}

// Media Quality Interface
export interface IMediaQualityData {
  date: string | void;
  totalDurationSum: number;
  partialSum: number;
  goodQualityDurationSum: number;
  fairQualityDurationSum: number;
  poorQualityDurationSum: number;
  balloon: boolean;
}

// Active User interfaces
export interface IActiveUserCustomerData {
  graphData: Array<IActiveUserData>;
  populationData: IPopulationData;
  totalActive: number;
  totalRegistered: number;
}

export interface IActiveUserData {
  date: string;
  totalRegisteredUsers: number;
  activeUsers: number;
  percentage: number;
  balloon: boolean;
}

export interface IActiveTableData {
  orgName: string;
  numCalls: number;
  totalActivity: number;
  sparkMessages: number;
  userName: string;
}

export interface IPopulationData {
  customerName: string | void;
  percentage: number | void;
  overallPopulation: number;
  color: string | void;
  balloon: boolean;
  labelColorField: string;
}

export interface IActiveUserReturnData {
  graphData: Array<IActiveUserData>;
  popData: Array<IPopulationData>;
  isActiveUsers: boolean;
}

// Query types for report retrieval
export interface IIntervalQuery {
  action: string;
  type: string;
  intervalCount: number;
  intervalType: string;
  spanCount: number;
  spanType: string;
  cache: boolean;
}

export interface ITypeQuery {
  name: string;
  type: string;
  cache: boolean;
}

export interface IReportTypeQuery {
  action: string;
  type: string;
  reportType: string;
  cache: boolean;
}

export interface ICustomerIntervalQuery {
  action: string;
  type: string;
  intervalCount: number;
  intervalType: string;
  spanCount: number;
  spanType: string;
  cache: boolean;
  customerView: boolean;
}
