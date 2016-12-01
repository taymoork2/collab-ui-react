import './_spark-reports.scss';
import { CommonReportService } from '../../partnerReports/commonReportServices/commonReport.service';
import { ReportConstants } from '../../partnerReports/commonReportServices/reportConstants.service';
import {
  IActiveTableBase,
  IActiveUserData,
  IFilterObject,
  IDropdownBase,
  IReportCard,
  IReportDropdown,
  IReportLabel,
  ISecondaryReport,
  ITimespan,
  ITimeSliderFunctions,
} from '../../partnerReports/partnerReportInterfaces';

import { SparkGraphService } from './sparkGraph.service';
import { SparkReportService } from './sparkReport.service';
import { SparkLineReportService } from './sparkLineReport.service';
import { DummySparkDataService } from './dummySparkData.service';
import {
  IActiveUserWrapper,
  IAvgRoomData,
  IEndpointContainer,
  IEndpointWrapper,
  IFilesShared,
  IMediaData,
  IMetricsData,
  IMetricsLabel,
} from './sparkReportInterfaces';

import { CardUtils } from 'modules/core/cards';

interface ICharts {
  active: any | null;
  rooms: any | null;
  files: any | null;
  media: any | null;
  device: any | null;
  metrics: any | null;
}

class SparkReportCtrl {
  /* @ngInject */
  constructor(
    private $rootScope: ng.IRootScopeService,
    private $timeout: ng.ITimeoutService,
    private $translate: ng.translate.ITranslateService,
    private CardUtils: CardUtils,
    private CommonReportService: CommonReportService,
    private SparkGraphService: SparkGraphService,
    private SparkReportService: SparkReportService,
    private SparkLineReportService: SparkLineReportService,
    private DummySparkDataService: DummySparkDataService,
    private ReportConstants: ReportConstants,
    private FeatureToggleService,
  ) {
    this.filterArray[0].toggle = (): void => {
      this.resetCards(this.ALL);
    };
    this.filterArray[1].toggle = (): void => {
      this.resetCards(this.ENGAGEMENT);
    };
    this.filterArray[2].toggle = (): void => {
      this.resetCards(this.QUALITY);
    };

    this.reportsUpdateToggle.then((response: boolean): void => {
      this.displayNewReports = response;

      if (this.displayNewReports) {
        this.timeOptions = _.cloneDeep(this.ReportConstants.altTimeFilter);
        this.secondaryActiveOptions.alternateTranslations = true;
        this.activeDropdown = {
          array: this.activeArray,
          click: (): void => {
            this.SparkGraphService.showHideActiveLineGraph(this.charts.active, this.activeDropdown.selected);
          },
          disabled: true,
          selected: this.activeArray[0],
        };
      }

      this.$timeout((): void => {
        if (this.displayNewReports) {
          this.setActiveLineGraph(this.timeSelected.min, this.timeSelected.max);
        } else {
          this.setDummyData();
          this.setAllGraphs();
        }
      }, 30);
    });
  }

  public displayNewReports: boolean = false;
  private reportsUpdateToggle = this.FeatureToggleService.atlasReportsUpdateGetStatus();

  // charts and export controls
  private charts: ICharts = {
    active: null,
    rooms: null,
    files: null,
    media: null,
    device: null,
    metrics: null,
  };
  public exportArrays: ICharts = {
    active: null,
    rooms: null,
    files: null,
    media: null,
    device: null,
    metrics: null,
  };

  // report display filter controls
  public readonly ALL: string = this.ReportConstants.ALL;
  public readonly ENGAGEMENT: string = this.ReportConstants.ENGAGEMENT;
  public readonly QUALITY: string = this.ReportConstants.QUALITY;
  public currentFilter: string = this.ALL;
  public displayEngagement: boolean = true;
  public displayQuality: boolean = true;
  public filterArray: Array<IFilterObject> = _.cloneDeep(this.ReportConstants.filterArray);

  // Time Filter Controls
  public timeOptions: Array<ITimespan> = _.cloneDeep(this.ReportConstants.timeFilter);
  public timeSelected: ITimespan = this.ReportConstants.WEEK_FILTER;
  public timeUpdates: ITimeSliderFunctions = {
    sliderUpdate: (min: number, max: number): void => {
      this.$timeout((): void => {
        if (this.displayNewReports) {
          this.sliderUpdate(min, max);
        }
      });
    },
    update: (): void => {
      this.$timeout((): void => {
        if (this.displayNewReports) {
          this.sliderUpdate(this.timeSelected.min, this.timeSelected.max);
        } else {
          this.timeUpdate();
        }
      });
    },
  };

