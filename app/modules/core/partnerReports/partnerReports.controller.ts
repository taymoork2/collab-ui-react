import {
  IActiveUserData,
  IActiveUserReturnData,
  IActiveTableData,
  ICallMetricsData,
  IEndpointData,
  IMediaQualityData,
  IPopulationData,
  IReportCard,
  IReportsCustomer,
  ITimespan,
  ISecondaryReport,
} from './partnerReportInterfaces';

class PartnerReportCtrl {
  // tracking when initialization has completed
  private initialized: boolean = false;

  // page charts
  private activeUsersChart: any = null;
  private callMetricsChart: any = null;
  private mediaQualityChart: any = null;
  private popChart: any = null;

  /* @ngInject */
  constructor(
    private $q: ng.IQService,
    private $rootScope: ng.IRootScopeService,
    private $timeout: ng.ITimeoutService,
    private $translate: ng.translate.ITranslateService,
    private Authinfo,
    private ReportConstants,
    private DummyReportService,
    private GraphService,
    private ReportService
  ) {
    this.ReportService.getOverallActiveUserData(this.timeSelected);
    this.ReportService.getCustomerList().then((response: Array<any>) => {
      this.setAllDummyData();
      this.updateCustomerFilter(response);
      if (this.customerSelected.length > 0) {
        this.getRegisteredEndpoints();
        this.getMediaQualityReports();
        this.getActiveUserReports();
        this.getCallMetricsReports();
      } else {
        this.setAllNoData();
      }
      this.resize(0);
      this.initialized = true;
    });
  }

  // filter controls for which reports show up on screen
  public showEngagement: boolean = true;
  public showQuality: boolean = true;
  public readonly ALL: string = this.ReportConstants.ALL;
  public readonly ENGAGEMENT: string = this.ReportConstants.ENGAGEMENT;
  public readonly QUALITY: string = this.ReportConstants.QUALITY;
  private currentFilter: string = this.ALL;

  // Active User Options
  public activeUserReportOptions: IReportCard = {
    animate: false,
    description: 'activeUsers.description',
    headerTitle: 'activeUsers.activeUsers',
    id: 'activeUsers',
    reportType: this.ReportConstants.BARCHART,
    state: this.ReportConstants.REFRESH,
    table: undefined,
    titlePopover: this.ReportConstants.UNDEF,
  };

  public activeUserSecondaryReportOptions: ISecondaryReport = {
    broadcast: 'ReportCard::UpdateSecondaryReport',
    description: 'activeUsers.mostActiveDescription',
    display: false,
    state: this.ReportConstants.REFRESH,
    sortOptions: [{
      option: 'userName',
      direction: false,
    }, {
      option: 'orgName',
      direction: false,
    }, {
      option: 'numCalls',
      direction: false,
    }, {
      option: 'sparkMessages',
      direction: true,
    }, {
      option: 'totalActivity',
      direction: true,
    }],
    table: {
      headers: [{
        title: 'activeUsers.user',
        class: 'col-md-4 pointer',
      }, {
        title: 'activeUsers.customer',
        class: 'col-md-4 pointer',
      }, {
        title: 'activeUsers.calls',
        class: 'horizontal-center col-md-2 pointer',
      }, {
        title: 'activeUsers.sparkMessages',
        class: 'horizontal-center col-md-2 pointer',
      }],
      data: [],
      dummy: false,
    },
    title: 'activeUsers.mostActiveUsers',
  };

  public populationReportOptions: IReportCard = {
    animate: false,
    description: 'activeUserPopulation.description',
    headerTitle: 'activeUserPopulation.titleByCompany',
    id: 'userPopulation',
    reportType: this.ReportConstants.BARCHART,
    state: this.ReportConstants.REFRESH,
    table: undefined,
    titlePopover: this.ReportConstants.UNDEF,
  };

  // Media report options
  public mediaReportOptions: IReportCard = {
    animate: true,
    description: 'mediaQuality.description',
    headerTitle: 'mediaQuality.mediaQuality',
    id: 'mediaQuality',
    reportType: this.ReportConstants.BARCHART,
    state: this.ReportConstants.REFRESH,
    table: undefined,
    titlePopover: 'mediaQuality.packetLossDefinition',
  };

  // endpoint report options
  public endpointReportOptions: IReportCard = {
    animate: true,
    description: 'registeredEndpoints.description',
    headerTitle: 'registeredEndpoints.registeredEndpoints',
    id: 'reg-endpoints',
    reportType: this.ReportConstants.TABLE,
    state: this.ReportConstants.REFRESH,
    table: {
      headers: [{
        title: 'registeredEndpoints.company',
        class: 'customer-data col-md-4',
      }, {
        title: 'registeredEndpoints.maxRegisteredDevices',
        class: 'horizontal-center col-md-2',
      }, {
        title: 'registeredEndpoints.trend',
        class: 'horizontal-center col-md-2',
      }, {
        title: 'registeredEndpoints.totalRegistered',
        class: 'horizontal-center col-md-2',
      }],
      data: [],
      dummy: true,
    },
    titlePopover: this.ReportConstants.UNDEF,
  };

