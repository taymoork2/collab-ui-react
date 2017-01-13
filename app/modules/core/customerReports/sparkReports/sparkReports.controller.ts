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
  IConversation,
  IConversationWrapper,
  IEndpointContainer,
  IEndpointData,
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

interface IConversationPopulated {
  files: boolean;
  rooms: boolean;
}

class SparkReportCtrl {
  /* @ngInject */
  constructor(
    private $rootScope: ng.IRootScopeService,
    private $timeout: ng.ITimeoutService,
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
        this.timeOptions = _.cloneDeep(this.ReportConstants.ALT_TIME_FILTER);
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
          this.setConversationGraphs(this.timeSelected.min, this.timeSelected.max);
          this.setCallQualityGraph(this.timeSelected.min, this.timeSelected.max);
          this.setCallMetricsGraph(this.timeSelected.min, this.timeSelected.max);
          this.setRegisteredDeviceGraph(this.timeSelected.min, this.timeSelected.max);
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
  public timeOptions: Array<ITimespan> = _.cloneDeep(this.ReportConstants.TIME_FILTER);
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
    this.setConversationGraphs(min, max);
    this.setCallQualityGraph(min, max);
    this.setCallMetricsGraph(min, max);
    this.setRegisteredDeviceGraph(min, max);
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
  private activeArray: Array<IDropdownBase> = _.cloneDeep(this.ReportConstants.ACTIVE_FILTER);
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
      let graphData: Array<any> = _.get(response, 'graphData', []);
      this.updateActiveLineGraph(response, graphData.length > 0);
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
    this.activeOptions.state = this.ReportConstants.REFRESH;
    this.setActiveGraph(this.DummySparkDataService.dummyActiveUserData(this.timeSelected, this.displayNewReports));

    if (this.timeSelected.value === this.ReportConstants.WEEK_FILTER.value) {
      if (_.isUndefined(this.activeUserSevenDayData)) {
        this.SparkLineReportService.getActiveUserData(this.timeSelected).then((response: IActiveUserWrapper): void => {
          this.activeUserSevenDayData = response;
          let graphData = _.get(response, 'graphData', []);
          this.updateActiveLineGraph(this.activeUserSevenDayData, graphData.length > 0);
        });
      } else {
        let graphData = _.get(this.activeUserSevenDayData, 'graphData', []);
        this.updateActiveLineGraph(this.activeUserSevenDayData, graphData.length > 0);
      }
    } else if (_.isUndefined(this.activeUserYearData)) {
      this.zoomChart(this.charts.active, min, max);
      this.SparkLineReportService.getActiveUserData(this.timeSelected).then((response: IActiveUserWrapper): void => {
        this.activeUserYearData = response;
        this.updateActiveLineGraph(this.activeUserYearData, this.activePopulated(this.activeUserYearData.graphData, min, max));
        this.zoomChart(this.charts.active, min, max);
      });
    } else {
      this.updateActiveLineGraph(this.activeUserYearData, this.activePopulated(this.activeUserYearData.graphData, min, max));
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

  private updateActiveLineGraph(data: IActiveUserWrapper, populated: boolean): void {
    this.activeOptions.state = this.ReportConstants.EMPTY;
    if (populated) {
      this.setActiveGraph(data.graphData);
      this.activeOptions.state = this.ReportConstants.SET;
      if (this.displayNewReports) {
        this.activeDropdown.disabled = !data.isActiveUsers;
      }
    }
    this.CardUtils.resize(0);
  }

  private activePopulated(data: Array<IActiveUserData>, min: number, max: number): boolean {
    let length: number = data.length;
    if ((length > 0) && (length > min) && (length > max)) {
      for (let i = min; i <= max; i++) {
        let datapoint: IActiveUserData = _.cloneDeep(data[i]);
        if (datapoint.totalRegisteredUsers > 0) {
          return true;
        }
      }
    }
    return false;
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

  private setAverageGraph(data: Array<IAvgRoomData> | Array<IConversation>): void {
    this.exportArrays.rooms = null;
    let temprooms: any;
    if (this.displayNewReports) {
      temprooms = this.SparkGraphService.setRoomGraph(data, this.charts.rooms);
    } else {
      temprooms = this.SparkGraphService.setAvgRoomsGraph(data, this.charts.rooms);
    }

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

  // Conversation Graphs
  private sevenDayConversations: IConversationWrapper;
  private yearlyConversations: IConversationWrapper;

  private setConversationGraphs(min: number, max: number): void {
    this.filesSharedOptions.state = this.ReportConstants.REFRESH;
    this.avgRoomOptions.state = this.ReportConstants.REFRESH;
    let dummyData = this.DummySparkDataService.dummyConversationData(this.timeSelected);
    this.setAverageGraph(dummyData);
    this.setFilesGraph(dummyData);

    if (this.timeSelected.value === this.ReportConstants.WEEK_FILTER.value) {
      if (_.isUndefined(this.sevenDayConversations)) {
        this.SparkLineReportService.getConversationData(this.timeSelected).then((response: IConversationWrapper): void => {
          this.sevenDayConversations = response;
          this.updateConversationGraphs(this.sevenDayConversations, {
            files: this.sevenDayConversations.array.length > 0 && this.sevenDayConversations.hasFiles,
            rooms: this.sevenDayConversations.array.length > 0 && this.sevenDayConversations.hasRooms,
          });
        });
      } else {
        this.updateConversationGraphs(this.sevenDayConversations, {
          files: this.sevenDayConversations.array.length > 0 && this.sevenDayConversations.hasFiles,
          rooms: this.sevenDayConversations.array.length > 0 && this.sevenDayConversations.hasRooms,
        });
      }
    } else if (_.isUndefined(this.activeUserYearData)) {
      this.zoomChart(this.charts.rooms, min, max);
      this.zoomChart(this.charts.files, min, max);
      this.SparkLineReportService.getConversationData(this.timeSelected).then((response: IConversationWrapper): void => {
        this.yearlyConversations = response;
        this.updateConversationGraphs(this.yearlyConversations, this.conversationPopulated(this.yearlyConversations, min, max));
        this.zoomChart(this.charts.rooms, min, max);
        this.zoomChart(this.charts.files, min, max);
      });
    } else {
      this.updateConversationGraphs(this.yearlyConversations, this.conversationPopulated(this.yearlyConversations, min, max));
      this.zoomChart(this.charts.rooms, min, max);
      this.zoomChart(this.charts.files, min, max);
    }
  }

  private updateConversationGraphs(data: IConversationWrapper, population: IConversationPopulated): void {
    if (population.rooms) {
      this.setAverageGraph(data.array);
      this.avgRoomOptions.state = this.ReportConstants.SET;
    } else {
      this.avgRoomOptions.state = this.ReportConstants.EMPTY;
    }

    if (population.files) {
      this.setFilesGraph(data.array);
      this.filesSharedOptions.state = this.ReportConstants.SET;
    } else {
      this.filesSharedOptions.state = this.ReportConstants.EMPTY;
    }
  }

  private conversationPopulated(data: IConversationWrapper, min: number, max: number): IConversationPopulated {
    let populated = {
      files: false,
      rooms: false,
    };

    let dataArray = _.get(data, 'array', []);
    let length: number = dataArray.length;
    if ((length > 0) && (length > min) && (length > max) && (data.hasRooms || data.hasFiles)) {
      for (let i = min; i <= max; i++) {
        let datapoint: IConversation = _.cloneDeep(dataArray[i]);
        if (datapoint.totalRooms > 0) {
          populated.rooms = true;
        }
        if (datapoint.contentShared > 0) {
          populated.files = true;
        }
      }
    }

    return populated;
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

  private setFilesGraph(data: Array<IFilesShared> | Array<IConversation>): void {
    this.exportArrays.files = null;
    let tempfiles: any;
    if (this.displayNewReports) {
      tempfiles = this.SparkGraphService.setFilesGraph(data, this.charts.files);
    } else {
      tempfiles = this.SparkGraphService.setFilesSharedGraph(data, this.charts.files);
    }

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
  private mediaArray: Array<IDropdownBase> = _.cloneDeep(this.ReportConstants.MEDIA_FILTER);

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
      if (this.displayNewReports) {
        if (this.timeSelected.value === this.ReportConstants.WEEK_FILTER.value) {
          this.updateQualityGraph(this.qualitySevenDayData, this.qualitySevenDayData && this.qualitySevenDayData.length > 0);
        } else {
          this.updateQualityGraph(this.qualityYearData, this.qualityYearVisible);
        }
      } else {
        this.setMediaGraph(this.mediaData);
      }
    },
    disabled: true,
    selected: this.mediaArray[0],
  };

  private setMediaGraph(data: Array<IMediaData>): void {
    this.exportArrays.media = null;
    let tempmedia: any;
    if (this.displayNewReports) {
      tempmedia = this.SparkGraphService.setQualityGraph(data, this.charts.media, this.mediaDropdown.selected);
    } else {
      tempmedia = this.SparkGraphService.setMediaQualityGraph(data, this.charts.media, this.mediaDropdown.selected);
    }

    if (tempmedia) {
      this.charts.media = tempmedia;
      this.exportArrays.media = this.CommonReportService.createExportMenu(this.charts.media);
    }
  }

  private setMediaData() {
    this.mediaDropdown.disabled = true;
    this.mediaData = [];
    this.SparkReportService.getMediaQualityData(this.timeSelected).then((response: Array<IMediaData>): void => {
      this.mediaData = response;
      this.updateQualityGraph(response, response.length > 0);
    });
  }

  // Call Quality Line Graph Controls
  private qualitySevenDayData: Array<IMediaData>;
  private qualityYearData: Array<IMediaData>;
  private qualityYearVisible: boolean;

  private setCallQualityGraph(min: number, max: number): void {
    this.mediaDropdown.disabled = true;
    this.mediaOptions.state = this.ReportConstants.REFRESH;
    this.setMediaGraph(this.DummySparkDataService.dummyMediaData(this.timeSelected, this.displayNewReports));

    if (this.timeSelected.value === this.ReportConstants.WEEK_FILTER.value) {
      if (_.isUndefined(this.qualitySevenDayData)) {
        this.SparkLineReportService.getMediaQualityData(this.timeSelected).then((response: Array<IMediaData>): void => {
          this.qualitySevenDayData = response;
          this.updateQualityGraph(this.qualitySevenDayData, this.qualitySevenDayData.length > 0);
        });
      } else {
        this.updateQualityGraph(this.qualitySevenDayData, this.qualitySevenDayData.length > 0);
      }
    } else if (_.isUndefined(this.qualityYearData)) {
      this.zoomChart(this.charts.media, min, max);
      this.SparkLineReportService.getMediaQualityData(this.timeSelected).then((response: Array<IMediaData>): void => {
        this.qualityYearData = response;
        this.qualityYearVisible = this.qualityPopulated(this.qualityYearData, min, max);
        this.updateQualityGraph(this.qualityYearData, this.qualityYearVisible);
        this.zoomChart(this.charts.media, min, max);
      });
    } else {
      this.qualityYearVisible = this.qualityPopulated(this.qualityYearData, min, max);
      this.updateQualityGraph(this.qualityYearData, this.qualityYearVisible);
      this.zoomChart(this.charts.media, min, max);
    }
  }

  private updateQualityGraph(data: Array<IMediaData>, populated: boolean): void {
    if (populated) {
      this.setMediaGraph(data);
      this.mediaOptions.state = this.ReportConstants.SET;
      this.mediaDropdown.disabled = false;
    } else {
      this.mediaOptions.state = this.ReportConstants.EMPTY;
    }
  }

  private qualityPopulated(data: Array<IMediaData>, min: number, max: number): boolean {
    let length: number = data.length;
    if ((length > 0) && (length > min) && (length > max)) {
      for (let i = min; i <= max; i++) {
        let datapoint: IMediaData = _.cloneDeep(data[i]);
        if (datapoint.totalDurationSum > 0) {
          return true;
        }
      }
    }
    return false;
  }

  // Registered Endpoints Report Controls
  private currentDeviceGraphs: Array<IEndpointWrapper> = [];

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
    array: [this.ReportConstants.DEFAULT_ENDPOINT],
    click: (): void => {
      if (this.displayNewReports) {
        if (this.deviceWeekData && this.timeSelected.value === this.ReportConstants.WEEK_FILTER.value) {
          this.updateDeviceGraph(this.deviceWeekData, !this.deviceWeekData.graphData[this.deviceDropdown.selected.value].emptyGraph);
        } else if (this.deviceYearData && this.deviceYearVisible) {
          this.updateDeviceGraph(this.deviceYearData, this.deviceYearVisible);
        }
      } else {
        if (this.currentDeviceGraphs[this.deviceDropdown.selected.value].emptyGraph) {
          this.setDeviceGraph(this.DummySparkDataService.dummyDeviceData(this.timeSelected, this.displayNewReports), undefined);
          this.deviceOptions.state = this.ReportConstants.EMPTY;
        } else {
          this.setDeviceGraph(this.currentDeviceGraphs, this.deviceDropdown.selected);
          this.deviceOptions.state = this.ReportConstants.SET;
        }
      }
    },
    disabled: true,
    selected: this.ReportConstants.DEFAULT_ENDPOINT,
  };

  private setDeviceGraph(data: Array<IEndpointWrapper>, deviceFilter: IDropdownBase | undefined): void {
    this.exportArrays.device = null;
    let tempDevicesChart: any;

    if (this.displayNewReports) {
      tempDevicesChart = this.SparkGraphService.setDeviceLineGraph(data, this.charts.device, deviceFilter);
    } else {
      tempDevicesChart = this.SparkGraphService.setDeviceGraph(data, this.charts.device, deviceFilter);
    }

    if (tempDevicesChart) {
      this.charts.device = tempDevicesChart;
      this.exportArrays.device = this.CommonReportService.createExportMenu(this.charts.device);
    }
  }

  private setDeviceData(): void {
    this.deviceDropdown.array = [this.ReportConstants.DEFAULT_ENDPOINT];
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

  // Devices Line Graph
  private deviceWeekData: IEndpointContainer;
  private deviceYearData: IEndpointContainer;
  private deviceYearVisible: boolean;

  private setRegisteredDeviceGraph(min: number, max: number): void {
    this.deviceDropdown.array = [this.ReportConstants.DEFAULT_ENDPOINT];
    this.deviceDropdown.selected = this.deviceDropdown.array[0];
    this.deviceDropdown.disabled = true;
    this.deviceOptions.state = this.ReportConstants.REFRESH;
    this.setDeviceGraph(this.DummySparkDataService.dummyDeviceData(this.timeSelected, this.displayNewReports), undefined);

    if (this.timeSelected.value === this.ReportConstants.WEEK_FILTER.value) {
      if (_.isUndefined(this.deviceWeekData)) {
        this.SparkLineReportService.getDeviceData(this.timeSelected).then((response: IEndpointContainer): void => {
          this.deviceWeekData = response;
          this.updateDeviceGraph(this.deviceWeekData, !this.deviceWeekData.graphData[this.deviceDropdown.selected.value].emptyGraph);
        });
      } else {
        this.updateDeviceGraph(this.deviceWeekData, !this.deviceWeekData.graphData[this.deviceDropdown.selected.value].emptyGraph);
      }
    } else if (_.isUndefined(this.deviceYearData)) {
      this.zoomChart(this.charts.media, min, max);
      this.SparkLineReportService.getDeviceData(this.timeSelected).then((response: IEndpointContainer): void => {
        this.deviceYearData = response;
        this.deviceYearVisible = this.devicePopulated(this.deviceYearData, min, max);
        this.updateDeviceGraph(this.deviceYearData, this.deviceYearVisible);
        this.zoomChart(this.charts.device, min, max);
      });
    } else {
      this.deviceYearVisible = this.devicePopulated(this.deviceYearData, min, max);
      this.updateDeviceGraph(this.deviceYearData, this.deviceYearVisible);
      this.zoomChart(this.charts.device, min, max);
    }
  }

  private updateDeviceGraph(data: IEndpointContainer, visible: boolean): void {
    if (data.filterArray.length > 0) {
      this.deviceDropdown.array = data.filterArray.sort((a: IDropdownBase, b: IDropdownBase): number => {
        if (a.label) {
          return a.label.localeCompare(b.label);
        } else if (a > b) {
          return 1;
        } else {
          return 0;
        }
      });
    }

    this.deviceOptions.state = this.ReportConstants.EMPTY;
    if (visible) {
      this.setDeviceGraph(data.graphData, this.deviceDropdown.selected);
      this.deviceOptions.state = this.ReportConstants.SET;
      this.deviceDropdown.disabled = false;
    }
  }

  private devicePopulated(data: IEndpointContainer, min: number, max: number) {
    let graphData: IEndpointWrapper = data.graphData[this.deviceDropdown.selected.value];
    let length: number = graphData.graph.length;
    if (!graphData.emptyGraph && (length > min) && (length > max)) {
      for (let i = min; i <= max; i++) {
        let datapoint: IEndpointData = _.cloneDeep(graphData.graph[i]);
        if (datapoint.totalRegisteredDevices > 0) {
          return true;
        }
      }
    }
    return false;
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
      this.metricsOptions.state = this.ReportConstants.SET;
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
    this.metricsOptions.state = this.ReportConstants.REFRESH;
    this.SparkReportService.getCallMetricsData(this.timeSelected).then((response: IMetricsData): void => {
      if (_.isArray(response.dataProvider) && response.displayData) {
        this.setMetricGraph(response);
        this.setMetrics(response.displayData);
      } else {
        this.metricsOptions.state = this.ReportConstants.EMPTY;
      }
    });
  }

  // new metrics controller
  private sevenDayMetrics: Array<IMetricsData>;
  private yearlyMetrics: Array<IMetricsData>;

  private setCallMetricsGraph(min: number, max: number): void {
    this.metricsOptions.state = this.ReportConstants.REFRESH;
    this.setMetrics(undefined);
    this.setMetricGraph(this.DummySparkDataService.dummyMetricsData());

    if (this.timeSelected.value === this.ReportConstants.WEEK_FILTER.value) {
      if (_.isUndefined(this.sevenDayMetrics)) {
        this.SparkLineReportService.getMetricsData(this.timeSelected).then((response: Array<IMetricsData>): void => {
          this.sevenDayMetrics = response;
          this.setMetricsData(this.sevenDayMetrics, 1, 7);
        });
      } else {
        this.setMetricsData(this.sevenDayMetrics, 1, 7);
      }
    } else if (_.isUndefined(this.yearlyMetrics)) {
      this.SparkLineReportService.getMetricsData(this.timeSelected).then((response: Array<IMetricsData>): void => {
        this.yearlyMetrics = response;
        this.setMetricsData(this.yearlyMetrics, min + 1, max + 1);
      });
    } else {
      this.setMetricsData(this.yearlyMetrics, min + 1, max + 1);
    }
  }

  private setMetricsData(data: Array<IMetricsData>, min: number, max: number): void {
    let combinedData: IMetricsData = _.cloneDeep(data[min]);
    for (let i = min + 1; i <= max; i++) {
      if (combinedData && combinedData.displayData && data[i] && data[i].displayData) {
        let display: IMetricsLabel = _.get(data[i], 'display', {
          totalCalls: 0,
          totalAudioDuration: 0,
          totalFailedCalls: 0,
        });

        combinedData.dataProvider[0].numCalls += data[i].dataProvider[0].numCalls;
        combinedData.dataProvider[0].percentage = (combinedData.dataProvider[0].percentage + data[i].dataProvider[0].percentage) / 2;

        combinedData.dataProvider[1].numCalls += data[i].dataProvider[1].numCalls;
        combinedData.dataProvider[1].percentage = (combinedData.dataProvider[1].percentage + data[i].dataProvider[1].percentage) / 2;

        combinedData.displayData.totalCalls += display.totalCalls;
        combinedData.displayData.totalAudioDuration += display.totalAudioDuration;
        combinedData.displayData.totalFailedCalls = _.toInteger(combinedData.displayData.totalFailedCalls) + _.toInteger(display.totalFailedCalls);
      } else if (data[i] && data[i].displayData) {
        combinedData = _.cloneDeep(data[i]);
      }
    }

    this.metricsOptions.state = this.ReportConstants.EMPTY;
    if (combinedData && combinedData.displayData) {
      let average = (_.toInteger(combinedData.displayData.totalFailedCalls) / combinedData.displayData.totalCalls) * this.ReportConstants.PERCENTAGE_MULTIPLIER;
      combinedData.displayData.totalFailedCalls = average.toFixed(this.ReportConstants.FIXED);
      this.setMetricGraph(combinedData);
      this.setMetrics(combinedData.displayData);
    }
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
    this.setDeviceGraph(this.DummySparkDataService.dummyDeviceData(this.timeSelected, this.displayNewReports), undefined);
    this.setMediaGraph(this.DummySparkDataService.dummyMediaData(this.timeSelected, this.displayNewReports));

    this.CardUtils.resize(0);
  }

  private zoomChart(chart: any, min: number, max: number): void {
    if (chart && chart.zoomToIndexes) {
      chart.zoomToIndexes(min, max);
    }
  }
}

angular
  .module('Core')
  .controller('SparkReportCtrl', SparkReportCtrl);