  private sliderUpdate(min: number, max: number): void {
    this.activeDropdown.selected = this.activeDropdown.array[0];
    this.activeOptions.titlePopover = this.ReportConstants.UNDEF;
    if (this.timeSelected.value === this.ReportConstants.CUSTOM_FILTER.value) {
      this.activeOptions.titlePopover = 'activeUsers.customMessage';
    }

    this.setActiveLineGraph(min, max);
  }

  private timeUpdate(): void {
    this.activeOptions.state = this.ReportConstants.REFRESH;
    this.secondaryActiveOptions.state = this.ReportConstants.REFRESH;
    this.avgRoomOptions.state = this.ReportConstants.REFRESH;
    this.filesSharedOptions.state = this.ReportConstants.REFRESH;
    this.mediaOptions.state = this.ReportConstants.REFRESH;
    this.deviceOptions.state = this.ReportConstants.REFRESH;
    this.metricsOptions.state = this.ReportConstants.REFRESH;
    this.mediaDropdown.selected = this.mediaArray[0];

    this.setDummyData();
    this.setAllGraphs();
  }

  // Active User Report Controls
  private activeArray: Array<IDropdownBase> = _.cloneDeep(this.ReportConstants.activeFilter);
  public activeDropdown: IReportDropdown;

  public activeOptions: IReportCard = {
    animate: true,
    description: 'activeUsers.customerPortalDescription',
    headerTitle: 'activeUsers.activeUsers',
    id: 'activeUsers',
    reportType: this.ReportConstants.BARCHART,
    state: this.ReportConstants.REFRESH,
    table: undefined,
    titlePopover: this.ReportConstants.UNDEF,
  };