  // call metrics report options
  public callMetricsReportOptions: IReportCard = {
    animate: false,
    description: 'callMetrics.callMetricsDesc',
    headerTitle: 'callMetrics.callMetrics',
    id: 'callMetrics',
    reportType: this.ReportConstants.DONUT,
    state: this.ReportConstants.REFRESH,
    table: undefined,
    titlePopover: this.ReportConstants.UNDEF,
  };

  // customer filter variables
  public customerPlaceholder = this.$translate.instant('reportsPage.customerSelect');
  public customerSingular = this.$translate.instant('reportsPage.customer');
  public customerPlural = this.$translate.instant('reportsPage.customers');
  public customerMax = 5;
  public customerOptions: Array<IReportsCustomer> = [];
  public customerSelected: Array<IReportsCustomer> = [];

  // Timefilter controls
  public timeOptions: Array<ITimespan> = _.cloneDeep(this.ReportConstants.timeFilter);
  public timeSelected: ITimespan = this.timeOptions[0];

  // private functions
  // active user controls
  public getActiveUserReports() {
    // reset defaults
    this.activeUserSecondaryReportOptions.table.data = [];
    this.activeUserSecondaryReportOptions.display = false;
    this.$rootScope.$broadcast(this.activeUserSecondaryReportOptions.broadcast);

    let promises: Array<ng.IPromise<any>> = [];
    let activePromise: ng.IPromise<any> = this.ReportService.getActiveUserData(this.customerSelected, this.timeSelected).then((response: IActiveUserReturnData) => {
      if (_.isArray(response.popData) && _.isArray(response.graphData)) {
        this.activeUserReportOptions.state = this.ReportConstants.EMPTY;
        this.populationReportOptions.state = this.ReportConstants.EMPTY;
        if (angular.isArray(response.graphData) && response.graphData.length > 0) {
          this.activeUserReportOptions.state = this.ReportConstants.SET;
          this.setActiveUserGraph(response.graphData);
          this.activeUserSecondaryReportOptions.display = response.isActiveUsers;

          // only display population graph if there is data in the active user graph
          if (angular.isArray(response.popData) && response.popData.length > 0 && response.isActiveUsers) {
            this.setActivePopulationGraph(response.popData);
            this.populationReportOptions.state = this.ReportConstants.SET;
          }
        }
      }
      this.resize(0);
      return;
    });
    promises.push(activePromise);

    let tablePromise: ng.IPromise<any> = this.ReportService.getActiveTableData(this.customerSelected, this.timeSelected).then((response: Array<IActiveTableData>) => {
      this.activeUserSecondaryReportOptions.state = this.ReportConstants.EMPTY;
      if (_.isArray(response) && (response.length > 0)) {
        this.activeUserSecondaryReportOptions.table.data = response;
        this.activeUserSecondaryReportOptions.state = this.ReportConstants.SET;
        this.$rootScope.$broadcast(this.activeUserSecondaryReportOptions.broadcast);
      }
      this.resize(0);
      return;
    });
    promises.push(tablePromise);

    return this.$q.all(promises);
  }

  private setActiveUserGraph(data: Array<IActiveUserData>): void {
    let tempActiveUsersChart = this.GraphService.getActiveUsersGraph(data, this.activeUsersChart);
    if (tempActiveUsersChart) {
      this.activeUsersChart = tempActiveUsersChart;
      this.resize(0);
    }
  }

  private setActivePopulationGraph(data: Array<IPopulationData>): void {
    let tempPopChart = this.GraphService.getActiveUserPopulationGraph(data, this.popChart);
    if (tempPopChart) {
      this.popChart = tempPopChart;
      this.resize(0);
    }
  }

  // endpoint controls
  private getRegisteredEndpoints(): void {
    this.ReportService.getRegisteredEndpoints(this.customerSelected, this.timeSelected).then((response: Array<Array<IEndpointData>>) => {
      if (_.isArray(response)) {
        if (!angular.isArray(response) || response.length === 0) {
          this.endpointReportOptions.state = this.ReportConstants.EMPTY;
        } else {
          this.endpointReportOptions.table.dummy = false;
          this.endpointReportOptions.table.data = response;
          this.endpointReportOptions.state = this.ReportConstants.SET;
          this.resize(0);
        }
      }
    });
  }

  // media controls
  private getMediaQualityReports(): void {
    return this.ReportService.getMediaQualityMetrics(this.customerSelected, this.timeSelected).then((response: Array<IMediaQualityData>) => {
      if (_.isArray(response)) {
        this.setMediaQualityGraph(response);
        this.mediaReportOptions.state = this.ReportConstants.EMPTY;
        if (response.length > 0) {
          this.mediaReportOptions.state = this.ReportConstants.SET;
        }
      }
      return;
    });
  }

  private setMediaQualityGraph(data: Array<IMediaQualityData>): void {
    let tempMediaChart = this.GraphService.getMediaQualityGraph(data, this.mediaQualityChart);
    if (tempMediaChart) {
      this.mediaQualityChart = tempMediaChart;
      this.resize(0);
    }
  }

