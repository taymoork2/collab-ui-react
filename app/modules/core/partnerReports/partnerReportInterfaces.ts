// base interfaces
export interface IGraphBase {
  date: string;
  balloon: boolean;
}

export interface IDropdownBase {
  value: number | string;
  label: string;
}

// export menu
export interface IExportDropdown {
  header: IExportMenu;
  menu: IExportMenu[];
}

export interface IExportMenu {
  id: string;
  label: string;
  click?: Function;
}

// time slider
export interface ITimeSliderFunctions {
  sliderUpdate?: Function;
  update: Function;
}

export interface ITimespan extends IDropdownBase {
  description: string;
  min: number;
  max: number;
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
  toggle?: Function;
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
  table?: IReportsTable;
  titlePopover: string;
}

export interface IReportCardTable extends IReportCard {
  table: IReportsTable;
}

export interface ISecondaryReport {
  alternateTranslations: boolean;
  broadcast: string;
  description: string;
  display: boolean;
  emptyDescription: string;
  errorDescription: string;
  missingUsersErrorDescription?: string;
  search: boolean;
  state: string;
  sortOptions: IReportSortOption[];
  table: IReportsTable;
  title: string;
}

export interface IReportDropdown {
  array: IDropdownBase[];
  click: Function;
  disabled: boolean;
  selected: IDropdownBase;
}

export interface IReportsTable {
  headers: IReportsHeader[];
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
  class?: string;
  click?: Function;
  hidden: boolean;
  number: number | string;
  text: string;
}

export interface IReportTooltip {
  title: string;
  text: string;
}

// Endpoint interface
export interface IEndpointData {
  class: string;
  output: string[];
  splitClasses?: string;
}

// Call Metrics Interfaces
export interface ICallMetricsData {
  dataProvider: ICallMetricsDataProvider[];
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
  graphData: IActiveUserData[];
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
  customerName?: string;
  percentage?: number;
  overallPopulation: number;
  color?: string;
  balloon: boolean;
  labelColorField: string;
}

export interface IActiveUserReturnData {
  graphData: IActiveUserData[];
  popData: IPopulationData[];
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
  extension?: string;
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
  customerView?: boolean;
}

export interface IPartnerCharts {
  active?: any;
  devices?: any;
  metrics?: any;
  media?: any;
  population?: any;
}
