import { CommonReportService } from '../../partnerReports/commonReportServices/commonReport.service';
import { ReportConstants } from '../../partnerReports/commonReportServices/reportConstants.service';
import {
  IActiveTableBase,
  IActiveUserData,
  ICustomerIntervalQuery,
  ITimespan,
  ITypeQuery,
} from '../../partnerReports/partnerReportInterfaces';

import {
  IActiveUserWrapper,
  IAvgRoomData,
  IEndpointContainer,
  IEndpointData,
  IEndpointWrapper,
  IFilesShared,
  IMediaData,
  IMetricsData,
} from './sparkReportInterfaces';

export class SparkReportService {
  // Promise Tracking
  private activeDeferred: ng.IDeferred<any>;
  private mostActiveDeferred: ng.IDeferred<any>;
  private groupDeferred: ng.IDeferred<any>;
  private oneToOneDeferred: ng.IDeferred<any>;
  private avgDeferred: ng.IDeferred<any>;
  private contentSharedDeferred: ng.IDeferred<any>;
  private contentShareSizesDeferred: ng.IDeferred<any>;
  private metricsDeferred: ng.IDeferred<any>;
  private mediaDeferred: ng.IDeferred<any>;
  private deviceDeferred: ng.IDeferred<any>;

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private $q: ng.IQService,
    private chartColors,
    private CommonReportService: CommonReportService,
    private ReportConstants: ReportConstants,
  ) {}

  // Active User Data
  public getActiveUserData(filter: ITimespan): ng.IHttpPromise<IActiveUserWrapper> {
    // cancel any currently running jobs
    if (this.activeDeferred) {
      this.activeDeferred.resolve(this.ReportConstants.ABORT);
    }
    this.activeDeferred = this.$q.defer();

    let returnData: IActiveUserWrapper = {
      graphData: [],
      isActiveUsers: false,
    };

    let options: ICustomerIntervalQuery = this.CommonReportService.getCustomerOptions(filter, 'activeUsers', this.CommonReportService.DETAILED, undefined);
    return this.CommonReportService.getCustomerReport(options, this.activeDeferred).then((response: any): IActiveUserWrapper => {
      let data = _.get(response, 'data.data[0].data');
      if (data) {
        return this.adjustActiveData(data, filter, returnData);
      } else {
        return returnData;
      }
    }).catch((error: any): IActiveUserWrapper => {
      return this.CommonReportService.returnErrorCheck(error, 'activeUsers.overallActiveUserGraphError', returnData);
    });
  }

  private adjustActiveData(activeData: any, filter: ITimespan, returnData: IActiveUserWrapper): IActiveUserWrapper {
    let emptyGraph: boolean = true;
    let graphItem: IActiveUserData = {
      date: '',
      totalRegisteredUsers: 0,
      activeUsers: 0,
      percentage: 0,
      balloon: true,
    };
    let returnGraph: Array<IActiveUserData> = this.CommonReportService.getReturnGraph(filter, activeData[(activeData.length - 1)].date, graphItem);

    _.forEach(activeData, (item: any): void => {
      let date: string = this.CommonReportService.getModifiedDate(item.date, filter);
      let details: any = _.get(item, 'details');

      if (details) {
        let activeUsers: number = _.toInteger(details.activeUsers);
        let totalRegisteredUsers: number = _.toInteger(details.totalRegisteredUsers);

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
  public getMostActiveUserData(filter: ITimespan): ng.IPromise<Array<IActiveTableBase>> {
    // cancel any currently running jobs
    if (this.mostActiveDeferred) {
      this.mostActiveDeferred.resolve(this.ReportConstants.ABORT);
    }
    this.mostActiveDeferred = this.$q.defer();

    let deferred: ng.IDeferred<Array<IActiveTableBase>> = this.$q.defer();
    let returnArray: Array<IActiveTableBase> = [];
    let options: ITypeQuery = this.CommonReportService.getTypeOptions(filter, 'mostActive');
    this.CommonReportService.getCustomerAltReportByType(options, this.mostActiveDeferred).then((response: any): void => {
      let responseData: any = _.get(response, 'data.data');
      if (responseData) {
        _.forEach(responseData, (item: any): void => {
          let details: any = _.get(item, 'details', undefined);
          if (details) {
            returnArray.push({
              numCalls: _.toInteger(details.sparkCalls) + _.toInteger(item.details.sparkUcCalls),
              totalActivity: _.toInteger(details.totalActivity),
              sparkMessages: _.toInteger(details.sparkMessages),
              userName: details.userName,
            });
          }
        });
      }
      deferred.resolve(returnArray);
    }).catch((error: any): void => {
      deferred.reject(this.CommonReportService.returnErrorCheck(error, 'activeUsers.mostActiveError', returnArray));
    });

    return deferred.promise;
  }

  // Average Room Data
  public getAvgRoomData(filter: ITimespan): ng.IPromise<Array<IAvgRoomData>> {
    // cancel any currently running jobs
    if (this.groupDeferred) {
      this.groupDeferred.resolve(this.ReportConstants.ABORT);
    }
    if (this.oneToOneDeferred) {
      this.oneToOneDeferred.resolve(this.ReportConstants.ABORT);
    }
    if (this.avgDeferred) {
      this.avgDeferred.resolve(this.ReportConstants.ABORT);
    }
    this.groupDeferred = this.$q.defer();
    this.oneToOneDeferred = this.$q.defer();
    this.avgDeferred = this.$q.defer();

    let groupOptions: ICustomerIntervalQuery = this.CommonReportService.getCustomerOptions(filter, 'conversations', this.CommonReportService.TIME_CHARTS, true);
    let oneToOneOptions: ICustomerIntervalQuery = this.CommonReportService.getCustomerOptions(filter, 'convOneOnOne', this.CommonReportService.TIME_CHARTS, true);
    let avgOptions: ICustomerIntervalQuery = this.CommonReportService.getCustomerOptions(filter, 'avgConversations', this.CommonReportService.TIME_CHARTS, true);
    let promises: Array<ng.IHttpPromise<any>> = [];

    let groupPromise: ng.IHttpPromise<any> = this.CommonReportService.getCustomerReport(groupOptions, this.groupDeferred).then((response: any): Array<any> => {
      return _.get(response, 'data.data', []);
    }, (error: any): void => {
      return this.CommonReportService.returnErrorCheck(error, 'avgRooms.groupError', []);
    });
    promises.push(groupPromise);

    let oneToOnePromise: ng.IHttpPromise<any> = this.CommonReportService.getCustomerReport(oneToOneOptions, this.oneToOneDeferred).then((response: any): Array<any> => {
      return _.get(response, 'data.data', []);
    }, (error: any): void => {
      return this.CommonReportService.returnErrorCheck(error, 'avgRooms.oneToOneError', []);
    });
    promises.push(oneToOnePromise);

    let avgPromise: ng.IHttpPromise<any> = this.CommonReportService.getCustomerReport(avgOptions, this.avgDeferred).then((response: any): Array<any> => {
      return _.get(response, 'data.data', []);
    }, (error: any): Array<any> => {
      return this.CommonReportService.returnErrorCheck(error, 'avgRooms.avgError', []);
    });
    promises.push(avgPromise);

    return this.$q.all(promises).then((values: Array<any>) => {
      return this.combineAvgRooms(values[0], values[1], values[2], filter);
    }, () => {
      return [];
    });
  }

  private combineAvgRooms(groupData: Array<any>, oneToOneData: Array<any>, avgData: Array<any>, filter: ITimespan): Array<IAvgRoomData> {
    let emptyGraph: boolean = true;
    let graphItem: IAvgRoomData = {
      date: '',
      balloon: true,
      groupRooms: 0,
      oneToOneRooms: 0,
      totalRooms: 0,
      avgRooms: 0,
    };
    let date: string = '';
    if (groupData[0] && oneToOneData[0] && avgData[0]) {
      let groupDate: string = groupData[0].date;
      let oneToOneDate: string = oneToOneData[0].date;
      let avgDate: string = avgData[0].date;
      if (groupData.length > 0) {
        date = groupDate;
        if ((oneToOneData.length > 0) && (groupDate < oneToOneDate)) {
          date = oneToOneDate;
        } else if ((avgData.length > 0) && (groupDate < avgDate)) {
          date = avgDate;
        }
      } else if (oneToOneData.length > 0) {
        date = oneToOneDate;
        if ((avgData.length > 0) && (oneToOneDate < avgDate)) {
          date = avgDate;
        }
      } else if (avgData.length > 0) {
        date = avgDate;
      }
    }

    let returnGraph: Array<IAvgRoomData> = this.CommonReportService.getReturnGraph(filter, date, graphItem);
    _.forEach(groupData, (groupItem: any): void => {
      let modDate: string = this.CommonReportService.getModifiedDate(groupItem.date, filter);

      _.forEach(returnGraph, (returnItem: IAvgRoomData): void => {
        if (returnItem.date === modDate) {
          returnItem.groupRooms = _.toInteger(groupItem.count);
          returnItem.totalRooms += _.toInteger(groupItem.count);
          if (returnItem.groupRooms > 0) {
            emptyGraph = false;
          }
        }
      });
    });

    _.forEach(oneToOneData, (oneToOneItem: any): void => {
      let modDate: string = this.CommonReportService.getModifiedDate(oneToOneItem.date, filter);

      _.forEach(returnGraph, (returnItem: IAvgRoomData): void => {
        if (returnItem.date === modDate) {
          returnItem.oneToOneRooms = _.toInteger(oneToOneItem.count);
          returnItem.totalRooms += _.toInteger(oneToOneItem.count);
          if (returnItem.oneToOneRooms > 0) {
            emptyGraph = false;
          }
        }
      });
    });

    if (!emptyGraph) {
      _.forEach(avgData, (avgItem: any): void => {
        let modDate: string = this.CommonReportService.getModifiedDate(avgItem.date, filter);

        _.forEach(returnGraph, (returnItem: IAvgRoomData): void => {
          if (returnItem.date === modDate) {
            returnItem.avgRooms = parseFloat(avgItem.count).toFixed(this.ReportConstants.FIXED);
          }
        });
      });

      return returnGraph;
    } else {
      return [];
    }
  }

  // Files Shared Data
  public getFilesSharedData(filter: ITimespan): ng.IPromise<Array<IFilesShared>> {
    // cancel any currently running jobs
    if (this.contentSharedDeferred) {
      this.contentSharedDeferred.resolve(this.ReportConstants.ABORT);
    }
    if (this.contentShareSizesDeferred) {
      this.contentShareSizesDeferred.resolve(this.ReportConstants.ABORT);
    }
    this.contentSharedDeferred = this.$q.defer();
    this.contentShareSizesDeferred = this.$q.defer();

    let contentSharedOptions: ICustomerIntervalQuery = this.CommonReportService.getCustomerOptions(filter, 'contentShared', this.CommonReportService.TIME_CHARTS, true);
    let contentShareSizesOptions: ICustomerIntervalQuery = this.CommonReportService.getCustomerOptions(filter, 'contentShareSizes', this.CommonReportService.TIME_CHARTS, true);
    let promises: Array<ng.IHttpPromise<any>> = [];

    let contentSharedPromise: ng.IHttpPromise<any> = this.CommonReportService.getCustomerReport(contentSharedOptions, this.contentSharedDeferred).then((response: any): Array<any> => {
      return _.get(response, 'data.data', []);
    }, (error: any): void => {
      return this.CommonReportService.returnErrorCheck(error, 'filesShared.contentSharedError', []);
    });
    promises.push(contentSharedPromise);

    let contentShareSizesPromise: ng.IHttpPromise<any> = this.CommonReportService.getCustomerReport(contentShareSizesOptions, this.contentShareSizesDeferred).then((response: any): Array<any> => {
      return _.get(response, 'data.data', []);
    }, (error: any): void => {
      return this.CommonReportService.returnErrorCheck(error, 'filesShared.contentShareSizesDataError', []);
    });
    promises.push(contentShareSizesPromise);

    return this.$q.all(promises).then((values: Array<any>): Array<IFilesShared> => {
      return this.combineFilesShared(values[0], values[1], filter);
    }, (): Array<IFilesShared> => {
      return [];
    });
  }

  private combineFilesShared(contentSharedData: Array<any>, contentShareSizesData: Array<any>, filter: ITimespan): Array<IFilesShared> {
    let emptyGraph: boolean = true;
    let graphItem = {
      date: '',
      balloon: true,
      contentShared: 0,
      contentShareSizes: 0,
    };

    let date: string = '';
    if (contentSharedData[0] && contentShareSizesData[0]) {
      let contentSharedDate = contentSharedData[0].date;
      let contentShareSizesDate = contentShareSizesData[0].date;
      if (contentSharedData.length > 0) {
        date = contentSharedDate;
        if ((contentShareSizesData.length > 0) && (contentSharedDate < contentShareSizesDate)) {
          date = contentShareSizesDate;
        }
      } else if (contentShareSizesData.length > 0) {
        date = contentShareSizesDate;
      }
    }

    let returnGraph: Array<IFilesShared> = this.CommonReportService.getReturnGraph(filter, date, graphItem);
    _.forEach(contentSharedData, (contentItem: any): void => {
      let modDate: string = this.CommonReportService.getModifiedDate(contentItem.date, filter);

      _.forEach(returnGraph, (returnItem: IFilesShared): void => {
        if (returnItem.date === modDate) {
          returnItem.contentShared = _.toInteger(contentItem.count);
          if (returnItem.contentShared !== 0) {
            emptyGraph = false;
          }
        }
      });
    });

    if (!emptyGraph) {
      _.forEach(contentShareSizesData, (shareItem: any): void => {
        let modDate: string = this.CommonReportService.getModifiedDate(shareItem.date, filter);

        _.forEach(returnGraph, (returnItem: IFilesShared): void => {
          if (returnItem.date === modDate) {
            returnItem.contentShareSizes = parseFloat(shareItem.count).toFixed(this.ReportConstants.FIXED);
          }
        });
      });

      return returnGraph;
    } else {
      return [];
    }
  }

  // Call Metrics Dat
  public getCallMetricsData(filter: ITimespan): ng.IHttpPromise<IMetricsData> {
    // cancel any currently running jobs
    if (this.metricsDeferred) {
      this.metricsDeferred.resolve(this.ReportConstants.ABORT);
    }
    this.metricsDeferred = this.$q.defer();
    let returnArray: IMetricsData = {
      dataProvider: [{
        callCondition: this.$translate.instant('callMetrics.audioCalls'),
        numCalls: 0,
        percentage: 0,
        color: this.chartColors.colorAttentionBase,
      }, {
        callCondition: this.$translate.instant('callMetrics.videoCalls'),
        numCalls: 0,
        percentage: 0,
        color: this.chartColors.primaryColorBase,
      }],
      displayData: undefined,
      dummy: false,
    };
    let options: ICustomerIntervalQuery = this.CommonReportService.getAltCustomerOptions(filter, 'callMetrics', this.CommonReportService.DETAILED, undefined);

    return this.CommonReportService.getCustomerReport(options, this.metricsDeferred).then((response: any): IMetricsData => {
      let details: any = _.get(response, 'data.data[0].data[0].details');
      if (details) {
        let totalCalls: number = _.toInteger(details.totalCalls);
        if (totalCalls > 0) {
          let audioCalls: number = _.toInteger(details.sparkUcAudioCalls);
          let successfulCalls: number = _.toInteger(details.totalSuccessfulCalls);
          let videoCalls: number = _.toInteger(details.sparkUcVideoCalls) + _.toInteger(details.sparkVideoCalls);
          let totalFailedCalls: number = _.toInteger(details.totalFailedCalls);

          returnArray.dataProvider[0].numCalls = audioCalls;
          returnArray.dataProvider[0].percentage = this.CommonReportService.getPercentage(audioCalls, successfulCalls);
          returnArray.dataProvider[1].numCalls = videoCalls;
          returnArray.dataProvider[1].percentage = this.CommonReportService.getPercentage(videoCalls, successfulCalls);

          returnArray.displayData = {
            totalCalls: totalCalls,
            totalAudioDuration: _.toInteger(details.totalAudioDuration),
            totalFailedCalls: ((totalFailedCalls / totalCalls) * this.ReportConstants.PERCENTAGE_MULTIPLIER).toFixed(this.ReportConstants.FIXED),
          };

        }
      }
      return returnArray;
    }).catch((error: any): IMetricsData => {
      return this.CommonReportService.returnErrorCheck(error, 'callMetrics.customerError', returnArray);
    });
  }

  // Media Quality Data
  public getMediaQualityData(filter: ITimespan): ng.IHttpPromise<Array<IMediaData>> {
    // cancel any currently running jobs
    if (this.mediaDeferred) {
      this.mediaDeferred.resolve(this.ReportConstants.ABORT);
    }
    this.mediaDeferred = this.$q.defer();

    let options: ICustomerIntervalQuery = this.CommonReportService.getCustomerOptions(filter, 'callQuality', this.CommonReportService.DETAILED, undefined);
    return this.CommonReportService.getCustomerReport(options, this.mediaDeferred).then((response: any): Array<IMediaData> => {
      let emptyGraph: boolean = true;
      let data: any = _.get(response, 'data.data[0].data');
      let graphItem: IMediaData = {
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
      let graph: Array<IMediaData> = this.CommonReportService.getReturnGraph(filter, data[data.length - 1].date, graphItem);

      _.forEach(data, (item: any): void => {
        const goodSum: number = _.toInteger(item.details.goodQualityDurationSum);
        const fairSum: number = _.toInteger(item.details.fairQualityDurationSum);
        const poorSum: number = _.toInteger(item.details.poorQualityDurationSum);

        const goodVideoQualityDurationSum: number = _.toInteger(item.details.sparkGoodVideoDurationSum) + _.toInteger(item.details.sparkUcGoodVideoDurationSum);
        const fairVideoQualityDurationSum: number = _.toInteger(item.details.sparkFairVideoDurationSum) + _.toInteger(item.details.sparkUcFairVideoDurationSum);
        const poorVideoQualityDurationSum: number = _.toInteger(item.details.sparkPoorVideoDurationSum) + _.toInteger(item.details.sparkUcPoorVideoDurationSum);

        const goodAudioQualityDurationSum: number = goodSum - goodVideoQualityDurationSum;
        const fairAudioQualityDurationSum: number = fairSum - fairVideoQualityDurationSum;
        const poorAudioQualityDurationSum: number = poorSum - poorVideoQualityDurationSum;

        if (goodSum > 0 || fairSum > 0 || poorSum > 0) {
          let modifiedDate = this.CommonReportService.getModifiedDate(item.date, filter);

          _.forEach(graph, (graphPoint): void => {
            if (graphPoint.date === modifiedDate) {
              graphPoint.totalDurationSum = goodSum + fairSum + poorSum;
              graphPoint.goodQualityDurationSum = goodSum;
              graphPoint.fairQualityDurationSum = fairSum;
              graphPoint.poorQualityDurationSum = poorSum;
              graphPoint.partialSum = fairSum + poorSum;

              graphPoint.totalAudioDurationSum = goodAudioQualityDurationSum + fairAudioQualityDurationSum + poorAudioQualityDurationSum;
              graphPoint.goodAudioQualityDurationSum = goodAudioQualityDurationSum;
              graphPoint.fairAudioQualityDurationSum = fairAudioQualityDurationSum;
              graphPoint.poorAudioQualityDurationSum = poorAudioQualityDurationSum;
              graphPoint.partialAudioSum = fairAudioQualityDurationSum + poorAudioQualityDurationSum;

              graphPoint.totalVideoDurationSum = goodVideoQualityDurationSum + fairVideoQualityDurationSum + poorVideoQualityDurationSum;
              graphPoint.goodVideoQualityDurationSum = goodVideoQualityDurationSum;
              graphPoint.fairVideoQualityDurationSum = fairVideoQualityDurationSum;
              graphPoint.poorVideoQualityDurationSum = poorVideoQualityDurationSum;
              graphPoint.partialVideoSum = fairVideoQualityDurationSum + poorVideoQualityDurationSum;

              emptyGraph = false;
            }
          });
        }
      });
      if (emptyGraph) {
        return [];
      } else {
        return graph;
      }
    }).catch((error): Array<IMediaData> => {
      return this.CommonReportService.returnErrorCheck(error, 'mediaQuality.customerError', []);
    });
  }

  // Registered Endpoints Data
  public getDeviceData(filter: ITimespan): ng.IHttpPromise<IEndpointContainer> {
    // cancel any currently running jobs
    if (this.deviceDeferred) {
      this.deviceDeferred.resolve(this.ReportConstants.ABORT);
    }
    this.deviceDeferred = this.$q.defer();
    let deviceArray: IEndpointContainer = {
      graphData: [{
        deviceType: this.$translate.instant('registeredEndpoints.allDevices'),
        graph: [],
        emptyGraph: true,
        balloon: true,
      }],
      filterArray: [{
        value: 0,
        label: this.$translate.instant('registeredEndpoints.allDevices'),
      }],
    };

    let options: ITypeQuery = this.CommonReportService.getTypeOptions(filter, 'deviceType');
    return this.CommonReportService.getCustomerReportByType(options, this.deviceDeferred).then((response: any): IEndpointContainer => {
      return this.analyzeDeviceData(response, filter, deviceArray);
    }).catch((error: any): IEndpointContainer => {
      return this.CommonReportService.returnErrorCheck(error, 'registeredEndpoints.customerError', deviceArray);
    });
  }

  private analyzeDeviceData(response: any, filter: ITimespan, deviceArray: IEndpointContainer): IEndpointContainer {
    let data: Array<any> = _.get(response, 'data.data', []);
    let graphItem: IEndpointData = {
      date: '',
      totalRegisteredDevices: 0,
    };
    let date: string = '';
    let responseLength: number = 0;

    _.forEach(data, (item: any): void => {
      let details: any = _.get(item, 'details');
      if (details && responseLength < details.length) {
        responseLength = details.length;
        date = details[responseLength - 1].recordTime;
      }
    });
    deviceArray.graphData[0].graph = this.CommonReportService.getReturnGraph(filter, date, graphItem);

    _.forEach(data, (item: any, index: number): void => {
      deviceArray.filterArray.push({
        value: (index + 1),
        label: item.deviceType,
      });
      let tempGraph: IEndpointWrapper = {
        deviceType: item.deviceType,
        graph: this.CommonReportService.getReturnGraph(filter, date, graphItem),
        emptyGraph: true,
        balloon: true,
      };

      _.forEach(item.details, (detail: any): void => {
        let registeredDevices: number = _.toInteger(detail.totalRegisteredDevices);
        let modifiedDate: string = this.CommonReportService.getModifiedDate(detail.recordTime, filter);

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

angular.module('Core')
  .service('SparkReportService', SparkReportService);
