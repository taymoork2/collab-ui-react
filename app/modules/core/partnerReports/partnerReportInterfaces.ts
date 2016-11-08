// base interfaces
export interface IGraphBase {
  date: string;
  balloon: boolean;
}

export interface IDropdownBase {
  value: number | string;
  label: string;
}

// Used by the time Filter
export interface ITimespan extends IDropdownBase {
  description: string;
}

// Used by the Customer Filter
export interface IReportsCustomer extends IDropdownBase {
  isAllowedToManage: boolean;
  isSelected: boolean;
}

// used by the Reports Filter
export interface IFilterObject {
  id: string;
  label: string;
  selected: boolean;
  toggle: Function | void;
}

// Table information used by the report-card
export interface IReportCard {
  // Top Report Variables
  animate: boolean;
  description: string;
  headerTitle: string;
  id: string;
  reportType: string;
  state: string;
  table: IReportsTable | void;
  titlePopover: string;
}

export interface ISecondaryReport {
  alternateTranslations: boolean;
  broadcast: string;
  description: string;
  display: boolean;
  emptyDescription: string;
  errorDescription: string;
  search: boolean;
  state: string;
  sortOptions: Array<IReportSortOption>;
  table: IReportsTable | void;
  title: string;
}

export interface IReportDropdown {
  array: Array<IDropdownBase>;
  click: Function;
  disabled: boolean;
  selected: IDropdownBase;
}

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

export interface IReportLabel {
  number: number | string;
  text: string;
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
  value: number;
  label: string;
  color: string;
}

// Media Quality Interface
export interface IMediaQualityData extends IGraphBase {
  totalDurationSum: number;
  partialSum: number;
  goodQualityDurationSum: number;
  fairQualityDurationSum: number;
  poorQualityDurationSum: number;
}

// Active User interfaces
export interface IActiveUserCustomerData {
  graphData: Array<IActiveUserData>;
  populationData: IPopulationData;
  totalActive: number;
  totalRegistered: number;
}

export interface IActiveUserData extends IGraphBase {
  totalRegisteredUsers: number;
  activeUsers: number;
  percentage: number;
}

export interface IActiveTableBase {
  numCalls: number;
  totalActivity: number;
  sparkMessages: number;
  userName: string;
}

export interface IActiveTableData extends IActiveTableBase {
  orgName: string;
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
