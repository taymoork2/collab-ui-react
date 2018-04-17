import './partner-reports.scss';
import { ReportPrintService } from './commonReportServices/reportPrint.service';
import { ReportConstants } from './commonReportServices/reportConstants.service';
import { DummyReportService } from './dummyReport.service';
import { GraphService } from './graph.service';
import { ReportService } from './report.service';
import {
  IActiveUserData,
  IActiveTableData,
  ICallMetricsData,
  IFilterObject,
  IMediaQualityData,
  IPopulationData,
  IReportCard,
  IReportCardTable,
  IReportsCustomer,
  ITimespan,
  ISecondaryReport,
  IPartnerCharts,
} from './partnerReportInterfaces';
import { CardUtils } from 'modules/core/cards';

class PartnerReportCtrl {
  // tracking when initialization has completed
  private initialized: boolean = false;

  // reports filter
  public filterArray: IFilterObject[];
  public readonly ALL: string;
  public readonly ENGAGEMENT: string;
  public readonly QUALITY: string;
  public showEngagement: boolean = true;
  public showQuality: boolean = true;
  private currentFilter: string;

  /* @ngInject */
  constructor(
    private $q: ng.IQService,
    private $rootScope: ng.IRootScopeService,
    private $translate: ng.translate.ITranslateService,
    private Authinfo,
    private CardUtils: CardUtils,
    private ReportPrintService: ReportPrintService,
    private ReportConstants: ReportConstants,
    private DummyReportService: DummyReportService,
    private GraphService: GraphService,
    private ReportService: ReportService,
  ) {
    this.ALL = this.ReportConstants.ALL;
    this.ENGAGEMENT = this.ReportConstants.ENGAGEMENT;
    this.QUALITY = this.ReportConstants.QUALITY;
    this.currentFilter = this.ALL;

    this.filterArray = _.cloneDeep(this.ReportConstants.filterArray);
    this.filterArray[0].toggle = (): void => {
      this.showHideCards(this.ALL);
    };
    this.filterArray[1].toggle = (): void => {
      this.showHideCards(this.ENGAGEMENT);
    };
    this.filterArray[2].toggle = (): void => {
      this.showHideCards(this.QUALITY);
    };

    this.ReportService.getOverallActiveUserData(this.timeSelected);
    this.ReportService.getCustomerList().then((response): void => {
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
      this.CardUtils.resize(0);
      this.initialized = true;
    });
  }

  // full page download toggle and controls
  public downloadToggle: boolean = false;
  public exportFullPage() {
    this.ReportPrintService.printPartnerPage(this.currentFilter, this.timeSelected, this.charts, {
      active: this.activeUserReportOptions,
      devices: this.endpointReportOptions,
      metrics: this.callMetricsReportOptions,
      media: this.mediaReportOptions,
      population: this.populationReportOptions,
    });
  }

  public isSubHeaderDisabled(): boolean {
    return this.customerOptions.length < 1;
  }

  // charts and export tracking
  private charts: IPartnerCharts = {};
  public exportArrays: IPartnerCharts = {};

  // Active User Options
  public activeUserReportOptions: IReportCard = {
    animate: true,
    description: 'activeUsers.description',
    headerTitle: 'activeUsers.activeUsers',
    id: 'activeUsers',
    reportType: this.ReportConstants.BARCHART,
    state: this.ReportConstants.REFRESH,
    titlePopover: this.ReportConstants.UNDEF,
  };

  public activeUserSecondaryReportOptions: ISecondaryReport = {
    alternateTranslations: false,
    broadcast: 'ReportCard::UpdateSecondaryReport',
    description: 'activeUsers.mostActiveDescription',
    display: false,
    emptyDescription: 'activeUsers.noActiveUsers',
    errorDescription: 'activeUsers.errorActiveUsers',
    search: false,
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
        class:  this.ReportConstants.HORIZONTAL_CENTER + ' col-md-2 pointer',
      }, {
        title: 'activeUsers.sparkMessages',
        class: this.ReportConstants.HORIZONTAL_CENTER + ' col-md-2 pointer',
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
    titlePopover: 'mediaQuality.packetLossDefinition',
  };

