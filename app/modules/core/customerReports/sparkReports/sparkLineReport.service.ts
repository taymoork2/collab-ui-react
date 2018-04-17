import { CommonReportService } from '../../partnerReports/commonReportServices/commonReport.service';
import { ReportConstants } from '../../partnerReports/commonReportServices/reportConstants.service';
import { ChartColors } from 'modules/core/config/chartColors';
import {
  IActiveTableBase,
  IActiveUserData,
  ITimespan,
  ITypeQuery,
} from '../../partnerReports/partnerReportInterfaces';

import {
  IActiveUserWrapper,
  IConversation,
  IConversationWrapper,
  IEndpointContainer,
  IEndpointData,
  IEndpointWrapper,
  IMediaData,
  IMetricsData,
} from './sparkReportInterfaces';

export class SparkLineReportService {
  private readonly SIMPLE_COUNT: string = 'simplecounts';

  // Promise Tracking
  private activeDeferred: ng.IDeferred<any>;
  private conversationsDeferred: ng.IDeferred<any>;
  private deviceDeferred: ng.IDeferred<any>;
  private mediaDeferred: ng.IDeferred<any>;
  private metricsDeferred: ng.IDeferred<any>;
  private mostActiveDeferred: ng.IDeferred<any>;

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private $q: ng.IQService,
    private CommonReportService: CommonReportService,
    private ReportConstants: ReportConstants,
  ) {}

  // Active User Data
  public getActiveUserData(filter: ITimespan): ng.IPromise<IActiveUserWrapper> {
    // cancel any currently running jobs
    if (this.activeDeferred) {
      this.activeDeferred.resolve(this.ReportConstants.ABORT);
    }
    this.activeDeferred = this.$q.defer();

    const returnData: IActiveUserWrapper = {
      graphData: [],
      isActiveUsers: false,
    };

    const options: ITypeQuery = this.CommonReportService.getLineTypeOptions(filter, 'activeUsers', undefined);
    return this.CommonReportService.getCustomerActiveUserData(options, this.activeDeferred).then((response: any): IActiveUserWrapper => {
      const data = _.get(response, 'data.data');
      if (data) {
        return this.adjustActiveData(data, filter, returnData);
      } else {
        return returnData;
      }
    }).catch((error): IActiveUserWrapper => {
      return this.CommonReportService.returnErrorCheck(error, 'activeUsers.overallActiveUserGraphError', returnData);
    });
  }

  private adjustActiveData(activeData: any, filter: ITimespan, returnData: IActiveUserWrapper): IActiveUserWrapper {
    let emptyGraph: boolean = true;
    const graphItem: IActiveUserData = {
      date: '',
      totalRegisteredUsers: 0,
      activeUsers: 0,
      percentage: 0,
      balloon: true,
    };
    const returnGraph: IActiveUserData[] = this.CommonReportService.getReturnLineGraph(filter, graphItem);

    _.forEach(activeData, (item: any): void => {
      const date: string = this.CommonReportService.getModifiedLineDate(item.date);
      const details: any = _.get(item, 'details[0]');

      if (details) {
        const activeUsers: number = _.toInteger(details.combinedActiveUsers);
        let totalRegisteredUsers: number = _.toInteger(details.totalSparkEntitled);
        // totalRegisteredUsers should never be less than the number of activeUsers
        if (totalRegisteredUsers < activeUsers) {
          totalRegisteredUsers = activeUsers;
        }

        if (activeUsers > 0 || totalRegisteredUsers > 0) {
          _.forEach(returnGraph, (graphPoint) => {
            if (graphPoint.date === date) {
              graphPoint.totalRegisteredUsers = totalRegisteredUsers;
              graphPoint.activeUsers = activeUsers;
              graphPoint.percentage = this.CommonReportService.getPercentage(activeUsers, totalRegisteredUsers);
              emptyGraph = false;
            }
          });
        }
      }
    });

    if (!emptyGraph) {
      returnData.graphData = returnGraph;
      returnData.isActiveUsers = true;
    }
    return returnData;
  }

  // Most Active User Data
  public getMostActiveUserData(filter: ITimespan): ng.IPromise<IActiveTableBase[]> {
    // cancel any currently running jobs
    if (this.mostActiveDeferred) {
      this.mostActiveDeferred.resolve(this.ReportConstants.ABORT);
    }
    this.mostActiveDeferred = this.$q.defer();

    const deferred: ng.IDeferred<IActiveTableBase[]> = this.$q.defer();
    const responseArray: IActiveTableBase[] = [];
    const options: ITypeQuery = this.CommonReportService.getTypeOptions(filter, 'mostActive');
    this.CommonReportService.getCustomerActiveUserData(options, this.mostActiveDeferred).then((response: any): void => {
      const responseData: any = _.get(response, 'data.data');
      if (responseData) {
        _.forEach(responseData, (item: any): void => {
          const details: any = _.get(item, 'details', undefined);
          if (details) {
            responseArray.push({
              numCalls: _.toInteger(details.sparkCalls) + _.toInteger(item.details.sparkUcCalls),
              totalActivity: _.toInteger(details.totalActivity),
              sparkMessages: _.toInteger(details.sparkMessages),
              userName: details.userName,
            });
          }
        });
      }
      deferred.resolve(responseArray);
    }).catch((error: any): void => {
      deferred.reject(this.CommonReportService.returnErrorCheck(error, 'activeUsers.mostActiveError', responseArray));
    });

    return deferred.promise;
  }

  // Conversation Data
  public getConversationData(filter: ITimespan): ng.IPromise<IConversationWrapper> {
    // cancel any currently running jobs
    if (this.conversationsDeferred) {
      this.conversationsDeferred.resolve(this.ReportConstants.ABORT);
    }
    this.conversationsDeferred = this.$q.defer();

    const graphItem: IConversation = {
      date: '',
      balloon: true,
      avgRooms: 0,
      contentShared: 0,
      contentShareSizes: 0,
      groupRooms: 0,
      oneToOneRooms: 0,
      totalRooms: 0,
    };

    const returnItem: IConversationWrapper = {
      array: this.CommonReportService.getReturnLineGraph(filter, graphItem),
      hasFiles: false,
      hasRooms: false,
    };

    const options: ITypeQuery = this.CommonReportService.getLineTypeOptions(filter, 'conversations', this.SIMPLE_COUNT);
    options.cache = false;
    return this.CommonReportService.getCustomerAltReportByType(options, this.activeDeferred).then((response: any): IConversationWrapper => {
      const data: any[] = _.get(response, 'data.data', []);

      _.forEach(data, (item: any): void => {
        const date: string = this.CommonReportService.getModifiedLineDate(item.date);
        const details: any = _.get(item, 'details');

        if (details) {
          _.forEach(returnItem.array, (graphItem: IConversation): void => {
            if (graphItem.date === date) {
              const totalRooms: number = _.toInteger(details.numRoomsCreated);
              const contentShared: number = _.toInteger(details.numSharedCount);

              if (totalRooms > 0) {
                graphItem.avgRooms = parseFloat(details.avgRoomsPerUser).toFixed(this.ReportConstants.FIXED);
                graphItem.groupRooms = _.toInteger(details.numGroupRooms);
                graphItem.oneToOneRooms = _.toInteger(details.numSingleRooms);
                graphItem.totalRooms = totalRooms;
                returnItem.hasRooms = true;
              }

              if (contentShared > 0) {
                graphItem.contentShared = contentShared;
                graphItem.contentShareSizes = parseFloat(details.sharedSize).toFixed(this.ReportConstants.FIXED);
                returnItem.hasFiles = true;
              }
            }
          });
        }
      });

      return returnItem;
    }).catch((error): IConversationWrapper => {
      return this.CommonReportService.returnErrorCheck(error, 'reportsPage.conversationError', returnItem);
    });
  }

  // Media Quality Data
  public getMediaQualityData(filter: ITimespan): ng.IPromise<IMediaData[]> {
    // cancel any currently running jobs
    if (this.mediaDeferred) {
      this.mediaDeferred.resolve(this.ReportConstants.ABORT);
    }
    this.mediaDeferred = this.$q.defer();

    const options: ITypeQuery = this.CommonReportService.getLineTypeOptions(filter, 'callQuality', this.SIMPLE_COUNT);
    options.cache = false;
    return this.CommonReportService.getCustomerAltReportByType(options, this.mediaDeferred).then((response: any): IMediaData[] => {
      const data: any = _.get(response, 'data.data', []);
      let emptyGraph: boolean = true;
      const graphItem: IMediaData = {
        date: '',
        totalDurationSum: 0,
        goodQualityDurationSum: 0,
        fairQualityDurationSum: 0,
        poorQualityDurationSum: 0,
        partialSum: 0,
        totalAudioDurationSum: 0,
        goodAudioQualityDurationSum: 0,
        fairAudioQualityDurationSum: 0,
        poorAudioQualityDurationSum: 0,
        partialAudioSum: 0,
        totalVideoDurationSum: 0,
        goodVideoQualityDurationSum: 0,
        fairVideoQualityDurationSum: 0,
        poorVideoQualityDurationSum: 0,
        partialVideoSum: 0,
        balloon: true,
      };
      const graph: IMediaData[] = this.CommonReportService.getReturnLineGraph(filter, graphItem);

      _.forEach(data, (item: any): void => {
        const details: any = _.get(item, 'details');
        if (details) {
          const modifiedDate: string = this.CommonReportService.getModifiedDate(item.date, filter);
          const goodSum: number = _.toInteger(details.goodQualityDurationSum);
          const fairSum: number = _.toInteger(details.fairQualityDurationSum);
          const poorSum: number = _.toInteger(details.poorQualityDurationSum);
          if (goodSum > 0 || fairSum > 0 || poorSum > 0) {
            const goodVideoQualityDurationSum: number = _.toInteger(details.sparkGoodVideoDurationSum) + _.toInteger(details.sparkUcGoodVideoDurationSum);
            const fairVideoQualityDurationSum: number = _.toInteger(details.sparkFairVideoDurationSum) + _.toInteger(details.sparkUcFairVideoDurationSum);
            const poorVideoQualityDurationSum: number = _.toInteger(details.sparkPoorVideoDurationSum) + _.toInteger(details.sparkUcPoorVideoDurationSum);

            const goodAudioQualityDurationSum: number = goodSum - goodVideoQualityDurationSum;
            const fairAudioQualityDurationSum: number = fairSum - fairVideoQualityDurationSum;
            const poorAudioQualityDurationSum: number = poorSum - poorVideoQualityDurationSum;

            _.forEach(graph, (graphPoint): void => {
              if (graphPoint.date === modifiedDate) {
                graphPoint.totalDurationSum = goodSum + fairSum + poorSum;
                graphPoint.goodQualityDurationSum = goodSum;
                graphPoint.fairQualityDurationSum = fairSum;
                graphPoint.poorQualityDurationSum = poorSum;

                graphPoint.totalAudioDurationSum = goodAudioQualityDurationSum + fairAudioQualityDurationSum + poorAudioQualityDurationSum;
                graphPoint.goodAudioQualityDurationSum = goodAudioQualityDurationSum;
                graphPoint.fairAudioQualityDurationSum = fairAudioQualityDurationSum;
                graphPoint.poorAudioQualityDurationSum = poorAudioQualityDurationSum;

                graphPoint.totalVideoDurationSum = goodVideoQualityDurationSum + fairVideoQualityDurationSum + poorVideoQualityDurationSum;
                graphPoint.goodVideoQualityDurationSum = goodVideoQualityDurationSum;
                graphPoint.fairVideoQualityDurationSum = fairVideoQualityDurationSum;
                graphPoint.poorVideoQualityDurationSum = poorVideoQualityDurationSum;

                emptyGraph = false;
              }
            });
          }
        }
      });
      if (emptyGraph) {
        return [];
      } else {
        return graph;
      }
    }, (error): IMediaData[] => {
      return this.CommonReportService.returnErrorCheck<IMediaData[]>(error, 'mediaQuality.customerError', []);
    });
  }

  // Call Metrics Services
  public getMetricsData(filter: ITimespan): ng.IPromise<IMetricsData[]> {
    // cancel any currently running jobs
    if (this.metricsDeferred) {
      this.metricsDeferred.resolve(this.ReportConstants.ABORT);
    }
    this.metricsDeferred = this.$q.defer();

    const responseArray: IMetricsData[] = [];
    const defaultMetrics: IMetricsData = {
      dataProvider: [{
        callCondition: this.$translate.instant('callMetrics.audioCalls'),
        numCalls: 0,
        percentage: 0,
        color: ChartColors.attentionBase,
      }, {
        callCondition: this.$translate.instant('callMetrics.videoCalls'),
        numCalls: 0,
        percentage: 0,
        color: ChartColors.primaryBase,
      }],
      displayData: undefined,
      dummy: false,
    };

    const deferred: ng.IDeferred<IMetricsData[]> = this.$q.defer();
    const options: ITypeQuery = this.CommonReportService.getLineTypeOptions(filter, 'callMetrics', this.SIMPLE_COUNT);
    options.cache = false;
    this.CommonReportService.getCustomerAltReportByType(options, this.metricsDeferred).then((response: any): void => {
      const data: any[] = _.get(response, 'data.data', []);
      _.forEach(data, (dataItem: any): void => {
        const returnItem: IMetricsData = _.cloneDeep(defaultMetrics);
        const details: any = _.get(dataItem, 'details', undefined);

        if (details) {
          const totalCalls: number = _.toInteger(details.totalCalls);
          if (totalCalls > 0) {
            const audioCalls: number = _.toInteger(details.sparkUcAudioCalls);
            const successfulCalls: number = _.toInteger(details.totalSuccessfulCalls);
            const videoCalls: number = _.toInteger(details.sparkUcVideoCalls) + _.toInteger(details.sparkVideoCalls);

            returnItem.dataProvider[0].numCalls = audioCalls;
            returnItem.dataProvider[0].percentage = this.CommonReportService.getPercentage(audioCalls, successfulCalls);
            returnItem.dataProvider[1].numCalls = videoCalls;
            returnItem.dataProvider[1].percentage = this.CommonReportService.getPercentage(videoCalls, successfulCalls);

            returnItem.displayData = {
              totalCalls: totalCalls,
              totalAudioDuration: _.toInteger(details.totalAudioDuration),
              totalFailedCalls: _.toInteger(details.totalFailedCalls),
            };
          }
        }

        responseArray.unshift(returnItem);
      });

      deferred.resolve(responseArray);
    }).catch((error: any): void => {
      deferred.reject(this.CommonReportService.returnErrorCheck(error, 'callMetrics.customerError', responseArray));
    });

    return deferred.promise;
  }

  // Registered Devices Data
  public getDeviceData(filter: ITimespan): ng.IPromise<IEndpointContainer> {
    // cancel any currently running jobs
    if (this.deviceDeferred) {
      this.deviceDeferred.resolve(this.ReportConstants.ABORT);
    }
    this.deviceDeferred = this.$q.defer();
    const deviceArray: IEndpointContainer = {
      graphData: [{
        deviceType: this.ReportConstants.DEFAULT_ENDPOINT.label,
        graph: [],
        emptyGraph: true,
        balloon: true,
      }],
      filterArray: [this.ReportConstants.DEFAULT_ENDPOINT],
    };

    const options: ITypeQuery = this.CommonReportService.getLineTypeOptions(filter, 'devicecountsbytype', undefined);
    options.cache = false;
    return this.CommonReportService.getCustomerAltReportByType(options, this.deviceDeferred).then((response: any): IEndpointContainer => {
      return this.analyzeDeviceData(response, filter, deviceArray);
    }).catch((error: any): IEndpointContainer => {
      return this.CommonReportService.returnErrorCheck(error, 'registeredEndpoints.customerError', deviceArray);
    });
  }

  private analyzeDeviceData(response: any, filter: ITimespan, deviceArray: IEndpointContainer): IEndpointContainer {
    const data: any[] = _.get(response, 'data.data', []);
    const graphItem: IEndpointData = {
      date: '',
      totalRegisteredDevices: 0,
    };
    const defaultGraph: IEndpointData[] = this.CommonReportService.getReturnLineGraph(filter, graphItem);
    deviceArray.graphData[0].graph = _.cloneDeep(defaultGraph);

    _.forEach(data, (item: any, index: number): void => {
      deviceArray.filterArray.push({
        value: (index + 1),
        label: item.deviceType,
      });
      const tempGraph: IEndpointWrapper = {
        deviceType: item.deviceType,
        graph: _.cloneDeep(defaultGraph),
        emptyGraph: true,
        balloon: true,
      };

      _.forEach(item.details, (detail: string, date: string): void => {
        const registeredDevices: number = _.toInteger(detail);
        const modifiedDate: string = this.CommonReportService.getModifiedDate(date, filter);

        _.forEach(tempGraph.graph, (graphPoint: IEndpointData, index: number): void => {
          if (graphPoint.date === modifiedDate && (registeredDevices > 0)) {
            graphPoint.totalRegisteredDevices = registeredDevices;
            tempGraph.emptyGraph = false;

            deviceArray.graphData[0].graph[index].totalRegisteredDevices += registeredDevices;
            deviceArray.graphData[0].emptyGraph = false;
          }
        });
      });
      deviceArray.graphData.push(tempGraph);
    });
    return deviceArray;
  }
}