  public secondaryActiveOptions: ISecondaryReport = {
    alternateTranslations: false,
    broadcast: 'ReportCard::UpdateSecondaryReport',
    description: 'activeUsers.customerMostActiveDescription',
    display: true,
    emptyDescription: 'activeUsers.noActiveUsers',
    errorDescription: 'activeUsers.errorActiveUsers',
    search: true,
    state: this.ReportConstants.REFRESH,
    sortOptions: [{
      option: 'userName',
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

  public resizeMostActive () {
    this.CardUtils.resize(0);
  }

  private setActiveGraph(data: Array<IActiveUserData>): void {
    this.exportArrays.active = null;
    let tempActiveUserChart: any;
    if (this.displayNewReports) {
      tempActiveUserChart = this.SparkGraphService.setActiveLineGraph(data, this.charts.active);
    } else {
      tempActiveUserChart = this.SparkGraphService.setActiveUsersGraph(data, this.charts.active);
    }

    if (tempActiveUserChart) {
      this.charts.active = tempActiveUserChart;
      this.exportArrays.active = this.CommonReportService.createExportMenu(this.charts.active);
      if (this.displayNewReports) {
        this.SparkGraphService.showHideActiveLineGraph(this.charts.active, this.activeDropdown.selected);
      }
    }
  }

  private setActiveUserData() {
    // reset defaults
    this.secondaryActiveOptions.table.data = [];
    this.$rootScope.$broadcast(this.secondaryActiveOptions.broadcast);

    this.SparkReportService.getActiveUserData(this.timeSelected).then((response: IActiveUserWrapper): void => {
      if (_.isArray(response.graphData) && response.graphData.length === 0) {
        this.activeOptions.state = this.ReportConstants.EMPTY;
      } else {
        this.setActiveGraph(response.graphData);
        this.activeOptions.state = this.ReportConstants.SET;
      }
      this.CardUtils.resize(0);
    });

    this.SparkReportService.getMostActiveUserData(this.timeSelected).then((response: Array<IActiveTableBase>): void => {
      if (response.length === 0) {
        this.secondaryActiveOptions.state = this.ReportConstants.EMPTY;
      } else {
        this.secondaryActiveOptions.state = this.ReportConstants.SET;
      }
      this.secondaryActiveOptions.table.data = response;
      this.$rootScope.$broadcast(this.secondaryActiveOptions.broadcast);
    }, (): void => {
      this.secondaryActiveOptions.state = this.ReportConstants.ERROR;
    });
  }

  // Active User Line Graph Controls
  private activeUserSevenDayData: IActiveUserWrapper;
  private activeUserYearData: IActiveUserWrapper;

  private setActiveLineGraph(min: number, max: number): void {
    // reset defaults
    this.secondaryActiveOptions.table.data = [];
    this.$rootScope.$broadcast(this.secondaryActiveOptions.broadcast);
    this.activeDropdown.disabled = true;

    if (this.timeSelected.value === this.ReportConstants.WEEK_FILTER.value) {
      if (_.isUndefined(this.activeUserSevenDayData)) {
        this.activeOptions.state = this.ReportConstants.REFRESH;
        this.setActiveGraph(this.DummySparkDataService.dummyActiveUserData(this.timeSelected, this.displayNewReports));
        this.SparkLineReportService.getActiveUserData(this.timeSelected).then((response: IActiveUserWrapper): void => {
          this.activeUserSevenDayData = response;
          this.updateActiveLineGraph(this.activeUserSevenDayData);
        });
      } else {
        this.updateActiveLineGraph(this.activeUserSevenDayData);
      }
    } else if (_.isUndefined(this.activeUserYearData)) {
      this.activeOptions.state = this.ReportConstants.REFRESH;
      this.setActiveGraph(this.DummySparkDataService.dummyActiveUserData(this.timeSelected, this.displayNewReports));
      this.zoomChart(this.charts.active, min, max);
      this.SparkLineReportService.getActiveUserData(this.timeSelected).then((response: IActiveUserWrapper): void => {
        this.activeUserYearData = response;
        this.updateActiveLineGraph(this.activeUserYearData);
        this.zoomChart(this.charts.active, min, max);
      });
    } else {
      this.updateActiveLineGraph(this.activeUserYearData);
      this.zoomChart(this.charts.active, min, max);
    }

    if (this.timeSelected.value === this.ReportConstants.WEEK_FILTER.value || this.timeSelected.value === this.ReportConstants.MONTH_FILTER.value
      || this.timeSelected.value === this.ReportConstants.THREE_MONTH_FILTER.value) {
      this.secondaryActiveOptions.display = true;
      this.SparkLineReportService.getMostActiveUserData(this.timeSelected).then((response: Array<IActiveTableBase>): void => {
        if (response.length === 0) {
          this.secondaryActiveOptions.state = this.ReportConstants.EMPTY;
        } else {
          this.secondaryActiveOptions.state = this.ReportConstants.SET;
        }
        this.secondaryActiveOptions.table.data = response;
        this.$rootScope.$broadcast(this.secondaryActiveOptions.broadcast);
      }, (): void => {
        this.secondaryActiveOptions.state = this.ReportConstants.ERROR;
      });
    } else {
      this.secondaryActiveOptions.display = false;
    }
  }

  private updateActiveLineGraph(data: IActiveUserWrapper): void {
    if (_.isArray(data.graphData) && data.graphData.length === 0) {
      this.activeOptions.state = this.ReportConstants.EMPTY;
    } else {
      this.setActiveGraph(data.graphData);
      this.activeOptions.state = this.ReportConstants.SET;
      this.activeDropdown.disabled = !data.isActiveUsers;
    }
    this.CardUtils.resize(0);
  }

  // Average Rooms Report Controls
  public avgRoomOptions: IReportCard = {
    animate: true,
    description: 'avgRooms.avgRoomsDescription',
    headerTitle: 'avgRooms.avgRooms',
    id: 'avgRooms',
    reportType: this.ReportConstants.BARCHART,
    state: this.ReportConstants.REFRESH,
    table: undefined,
    titlePopover: this.ReportConstants.UNDEF,
  };

  private setAverageGraph(data: Array<IAvgRoomData>): void {
    this.exportArrays.rooms = null;
    let temprooms: any = this.SparkGraphService.setAvgRoomsGraph(data, this.charts.rooms);
    if (temprooms) {
      this.charts.rooms = temprooms;
      this.exportArrays.rooms = this.CommonReportService.createExportMenu(this.charts.rooms);
    }
  }

  private setAvgRoomData() {
    this.SparkReportService.getAvgRoomData(this.timeSelected).then((response: Array<IAvgRoomData>): void => {
      if (response.length === 0) {
        this.avgRoomOptions.state = this.ReportConstants.EMPTY;
      } else {
        this.setAverageGraph(response);
        this.avgRoomOptions.state = this.ReportConstants.SET;
      }
    });
  }

  // Files Shared Report Controls
  public filesSharedOptions: IReportCard = {
    animate: true,
    description: 'filesShared.filesSharedDescription',
    headerTitle: 'filesShared.filesShared',
    id: 'filesShared',
    reportType: this.ReportConstants.BARCHART,
    state: this.ReportConstants.REFRESH,
    table: undefined,
    titlePopover: this.ReportConstants.UNDEF,
  };

  private setFilesGraph(data: Array<IFilesShared>): void {
    this.exportArrays.files = null;
    let tempfiles: any = this.SparkGraphService.setFilesSharedGraph(data, this.charts.files);
    if (tempfiles) {
      this.charts.files = tempfiles;
      this.exportArrays.files = this.CommonReportService.createExportMenu(this.charts.files);
    }
  }

  private setFilesSharedData() {
    this.SparkReportService.getFilesSharedData(this.timeSelected).then((response: Array<IFilesShared>): void => {
      if (response.length === 0) {
        this.filesSharedOptions.state = this.ReportConstants.EMPTY;
      } else {
        this.setFilesGraph(response);
        this.filesSharedOptions.state = this.ReportConstants.SET;
      }
    });
  }

  // Media Quality Report Controls
  private mediaData: Array<IMediaData> = [];
  private mediaArray: Array<IDropdownBase> = _.cloneDeep(this.ReportConstants.mediaFilter);

  public mediaOptions: IReportCard = {
    animate: true,
    description: 'mediaQuality.descriptionCustomer',
    headerTitle: 'mediaQuality.mediaQuality',
    id: 'mediaQuality',
    reportType: this.ReportConstants.BARCHART,
    state: this.ReportConstants.REFRESH,
    table: undefined,
    titlePopover: 'mediaQuality.packetLossDefinition',
  };
  public mediaDropdown: IReportDropdown = {
    array: this.mediaArray,
    click: (): void => {
      this.setMediaGraph(this.mediaData);
    },
    disabled: true,
    selected: this.mediaArray[0],
  };

  private setMediaGraph(data: Array<IMediaData>): void {
    this.exportArrays.media = null;
    let tempmedia: any = this.SparkGraphService.setMediaQualityGraph(data, this.charts.media, this.mediaDropdown.selected);
    if (tempmedia) {
      this.charts.media = tempmedia;
      this.exportArrays.media = this.CommonReportService.createExportMenu(this.charts.media);
    }
  }

  private setMediaData() {
    this.mediaDropdown.disabled = true;
    this.mediaData = [];
    this.SparkReportService.getMediaQualityData(this.timeSelected).then((response: Array<IMediaData>): void => {
      if (response.length === 0) {
        this.mediaOptions.state = this.ReportConstants.EMPTY;
      } else {
        this.mediaData = response;
        this.setMediaGraph(this.mediaData);
        this.mediaOptions.state = this.ReportConstants.SET;
        this.mediaDropdown.disabled = false;
      }
    });
  }

  // Registered Endpoints Report Controls
  private currentDeviceGraphs: Array<IEndpointWrapper> = [];
  private defaultDeviceFilter: IDropdownBase = {
    value: 0,
    label: this.$translate.instant('registeredEndpoints.allDevices'),
  };

  public deviceOptions: IReportCard = {
    animate: true,
    description: 'registeredEndpoints.customerDescription',
    headerTitle: 'registeredEndpoints.registeredEndpoints',
    id: 'devices',
    reportType: this.ReportConstants.BARCHART,
    state: this.ReportConstants.REFRESH,
    table: undefined,
    titlePopover: this.ReportConstants.UNDEF,
  };

  public deviceDropdown: IReportDropdown = {
    array: [this.defaultDeviceFilter],
    click: (): void => {
      if (this.currentDeviceGraphs[this.deviceDropdown.selected.value].emptyGraph) {
        this.setDeviceGraph(this.DummySparkDataService.dummyDeviceData(this.timeSelected), undefined);
        this.deviceOptions.state = this.ReportConstants.EMPTY;
      } else {
        this.setDeviceGraph(this.currentDeviceGraphs, this.deviceDropdown.selected);
        this.deviceOptions.state = this.ReportConstants.SET;
      }
    },
    disabled: true,
    selected: this.defaultDeviceFilter,
  };

    private setDeviceGraph(data: Array<IEndpointWrapper>, deviceFilter: IDropdownBase | undefined) {
      this.exportArrays.device = null;
      let tempDevicesChart: any = this.SparkGraphService.setDeviceGraph(data, this.charts.device, deviceFilter);
      if (tempDevicesChart) {
        this.charts.device = tempDevicesChart;
        this.exportArrays.device = this.CommonReportService.createExportMenu(this.charts.device);
      }
    }

    private setDeviceData() {
      this.deviceDropdown.array = [this.defaultDeviceFilter];
      this.deviceDropdown.selected = this.deviceDropdown.array[0];
      this.currentDeviceGraphs = [];
      this.deviceDropdown.disabled = true;

      this.SparkReportService.getDeviceData(this.timeSelected).then((response: IEndpointContainer): void => {
        if (response.filterArray.length) {
          this.deviceDropdown.array = response.filterArray.sort((a: IDropdownBase, b: IDropdownBase): number => {
            if (a.label) {
              return a.label.localeCompare(b.label);
            } else if (a > b) {
              return 1;
            } else {
              return 0;
            }
          });
        }
        this.deviceDropdown.selected = this.deviceDropdown.array[0];
        this.currentDeviceGraphs = response.graphData;

        if (this.currentDeviceGraphs.length && !this.currentDeviceGraphs[this.deviceDropdown.selected.value].emptyGraph) {
          this.setDeviceGraph(this.currentDeviceGraphs, this.deviceDropdown.selected);
          this.deviceOptions.state = this.ReportConstants.SET;
          this.deviceDropdown.disabled = false;
        } else {
          this.deviceOptions.state = this.ReportConstants.EMPTY;
        }
      });
    }

  // Call Metrics Report Controls
  public metricsOptions: IReportCard = {
    animate: false,
    description: 'callMetrics.customerDescription',
    headerTitle: 'callMetrics.callMetrics',
    id: 'callMetrics',
    reportType: this.ReportConstants.DONUT,
    state: this.ReportConstants.REFRESH,
    table: undefined,
    titlePopover: this.ReportConstants.UNDEF,
  };

  public metricsLabels: Array<IReportLabel> = [{
    number: 0,
    text: 'callMetrics.totalCalls',
  }, {
    number: 0,
    text: 'callMetrics.callMinutes',
  }, {
    number: 0,
    text: 'callMetrics.failureRate',
  }];

  private setMetricGraph(data: IMetricsData): void {
    this.exportArrays.metrics = null;
    let tempmetrics: any = this.SparkGraphService.setMetricsGraph(data, this.charts.metrics);
    if (tempmetrics) {
      this.charts.metrics = tempmetrics;
      this.exportArrays.metrics = this.CommonReportService.createExportMenu(this.charts.metrics);
    }
  }

  private setMetrics(data: IMetricsLabel | undefined): void {
    if (data) {
      this.metricsLabels[0].number = data.totalCalls;
      this.metricsLabels[1].number = data.totalAudioDuration;
      this.metricsLabels[2].number = data.totalFailedCalls;
    } else {
      _.forEach(this.metricsLabels, (label: IReportLabel): void => {
        label.number = 0;
      });
    }
  }

  private setCallMetricsData(): void {
    this.SparkReportService.getCallMetricsData(this.timeSelected).then((response: IMetricsData): void => {
      this.metricsOptions.state = this.ReportConstants.EMPTY;
      if (_.isArray(response.dataProvider) && response.displayData) {
        this.setMetricGraph(response);
        this.setMetrics(response.displayData);
        this.metricsOptions.state = this.ReportConstants.SET;
      }
    });
  }

  // Helper Functions
  private resetCards(filter: string): void {
    if (this.currentFilter !== filter) {
      this.displayEngagement = false;
      this.displayQuality = false;
      if (filter === this.ALL || filter === this.ENGAGEMENT) {
        this.displayEngagement = true;
      }
      if (filter === this.ALL || filter === this.QUALITY) {
        this.displayQuality = true;
      }
      this.CardUtils.resize(500);
      this.currentFilter = filter;
    }
  }

  public setAllGraphs(): void {
    this.setActiveUserData();
    this.setAvgRoomData();
    this.setFilesSharedData();
    this.setMediaData();
    this.setCallMetricsData();
    this.setDeviceData();
  }

  public setDummyData(): void {
    this.setActiveGraph(this.DummySparkDataService.dummyActiveUserData(this.timeSelected, this.displayNewReports));
    this.setAverageGraph(this.DummySparkDataService.dummyAvgRoomData(this.timeSelected));
    this.setFilesGraph(this.DummySparkDataService.dummyFilesSharedData(this.timeSelected));
    this.setMetrics(undefined);
    this.setMetricGraph(this.DummySparkDataService.dummyMetricsData());
    this.setDeviceGraph(this.DummySparkDataService.dummyDeviceData(this.timeSelected), undefined);
    this.setMediaGraph(this.DummySparkDataService.dummyMediaData(this.timeSelected));

    this.CardUtils.resize(0);
  }

  private zoomChart(chart: any, min: number, max: number): void {
    if (chart && chart.zoomToIndexes) {
      chart.zoomToIndexes(min - 1, max);
    }
  }
}

angular
  .module('Core')
  .controller('SparkReportCtrl', SparkReportCtrl);