  // endpoint report options
  public endpointReportOptions: IReportCardTable = {
    animate: true,
    description: 'registeredEndpoints.description',
    headerTitle: 'registeredEndpoints.registeredEndpoints',
    id: 'reg-endpoints',
    reportType: this.ReportConstants.TABLE,
    state: this.ReportConstants.REFRESH,
    table: {
      headers: [{
        title: 'registeredEndpoints.company',
        class: this.ReportConstants.CUSTOMER_DATA + ' col-md-4',
      }, {
        title: 'registeredEndpoints.maxRegisteredDevices',
        class: this.ReportConstants.HORIZONTAL_CENTER + ' col-md-2',
      }, {
        title: 'registeredEndpoints.trend',
        class: this.ReportConstants.HORIZONTAL_CENTER + ' col-md-2',
      }, {
        title: 'registeredEndpoints.totalRegistered',
        class: this.ReportConstants.HORIZONTAL_CENTER + ' col-md-2',
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
    titlePopover: this.ReportConstants.UNDEF,
  };

  // customer filter variables
  public customerPlaceholder = this.$translate.instant('reportsPage.customerSelect');
  public customerSingular = this.$translate.instant('reportsPage.customer');
  public customerPlural = this.$translate.instant('reportsPage.customers');
  public customerMax: number = 5;
  public customerOptions: IReportsCustomer[] = [];
  public customerSelected: IReportsCustomer[] = [];

  // Timefilter controls
  public timeOptions: ITimespan[] = _.cloneDeep(this.ReportConstants.TIME_FILTER);
  public timeSelected: ITimespan = this.timeOptions[0];

  // private functions
  // active user controls
  public getActiveUserReports(): ng.IPromise<any[]> {
    // reset defaults
    this.activeUserSecondaryReportOptions.table.data = [];
    this.activeUserSecondaryReportOptions.display = false;
    this.$rootScope.$broadcast(this.activeUserSecondaryReportOptions.broadcast);

    const promises: ng.IPromise<any>[] = [];
    const activePromise: ng.IPromise<any> = this.ReportService.getActiveUserData(this.customerSelected, this.timeSelected).then((response) => {
      if (_.isArray(response.popData) && _.isArray(response.graphData)) {
        this.activeUserReportOptions.state = this.ReportConstants.EMPTY;
        this.populationReportOptions.state = this.ReportConstants.EMPTY;
        if (_.isArray(response.graphData) && response.graphData.length > 0) {
          this.activeUserReportOptions.state = this.ReportConstants.SET;
          this.setActiveUserGraph(response.graphData);
          this.activeUserSecondaryReportOptions.display = response.isActiveUsers;

          // only display population graph if there is data in the active user graph
          if (_.isArray(response.popData) && response.popData.length > 0 && response.isActiveUsers) {
            this.setActivePopulationGraph(response.popData);
            this.populationReportOptions.state = this.ReportConstants.SET;
          }
        }
      }
      this.CardUtils.resize(0);
      return;
    });
    promises.push(activePromise);

    const tablePromise: ng.IPromise<any> = this.ReportService.getActiveTableData(this.customerSelected, this.timeSelected).then((response: IActiveTableData[]) => {
      this.activeUserSecondaryReportOptions.state = this.ReportConstants.EMPTY;
      if (_.isArray(response) && (response.length > 0)) {
        this.activeUserSecondaryReportOptions.table.data = response;
        this.activeUserSecondaryReportOptions.state = this.ReportConstants.SET;
        this.$rootScope.$broadcast(this.activeUserSecondaryReportOptions.broadcast);
      }
      this.CardUtils.resize(0);
      return;
    });
    promises.push(tablePromise);

    return this.$q.all(promises);
  }

  private setActiveUserGraph(data: IActiveUserData[]): void {
    this.exportArrays.active = null;
    const tempactive = this.GraphService.getActiveUsersGraph(data, this.charts.active);
    if (tempactive) {
      this.charts.active = tempactive;
      this.exportArrays.active = this.ReportPrintService.createExportMenu(this.charts.active);
      this.CardUtils.resize(0);
    }
  }

  private setActivePopulationGraph(data: IPopulationData[]): void {
    this.exportArrays.population = null;
    const tempPopulation = this.GraphService.getActiveUserPopulationGraph(data, this.charts.population);
    if (tempPopulation) {
      this.charts.population = tempPopulation;
      this.exportArrays.population = this.ReportPrintService.createExportMenu(this.charts.population);
      this.CardUtils.resize(0);
    }
  }

  // endpoint controls
  private getRegisteredEndpoints(): void {
    this.ReportService.getRegisteredEndpoints(this.customerSelected, this.timeSelected).then((response) => {
      if (_.isArray(response)) {
        if (!_.isArray(response) || response.length === 0) {
          this.endpointReportOptions.state = this.ReportConstants.EMPTY;
        } else {
          this.endpointReportOptions.table.dummy = false;
          this.endpointReportOptions.table.data = response;
          this.endpointReportOptions.state = this.ReportConstants.SET;
          this.CardUtils.resize(0);
        }
      }
    });
  }

  // media controls
  private getMediaQualityReports(): void {
    this.ReportService.getMediaQualityMetrics(this.customerSelected, this.timeSelected).then((response) => {
      if (_.isArray(response)) {
        this.setMediaQualityGraph(response);
        this.mediaReportOptions.state = this.ReportConstants.EMPTY;
        if (response.length > 0) {
          this.mediaReportOptions.state = this.ReportConstants.SET;
        }
      }
    });
  }

  private setMediaQualityGraph(data: IMediaQualityData[]): void {
    this.exportArrays.media = null;
    const tempMediaChart = this.GraphService.getMediaQualityGraph(data, this.charts.media);
    if (tempMediaChart) {
      this.charts.media = tempMediaChart;
      this.exportArrays.media = this.ReportPrintService.createExportMenu(this.charts.media);
      this.CardUtils.resize(0);
    }
  }

  // metrics controls
  private getCallMetricsReports(): void {
    this.ReportService.getCallMetricsData(this.customerSelected, this.timeSelected).then((response) => {
      if (response) {
        this.callMetricsReportOptions.state = this.ReportConstants.EMPTY;
        if (_.isArray(response.dataProvider) && response.dataProvider.length > 0) {
          this.setCallMetricsGraph(response);
          this.callMetricsReportOptions.state = this.ReportConstants.SET;
        }
        this.CardUtils.resize(0);
      }
    });
  }

  private setCallMetricsGraph(data: ICallMetricsData): void {
    this.exportArrays.metrics = null;
    const tempMetricsChart = this.GraphService.getCallMetricsDonutChart(data, this.charts.metrics);
    if (tempMetricsChart) {
      this.charts.metrics = tempMetricsChart;
      this.exportArrays.metrics = this.ReportPrintService.createExportMenu(this.charts.metrics);
      this.CardUtils.resize(0);
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
  private updateCustomerFilter(orgsData: any[]): void {
    let customers: IReportsCustomer[] = [];
    const partnerId = this.Authinfo.getOrgId();
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
    this.CardUtils.resize(0);
  }

  // toggle for the all/engagement/quality filter
  private showHideCards(filter: string) {
    if (this.currentFilter !== filter) {
      this.showEngagement = false;
      this.showQuality = false;
      if (filter === this.ALL || filter === this.ENGAGEMENT) {
        this.showEngagement = true;
      }
      if (filter === this.ALL || filter === this.QUALITY) {
        this.showQuality = true;
      }
      this.CardUtils.resize(500);
      this.currentFilter = filter;
    }
  }

  // resizing for Most Active Users Table
  public resizeMostActive() {
    this.CardUtils.resize(0);
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
    this.CardUtils.resize(0);
  }
}

angular
  .module('Core')
  .controller('PartnerReportCtrl', PartnerReportCtrl);
