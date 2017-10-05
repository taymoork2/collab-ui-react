import './_spark-reports.scss';
import { ReportPrintService } from '../../partnerReports/commonReportServices/reportPrint.service';
import { ReportConstants } from '../../partnerReports/commonReportServices/reportConstants.service';
import {
  IActiveTableBase,
  IActiveUserData,
  IFilterObject,
  IDropdownBase,
  IReportCard,
  IReportDropdown,
  IReportLabel,
  IReportTooltip,
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
  ICharts,
  IConversation,
  IConversationPopulated,
  IConversationWrapper,
  IEndpointContainer,
  IEndpointData,
  IEndpointWrapper,
  IFilesShared,
  IMediaData,
  IMetricsData,
  IMetricsLabel,
  IMinMax,
  IPlaceHolder,
} from './sparkReportInterfaces';

import { CardUtils } from 'modules/core/cards';

export class SparkReportCtrl {
  public gridOptions: uiGrid.IGridOptions;
  public gridRefresh: boolean = true;

  /* @ngInject */
  constructor(
    private $scope: ng.IScope,
    private $rootScope: ng.IRootScopeService,
    private $timeout: ng.ITimeoutService,
    private $translate: ng.translate.ITranslateService,
    private CardUtils: CardUtils,
    private ReportPrintService: ReportPrintService,
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
    this.FeatureToggleService.supports(this.FeatureToggleService.features.hI802)
      .then(supports => {
        if (supports) {
          this.filterArray[3].toggle = (): void => {
            this.resetCards(this.DETAILS);
            this.onInit();
          };
        }
      });

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

        this.qualityTooltip = {
          title: 'mediaQuality.avgMinutes',
          text: 'mediaQuality.minTooltip',
        };
        this.qualityLabels = [{
          class: this.ReportConstants.GOOD,
          click: (): void => {
            if (this.charts.media && this.qualityLabels[0].hidden) {
              this.charts.media.showGraph(this.charts.media.graphs[2]);
              this.qualityLabels[0].hidden = false;
            } else if (this.charts.media) {
              this.charts.media.hideGraph(this.charts.media.graphs[2]);
              this.qualityLabels[0].hidden = true;
            }
          },
          hidden: false,
          number: 0,
          text: 'mediaQuality.good',
        }, {
          class: this.ReportConstants.FAIR,
          click: (): void => {
            if (this.charts.media && this.qualityLabels[1].hidden) {
              this.charts.media.showGraph(this.charts.media.graphs[1]);
              this.qualityLabels[1].hidden = false;
            } else if (this.charts.media) {
              this.charts.media.hideGraph(this.charts.media.graphs[1]);
              this.qualityLabels[1].hidden = true;
            }
          },
          hidden: false,
          number: 0,
          text: 'mediaQuality.fair',
        }, {
          class: this.ReportConstants.POOR,
          click: (): void => {
            if (this.charts.media && this.qualityLabels[2].hidden) {
              this.charts.media.showGraph(this.charts.media.graphs[0]);
              this.qualityLabels[2].hidden = false;
            } else if (this.charts.media) {
              this.charts.media.hideGraph(this.charts.media.graphs[0]);
              this.qualityLabels[2].hidden = true;
            }
          },
          hidden: false,
          number: 0,
          text: 'mediaQuality.poor',
        }];
      }