  // metrics controls
  private getCallMetricsReports(): void {
    return this.ReportService.getCallMetricsData(this.customerSelected, this.timeSelected).then((response: ICallMetricsData) => {
      if (response) {
        this.callMetricsReportOptions.state = this.ReportConstants.EMPTY;
        if (angular.isArray(response.dataProvider) && response.dataProvider.length > 0) {
          this.setCallMetricsGraph(response);
          this.callMetricsReportOptions.state = this.ReportConstants.SET;
        }
        this.resize(0);
      }
    });
  }

  private setCallMetricsGraph(data: ICallMetricsData): void {
    let tempMetricsChart = this.GraphService.getCallMetricsDonutChart(data, this.callMetricsChart);
    if (tempMetricsChart) {
      this.callMetricsChart = tempMetricsChart;
      this.resize(0);
    }
  }

  // set all reports with dummy data
  private setAllDummyData(): void {
    this.setActiveUserGraph(this.DummyReportService.dummyActiveUserData(this.timeSelected));
    this.setMediaQualityGraph(this.DummyReportService.dummyMediaQualityData(this.timeSelected));
    this.setCallMetricsGraph(this.DummyReportService.dummyCallMetricsData());

    this.setActivePopulationGraph(this.DummyReportService.dummyActivePopulationData(this.customerSelected));
    this.endpointReportOptions.table.dummy = true;
    this.endpointReportOptions.table.data = this.DummyReportService.dummyEndpointData();
  }

  // set all graphs to empty
  private setAllNoData(): void {
    this.populationReportOptions.state = this.ReportConstants.EMPTY;
    this.activeUserReportOptions.state = this.ReportConstants.EMPTY;
    this.activeUserSecondaryReportOptions.state = this.ReportConstants.EMPTY;
    this.mediaReportOptions.state = this.ReportConstants.EMPTY;
    this.callMetricsReportOptions.state = this.ReportConstants.EMPTY;
    this.endpointReportOptions.state = this.ReportConstants.EMPTY;
  }

  // set customerOptions with all organizations managed by this partner
  private updateCustomerFilter(orgsData: Array<any>): void {
    let customers: Array<IReportsCustomer> = [];
    let partnerId = this.Authinfo.getOrgId();
    let partnerAdded = false;
    // add all customer names to the customerOptions list
    // compensates for when partner's own org is returned by managedOrgs API
    _.forEach(orgsData, (org: any) => {
      customers.push({
        value: org.customerOrgId,
        label: org.customerName,
        isAllowedToManage: org.isAllowedToManage,
        isSelected: false,
      });
      partnerAdded = partnerAdded || (partnerId === org.customerOrgId);
    });
    if (!partnerAdded) {
      customers.push({
        value: partnerId,
        label: this.Authinfo.getOrgName(),
        isAllowedToManage: true,
        isSelected: false,
      });
    }

    customers = customers.sort((a: IReportsCustomer, b: IReportsCustomer) => {
      return a.label.localeCompare(b.label);
    });

    _.forEach(customers, (item: IReportsCustomer, index: number) => {
      if (index < this.customerMax) {
        item.isSelected = true;
        this.customerSelected.push(item);
      }
    });
    this.customerOptions = customers;
    this.resize(0);
  }

  // masonry resizing
  private resize(delay: number): void {
    // delayed resize necessary to fix any overlapping cards on smaller screens
    this.$timeout((): void => {
      $('.cs-card-layout').masonry('layout');
    }, delay);
  }

  // public functions
  // resizing for Most Active Users Table
  public resizeMostActive() {
    this.resize(0);
  }

  // toggle for the all/engagement/quality filter
  public showHideCards(filter: string) {
    if (this.currentFilter !== filter) {
      this.showEngagement = false;
      this.showQuality = false;
      if (filter === this.ALL || filter === this.ENGAGEMENT) {
        this.showEngagement = true;
      }
      if (filter === this.ALL || filter === this.QUALITY) {
        this.showQuality = true;
      }
      this.resize(500);
      this.currentFilter = filter;
    }
  }

  // reset for the reports after a global filter changes
  public updateReports(): void {
    if (!this.initialized) {
      return;
    }

    this.setAllDummyData();
    if (this.customerSelected.length > 0) {
      this.activeUserReportOptions.state = this.ReportConstants.REFRESH;
      this.activeUserSecondaryReportOptions.state = this.ReportConstants.REFRESH;
      this.populationReportOptions.state = this.ReportConstants.REFRESH;
      this.getActiveUserReports();

      this.callMetricsReportOptions.state = this.ReportConstants.REFRESH;
      this.getCallMetricsReports();

      this.mediaReportOptions.state = this.ReportConstants.REFRESH;
      this.getMediaQualityReports();

      this.endpointReportOptions.state = this.ReportConstants.REFRESH;
      this.getRegisteredEndpoints();
    } else {
      this.setAllNoData();
    }
    this.resize(0);
  }
}

angular
  .module('Core')
  .controller('PartnerReportCtrl', PartnerReportCtrl);