      this.$timeout((): void => {
        if (this.displayNewReports) {
          this.minMax = {
            min: this.timeSelected.min,
            max: this.timeSelected.max,
          };

          this.setActiveLineGraph();
          this.setConversationGraphs();
          this.setCallQualityGraph();
          this.setCallMetricsGraph();
          this.setRegisteredDeviceGraph();
        } else {
          this.setDummyData();
          this.setAllGraphs();
        }
      }, 30);
    });
    this.initDatePicker();
  }

  private initDatePicker(): void {
    if (this.timeSelected.value === this.ReportConstants.WEEK_FILTER.value) {
      this.startDate = moment().subtract(7, 'days').format('YYYY-MM-DD');
      this.endDate =  moment().format('YYYY-MM-DD');
      this.startTime = moment().subtract(7, 'days').format('h:mm A');
      this.endTime = moment().format('h:mm A');
    }
  }

  public onInit(): void {
    this.setGridOptions();
    this.onRefreshed();
    this.setGridData();
  }

  private onRefreshed(): void {
    const deregister = this.$rootScope.$on('refreshed', () => {
      this.gridOptions.data = [];
      this.gridRefresh = true;
    });
    this.$scope.$on('$destroy', deregister);
  }

  private setGridData(): void {
    this.SparkReportService.getCDRReport().then((res) => {
      const dta: any = _.get(res, 'data.CDR');
      _.forEach(dta, (item) => {
        item.caller_partyNumber = item.dataParam.calling_partyNumber;
        item.callie_partyNumber = item.dataParam.called_partyNumber;
        item.dte = item.ts;
        item.duration = item.dataParam.duration;
        item.typeOfCall = 'PSTN';
        item.calltype = 'Voice';
        item.status = 'Sucessful';
      });
      this.gridOptions.data = dta;
      this.gridRefresh = false;
    });
  }

  private setGridOptions(): void {
    const columnDefs = [{
      sortable: true,
      width: '11%',
      field: 'typeOfCall',
      displayName: this.$translate.instant('reportsPage.type'),
    }, {
      sortable: true,
      width: '12%',
      field: 'calltype',
      displayName: this.$translate.instant('reportsPage.format'),
    }, {
      width: '21%',
      sortable: true,
      field: 'caller_partyNumber',
      displayName: this.$translate.instant('reportsPage.from'),
    }, {
      width: '21%',
      sortable: true,
      field: 'callie_partyNumber',
      displayName: this.$translate.instant('reportsPage.to'),
    }, {
      width: '12%',
      sortable: true,
      field: 'dte',
      displayName: this.$translate.instant('reportsPage.date'),
    }, {
      width: '10%',
      sortable: true,
      field: 'duration',
      displayName: this.$translate.instant('reportsPage.duration'),
    }, {
      width: '13%',
      sortable: true,
      field: 'status',
      displayName: this.$translate.instant('reportsPage.status'),
    }];

    this.gridOptions = {
      rowHeight: 45,
      columnDefs: columnDefs,
      infiniteScrollDown: true,
    };
  }

  public displayNewReports: boolean = false;
  private reportsUpdateToggle = this.FeatureToggleService.atlasReportsUpdateGetStatus();
  private minMax: IMinMax;

  // charts and export controls
  private charts: ICharts = {};
  public exportArrays: ICharts = {};

  public exportFullPage(): void {
    this.ReportPrintService.printCustomerPage(this.currentFilter, this.timeSelected, this.minMax, this.charts, {
      active: this.activeOptions,
      rooms: this.avgRoomOptions,
      files: this.filesSharedOptions,
      media: this.mediaOptions,
      device: this.deviceOptions,
      metrics: this.metricsOptions,
    }, {
      active: this.activeDropdown,
      media: this.mediaDropdown,
      device: this.deviceDropdown,
    }, {
      media: this.qualityLabels,
      metrics: this.metricsLabels,
    });
  }

  //Call details reports header controls
  public placeHolder: IPlaceHolder = {
    searchbox: this.$translate.instant('reportsPage.placeholder.searchbox'),
    startDate: this.$translate.instant('reportsPage.placeholder.startDate'),
    endDate: this.$translate.instant('reportsPage.placeholder.endDate'),
    startTime: this.$translate.instant('reportsPage.placeholder.startTime'),
    endTime: this.$translate.instant('reportsPage.placeholder.endTime'),
    to: this.$translate.instant('reportsPage.placeholder.to'),
  };
  public startDate: string = moment().format('YYYY-MM-DD');
  public startTime: string = moment().format('h:mm a');
  public endDate: string = moment().format('YYYY-MM-DD');
  public endTime: string = '10:00 PM';

  // report display filter controls
  public readonly ALL: string = this.ReportConstants.ALL;
  public readonly ENGAGEMENT: string = this.ReportConstants.ENGAGEMENT;
  public readonly QUALITY: string = this.ReportConstants.QUALITY;
  public readonly DETAILS: string = this.ReportConstants.DETAILS;
  public currentFilter: string = this.ALL;
  public displayEngagement: boolean = true;
  public displayQuality: boolean = true;
  public displayDetails: boolean = false;
  public filterArray: IFilterObject[] = this.ReportConstants.FILTER_ARRAY;

  // Time Filter Controls
  public timeOptions: ITimespan[] = _.cloneDeep(this.ReportConstants.TIME_FILTER);
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
          this.dateChangeHandler();
        }
      });
    },
  };

  private dateChangeHandler(): void {
    if (this.timeSelected.value === this.ReportConstants.MONTH_FILTER.value) {
      this.startDate = moment().subtract(4, 'weeks').format('YYYY-MM-DD');
      this.endDate = moment().format('YYYY-MM-DD');
      this.startTime = moment().subtract(4, 'weeks').format('h:mm A');
      this.endTime = moment().format('h:mm A');
    } else if (this.timeSelected.value === this.ReportConstants.THREE_MONTH_FILTER.value) {
      this.startDate = moment().subtract(3, 'months').format('YYYY-MM-DD');
      this.endDate = moment().format('YYYY-MM-DD');
      this.startTime = moment().subtract(3, 'months').format('h:mm A');
      this.endTime = moment().format('h:mm A');
    } else if (this.timeSelected.value === this.ReportConstants.WEEK_FILTER.value) {
      this.startDate = moment().subtract(7, 'days').format('YYYY-MM-DD');
      this.endDate = moment().format('YYYY-MM-DD');
      this.startTime = moment().subtract(7, 'days').format('h:mm A');
      this.endTime = moment().format('h:mm A');
    }
  }

  private sliderUpdate(min: number, max: number): void {
    this.minMax.min = min;
    this.minMax.max = max;

    this.activeDropdown.selected = this.activeDropdown.array[0];
    this.activeOptions.titlePopover = this.ReportConstants.UNDEF;
    if (this.timeSelected.value !== this.ReportConstants.WEEK_FILTER.value && this.timeSelected.value !== this.ReportConstants.MONTH_FILTER.value && this.timeSelected.value !== this.ReportConstants.THREE_MONTH_FILTER.value) {
      this.activeOptions.titlePopover = 'activeUsers.customMessage';
    }

    this.setActiveLineGraph();
    this.setConversationGraphs();
    this.setCallQualityGraph();
    this.setCallMetricsGraph();
    this.setRegisteredDeviceGraph();
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
  private activeArray: IDropdownBase[] = _.cloneDeep(this.ReportConstants.ACTIVE_FILTER);
  public activeDropdown: IReportDropdown;

  public activeOptions: IReportCard = {
    animate: true,
    description: 'activeUsers.customerPortalDescription',
    headerTitle: 'activeUsers.activeUsers',
    id: 'activeUsers',
    reportType: this.ReportConstants.BARCHART,
    state: this.ReportConstants.REFRESH,
    titlePopover: this.ReportConstants.UNDEF,
  };

  public secondaryActiveOptions: ISecondaryReport = {
    alternateTranslations: false,
    broadcast: 'ReportCard::UpdateSecondaryReport',
    description: 'activeUsers.customerMostActiveDescription',
    display: true,
    emptyDescription: 'activeUsers.noActiveUsers',
    errorDescription: 'activeUsers.errorActiveUsers',
    missingUsersErrorDescription: 'activeUsers.missingUsersError',
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

  private setActiveGraph(data: IActiveUserData[]): void {
    this.exportArrays.active = null;
    let tempActiveUserChart: any;
    if (this.displayNewReports) {
      tempActiveUserChart = this.SparkGraphService.setActiveLineGraph(data, this.charts.active);
    } else {
      tempActiveUserChart = this.SparkGraphService.setActiveUsersGraph(data, this.charts.active);
    }

    if (tempActiveUserChart) {
      this.charts.active = tempActiveUserChart;
      this.exportArrays.active = this.ReportPrintService.createExportMenu(this.charts.active);
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
      const graphData: any[] = _.get(response, 'graphData', []);
      this.updateActiveLineGraph(response, graphData.length > 0);
    });

    this.SparkReportService.getMostActiveUserData(this.timeSelected).then((response: IActiveTableBase[]): void => {
      if (response.length === 0) {
        this.secondaryActiveOptions.state = this.ReportConstants.EMPTY;
      } else {
        this.secondaryActiveOptions.state = this.ReportConstants.SET;
      }
      this.secondaryActiveOptions.table.data = response;
      this.$rootScope.$broadcast(this.secondaryActiveOptions.broadcast);
    }).catch((response?: IActiveTableBase[]): void => {
      if (response) {
        this.secondaryActiveOptions.table.data = response;
      }
      this.secondaryActiveOptions.state = this.ReportConstants.ERROR;
    });
  }

  // Active User Line Graph Controls
  private activeUserSevenDayData: IActiveUserWrapper;
  private activeUserYearData: IActiveUserWrapper;

  private setActiveLineGraph(): void {
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
          const graphData = _.get(response, 'graphData', []);
          this.updateActiveLineGraph(this.activeUserSevenDayData, graphData.length > 0);
        });
      } else {
        const graphData = _.get(this.activeUserSevenDayData, 'graphData', []);
        this.updateActiveLineGraph(this.activeUserSevenDayData, graphData.length > 0);
      }
    } else if (_.isUndefined(this.activeUserYearData)) {
      this.zoomChart(this.charts.active);
      this.SparkLineReportService.getActiveUserData(this.timeSelected).then((response: IActiveUserWrapper): void => {
        this.activeUserYearData = response;
        this.updateActiveLineGraph(this.activeUserYearData, this.activePopulated(this.activeUserYearData.graphData));
        this.zoomChart(this.charts.active);
      });
    } else {
      this.updateActiveLineGraph(this.activeUserYearData, this.activePopulated(this.activeUserYearData.graphData));
      this.zoomChart(this.charts.active);
    }

    if (this.timeSelected.value === this.ReportConstants.WEEK_FILTER.value || this.timeSelected.value === this.ReportConstants.MONTH_FILTER.value
      || this.timeSelected.value === this.ReportConstants.THREE_MONTH_FILTER.value) {
      this.secondaryActiveOptions.display = true;
      this.SparkLineReportService.getMostActiveUserData(this.timeSelected).then((response: IActiveTableBase[]): void => {
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

  private activePopulated(data: IActiveUserData[]): boolean {
    const length: number = data.length;
    if ((length > 0) && (length > this.minMax.min) && (length > this.minMax.max)) {
      for (let i = this.minMax.min; i <= this.minMax.max; i++) {
        const datapoint: IActiveUserData = _.cloneDeep(data[i]);
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
    titlePopover: this.ReportConstants.UNDEF,
  };

  private setAverageGraph(data: IAvgRoomData[] | IConversation[]): void {
    this.exportArrays.rooms = null;
    let temprooms: any;
    if (this.displayNewReports) {
      temprooms = this.SparkGraphService.setRoomGraph(data, this.charts.rooms);
    } else {
      temprooms = this.SparkGraphService.setAvgRoomsGraph(data, this.charts.rooms);
    }

    if (temprooms) {
      this.charts.rooms = temprooms;
      this.exportArrays.rooms = this.ReportPrintService.createExportMenu(this.charts.rooms);
    }
  }

  private setAvgRoomData() {
    this.SparkReportService.getAvgRoomData(this.timeSelected).then((response: IAvgRoomData[]): void => {
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

  private setConversationGraphs(): void {
    this.filesSharedOptions.state = this.ReportConstants.REFRESH;
    this.avgRoomOptions.state = this.ReportConstants.REFRESH;
    const dummyData = this.DummySparkDataService.dummyConversationData(this.timeSelected);
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
      this.zoomChart(this.charts.rooms);
      this.zoomChart(this.charts.files);
      this.SparkLineReportService.getConversationData(this.timeSelected).then((response: IConversationWrapper): void => {
        this.yearlyConversations = response;
        this.updateConversationGraphs(this.yearlyConversations, this.conversationPopulated(this.yearlyConversations));
        this.zoomChart(this.charts.rooms);
        this.zoomChart(this.charts.files);
      });
    } else {
      this.updateConversationGraphs(this.yearlyConversations, this.conversationPopulated(this.yearlyConversations));
      this.zoomChart(this.charts.rooms);
      this.zoomChart(this.charts.files);
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

  private conversationPopulated(data: IConversationWrapper): IConversationPopulated {
    const populated = {
      files: false,
      rooms: false,
    };

    const dataArray = _.get(data, 'array', []);
    const length: number = dataArray.length;
    if ((length > 0) && (length > this.minMax.min) && (length > this.minMax.max) && (data.hasRooms || data.hasFiles)) {
      for (let i = this.minMax.min; i <= this.minMax.max; i++) {
        const datapoint: IConversation = _.cloneDeep(dataArray[i]);
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
    titlePopover: this.ReportConstants.UNDEF,
  };

  private setFilesGraph(data: IFilesShared[] | IConversation[]): void {
    this.exportArrays.files = null;
    let tempfiles: any;
    if (this.displayNewReports) {
      tempfiles = this.SparkGraphService.setFilesGraph(data, this.charts.files);
    } else {
      tempfiles = this.SparkGraphService.setFilesSharedGraph(data, this.charts.files);
    }

    if (tempfiles) {
      this.charts.files = tempfiles;
      this.exportArrays.files = this.ReportPrintService.createExportMenu(this.charts.files);
    }
  }

  private setFilesSharedData() {
    this.SparkReportService.getFilesSharedData(this.timeSelected).then((response: IFilesShared[]): void => {
      if (response.length === 0) {
        this.filesSharedOptions.state = this.ReportConstants.EMPTY;
      } else {
        this.setFilesGraph(response);
        this.filesSharedOptions.state = this.ReportConstants.SET;
      }
    });
  }

  // Media Quality Report Controls
  private mediaData: IMediaData[] = [];
  private mediaArray: IDropdownBase[] = _.cloneDeep(this.ReportConstants.MEDIA_FILTER);

  public mediaOptions: IReportCard = {
    animate: true,
    description: 'mediaQuality.descriptionCustomer',
    headerTitle: 'mediaQuality.mediaQuality',
    id: 'mediaQuality',
    reportType: this.ReportConstants.BARCHART,
    state: this.ReportConstants.REFRESH,
    titlePopover: 'mediaQuality.packetLossDefinition',
  };
  public mediaDropdown: IReportDropdown = {
    array: this.mediaArray,
    click: (): void => {
      if (this.displayNewReports) {
        this.resetQualityLabels();
        if (this.timeSelected.value === this.ReportConstants.WEEK_FILTER.value) {
          this.updateQualityGraph(this.qualitySevenDayData, this.qualitySevenDayData && this.qualitySevenDayData.length > 0);
        } else {
          const populated = this.qualityPopulated(this.qualityYearData);
          this.updateQualityGraph(this.qualityYearData, populated);
          this.zoomChart(this.charts.media);
        }
      } else {
        this.setMediaGraph(this.mediaData);
      }
    },
    disabled: true,
    selected: this.mediaArray[0],
  };

  private setMediaGraph(data: IMediaData[]): void {
    this.exportArrays.media = null;
    let tempmedia: any;
    if (this.displayNewReports) {
      tempmedia = this.SparkGraphService.setQualityGraph(data, this.charts.media, this.mediaDropdown.selected);
    } else {
      tempmedia = this.SparkGraphService.setMediaQualityGraph(data, this.charts.media, this.mediaDropdown.selected);
    }

    if (tempmedia) {
      this.charts.media = tempmedia;
      this.exportArrays.media = this.ReportPrintService.createExportMenu(this.charts.media);
    }
  }

  private setMediaData() {
    this.mediaDropdown.disabled = true;
    this.mediaData = [];
    this.SparkReportService.getMediaQualityData(this.timeSelected).then((response: IMediaData[]): void => {
      this.mediaData = response;
      this.updateQualityGraph(response, response.length > 0);
    });
  }

  // Call Quality Line Graph Controls
  private qualitySevenDayData: IMediaData[];
  private qualityYearData: IMediaData[];

  public qualityLabels: IReportLabel[];
  public qualityTooltip: IReportTooltip;

  private resetQualityLabels(): void {
    _.forEach(this.qualityLabels, (item: IReportLabel): void => {
      item.number = 0;
      item.hidden = false;
    });
  }

  private setCallQualityGraph(): void {
    this.mediaDropdown.disabled = true;
    this.mediaOptions.state = this.ReportConstants.REFRESH;
    this.setMediaGraph(this.DummySparkDataService.dummyMediaData(this.timeSelected, this.displayNewReports));
    if (this.displayNewReports) {
      this.resetQualityLabels();
    }

    if (this.timeSelected.value === this.ReportConstants.WEEK_FILTER.value) {
      if (_.isUndefined(this.qualitySevenDayData)) {
        this.SparkLineReportService.getMediaQualityData(this.timeSelected).then((response: IMediaData[]): void => {
          this.qualitySevenDayData = response;
          const populated = this.qualitySevenDayData.length > 0;
          this.updateQualityGraph(this.qualitySevenDayData, populated);
        });
      } else {
        const populated = this.qualitySevenDayData.length > 0;
        this.updateQualityGraph(this.qualitySevenDayData, populated);
      }
    } else if (_.isUndefined(this.qualityYearData)) {
      this.zoomChart(this.charts.media);
      this.SparkLineReportService.getMediaQualityData(this.timeSelected).then((response: IMediaData[]): void => {
        this.qualityYearData = response;
        const populated = this.qualityPopulated(this.qualityYearData);
        this.updateQualityGraph(this.qualityYearData, populated);
        this.zoomChart(this.charts.media);
      });
    } else {
      const populated = this.qualityPopulated(this.qualityYearData);
      this.updateQualityGraph(this.qualityYearData, populated);
      this.zoomChart(this.charts.media);
    }
  }

  private updateQualityGraph(data: IMediaData[], populated: boolean): void {
    if (populated) {
      this.setMediaGraph(data);
      this.mediaOptions.state = this.ReportConstants.SET;
      this.mediaDropdown.disabled = false;
    } else {
      this.mediaOptions.state = this.ReportConstants.EMPTY;
    }

    if (this.displayNewReports && populated) {
      for (let i = this.minMax.min; i <= this.minMax.max; i++) {
        const item: IMediaData = data[i];
        if (this.mediaDropdown.selected.value === this.ReportConstants.MEDIA_FILTER_ONE.value) {
          this.qualityLabels[0].number = _.toInteger(this.qualityLabels[0].number) + item.goodQualityDurationSum;
          this.qualityLabels[1].number = _.toInteger(this.qualityLabels[1].number) + item.fairQualityDurationSum;
          this.qualityLabels[2].number = _.toInteger(this.qualityLabels[2].number) + item.poorQualityDurationSum;
        } else if (this.mediaDropdown.selected.value === this.ReportConstants.MEDIA_FILTER_TWO.value) {
          this.qualityLabels[0].number = _.toInteger(this.qualityLabels[0].number) + item.goodAudioQualityDurationSum;
          this.qualityLabels[1].number = _.toInteger(this.qualityLabels[1].number) + item.fairAudioQualityDurationSum;
          this.qualityLabels[2].number = _.toInteger(this.qualityLabels[2].number) + item.poorAudioQualityDurationSum;
        } else {
          this.qualityLabels[0].number = _.toInteger(this.qualityLabels[0].number) + item.goodVideoQualityDurationSum;
          this.qualityLabels[1].number = _.toInteger(this.qualityLabels[1].number) + item.fairVideoQualityDurationSum;
          this.qualityLabels[2].number = _.toInteger(this.qualityLabels[2].number) + item.poorVideoQualityDurationSum;
        }
      }
      const total: number = this.minMax.max - this.minMax.min + 1;
      this.qualityLabels[0].number = Math.round(_.toInteger(this.qualityLabels[0].number) / total);
      this.qualityLabels[1].number = Math.round(_.toInteger(this.qualityLabels[1].number) / total);
      this.qualityLabels[2].number = Math.round(_.toInteger(this.qualityLabels[2].number) / total);
    }
  }

  private qualityPopulated(data: IMediaData[]): boolean {
    const length: number = data.length;
    if ((length > 0) && (length > this.minMax.min) && (length > this.minMax.max)) {
      for (let i = this.minMax.min; i <= this.minMax.max; i++) {
        const datapoint: IMediaData = _.cloneDeep(data[i]);
        if (datapoint.totalDurationSum > 0) {
          return true;
        }
      }
    }
    return false;
  }

  // Registered Endpoints Report Controls
  private currentDeviceGraphs: IEndpointWrapper[] = [];

  public deviceOptions: IReportCard = {
    animate: true,
    description: 'registeredEndpoints.customerDescription',
    headerTitle: 'registeredEndpoints.registeredEndpoints',
    id: 'devices',
    reportType: this.ReportConstants.BARCHART,
    state: this.ReportConstants.REFRESH,
    titlePopover: this.ReportConstants.UNDEF,
  };

  public deviceDropdown: IReportDropdown = {
    array: [this.ReportConstants.DEFAULT_ENDPOINT],
    click: (): void => {
      if (this.displayNewReports) {
        if (this.deviceWeekData && this.timeSelected.value === this.ReportConstants.WEEK_FILTER.value) {
          this.updateDeviceGraph(this.deviceWeekData, !this.deviceWeekData.graphData[this.deviceDropdown.selected.value].emptyGraph);
        } else if (this.deviceYearData) {
          this.updateDeviceGraph(this.deviceYearData, this.devicePopulated(this.deviceYearData));
        }
      } else {
        if (this.currentDeviceGraphs[this.deviceDropdown.selected.value].emptyGraph) {
          this.setDeviceGraph(this.DummySparkDataService.dummyDeviceData(this.timeSelected, this.displayNewReports));
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

  private setDeviceGraph(data: IEndpointWrapper[], deviceFilter?: IDropdownBase): void {
    this.exportArrays.device = null;
    let tempDevicesChart: any;

    if (this.displayNewReports) {
      tempDevicesChart = this.SparkGraphService.setDeviceLineGraph(data, this.charts.device, deviceFilter);
    } else {
      tempDevicesChart = this.SparkGraphService.setDeviceGraph(data, this.charts.device, deviceFilter);
    }

    if (tempDevicesChart) {
      this.charts.device = tempDevicesChart;
      this.exportArrays.device = this.ReportPrintService.createExportMenu(this.charts.device);
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

  private setRegisteredDeviceGraph(): void {
    this.deviceDropdown.array = [this.ReportConstants.DEFAULT_ENDPOINT];
    this.deviceDropdown.selected = this.deviceDropdown.array[0];
    this.deviceDropdown.disabled = true;
    this.deviceOptions.state = this.ReportConstants.REFRESH;
    this.setDeviceGraph(this.DummySparkDataService.dummyDeviceData(this.timeSelected, this.displayNewReports));

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
      this.zoomChart(this.charts.device);
      this.SparkLineReportService.getDeviceData(this.timeSelected).then((response: IEndpointContainer): void => {
        this.deviceYearData = response;
        this.updateDeviceGraph(this.deviceYearData, this.devicePopulated(this.deviceYearData));
        this.zoomChart(this.charts.device);
      });
    } else {
      this.updateDeviceGraph(this.deviceYearData, this.devicePopulated(this.deviceYearData));
      this.zoomChart(this.charts.device);
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

  private devicePopulated(data: IEndpointContainer) {
    const graphData: IEndpointWrapper = data.graphData[this.deviceDropdown.selected.value];
    const length: number = graphData.graph.length;
    if (!graphData.emptyGraph && (length > this.minMax.min) && (length > this.minMax.max)) {
      for (let i = this.minMax.min; i <= this.minMax.max; i++) {
        const datapoint: IEndpointData = _.cloneDeep(graphData.graph[i]);
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
    titlePopover: this.ReportConstants.UNDEF,
  };

  public metricsLabels: IReportLabel[] = [{
    hidden: false,
    number: 0,
    text: 'callMetrics.totalCalls',
  }, {
    hidden: false,
    number: 0,
    text: 'callMetrics.callMinutes',
  }, {
    hidden: false,
    number: 0,
    text: 'callMetrics.failureRate',
  }];

  private setMetricGraph(data: IMetricsData): void {
    this.exportArrays.metrics = null;
    const tempmetrics: any = this.SparkGraphService.setMetricsGraph(data, this.charts.metrics);
    if (tempmetrics) {
      this.charts.metrics = tempmetrics;
      this.exportArrays.metrics = this.ReportPrintService.createExportMenu(this.charts.metrics);
      this.metricsOptions.state = this.ReportConstants.SET;
    }
  }

  private setMetrics(data?: IMetricsLabel): void {
    if (data) {
      this.metricsLabels[0].number = data.totalCalls;
      this.metricsLabels[1].number = data.totalAudioDuration;
      this.metricsLabels[2].number = data.totalFailedCalls + '%';
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
  private sevenDayMetrics: IMetricsData[];
  private yearlyMetrics: IMetricsData[];

  private setCallMetricsGraph(): void {
    this.metricsOptions.state = this.ReportConstants.REFRESH;
    this.setMetrics();
    this.setMetricGraph(this.DummySparkDataService.dummyMetricsData());

    if (this.timeSelected.value === this.ReportConstants.WEEK_FILTER.value) {
      if (_.isUndefined(this.sevenDayMetrics)) {
        this.SparkLineReportService.getMetricsData(this.timeSelected).then((response: IMetricsData[]): void => {
          this.sevenDayMetrics = response;
          this.setMetricsData(this.sevenDayMetrics, 1, 7);
        });
      } else {
        this.setMetricsData(this.sevenDayMetrics, 1, 7);
      }
    } else if (_.isUndefined(this.yearlyMetrics)) {
      this.SparkLineReportService.getMetricsData(this.timeSelected).then((response: IMetricsData[]): void => {
        this.yearlyMetrics = response;
        this.setMetricsData(this.yearlyMetrics, this.minMax.min + 1, this.minMax.max + 1);
      });
    } else {
      this.setMetricsData(this.yearlyMetrics, this.minMax.min + 1, this.minMax.max + 1);
    }
  }

  private setMetricsData(data: IMetricsData[], min: number, max: number): void {
    let combinedData: IMetricsData = _.cloneDeep(data[min]);
    for (let i = min + 1; i <= max; i++) {
      if (combinedData && combinedData.displayData && data[i] && data[i].displayData) {
        const display: IMetricsLabel = _.get(data[i], 'display', {
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
      const average = (_.toInteger(combinedData.displayData.totalFailedCalls) / combinedData.displayData.totalCalls) * this.ReportConstants.PERCENTAGE_MULTIPLIER;
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
      this.displayDetails = false;
      if (filter === this.ALL || filter === this.ENGAGEMENT) {
        this.displayEngagement = true;
      }
      if (filter === this.ALL || filter === this.QUALITY) {
        this.displayQuality = true;
      }
      if (filter === this.DETAILS) {
        this.displayDetails = true;
        this.$rootScope.$emit('refreshed');
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
    this.setMetrics();
    this.setMetricGraph(this.DummySparkDataService.dummyMetricsData());
    this.setDeviceGraph(this.DummySparkDataService.dummyDeviceData(this.timeSelected, this.displayNewReports));
    this.setMediaGraph(this.DummySparkDataService.dummyMediaData(this.timeSelected, this.displayNewReports));

    this.CardUtils.resize(0);
  }

  private zoomChart(chart: any): void {
    if (chart && chart.zoomToIndexes) {
      chart.zoomToIndexes(this.minMax.min, this.minMax.max);
    }
  }
}
