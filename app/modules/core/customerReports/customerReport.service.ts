import {
  IActiveUserData,
  ICustomerIntervalQuery,
  ITimespan,
  ITypeQuery,
} from '../partnerReports/partnerReportInterfaces';

import {
  IActiveUserWrapper,
  IActiveTableWrapper,
  IAvgRoomData,
  IEndpointContainer,
  IEndpointData,
  IEndpointWrapper,
  IFilesShared,
  IMediaData,
  IMetricsData,
} from './customerReportInterfaces';

class CustomerReportService {
  // Promise Tracking
  private activePromise: ng.IDeferred<any>;
  private mostActivePromise: ng.IDeferred<any>;
  private groupCancelPromise: ng.IDeferred<any>;
  private oneToOneCancelPromise: ng.IDeferred<any>;
  private avgCancelPromise: ng.IDeferred<any>;
  private contentSharedCancelPromise: ng.IDeferred<any>;
  private contentShareSizesCancelPromise: ng.IDeferred<any>;
  private metricsCancelPromise: ng.IDeferred<any>;
  private mediaCancelPromise: ng.IDeferred<any>;
  private deviceCancelPromise: ng.IDeferred<any>;

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private $q: ng.IQService,
    private chartColors,
    private CommonReportService,
    private ReportConstants,
  ) {}

  // Active User Data
  public getActiveUserData(filter: ITimespan, linegraph: boolean): ng.IHttpPromise<IActiveUserWrapper> {
    // cancel any currently running jobs
    if (this.activePromise) {
      this.activePromise.resolve(this.ReportConstants.ABORT);
    }
    this.activePromise = this.$q.defer();

    let returnData: IActiveUserWrapper = {
      graphData: [],
      isActiveUsers: false,
    };

    if (linegraph) {
      let lineOptions: ITypeQuery = this.CommonReportService.getLineTypeOptions(filter, 'activeUsers');
      return this.CommonReportService.getCustomerAltReportByType(lineOptions, this.activePromise).then((response: any): IActiveUserWrapper => {
        let data = _.get(response, 'data.data');
        if (data) {
          return this.adjustActiveData(data, filter, returnData, linegraph);
        } else {
          return returnData;
        }
      }).catch((error: any): IActiveUserWrapper => {
        return this.CommonReportService.returnErrorCheck(error, 'activeUsers.overallActiveUserGraphError', returnData);
      });

    } else {
      let options: ICustomerIntervalQuery = this.CommonReportService.getCustomerOptions(filter, 'activeUsers', this.CommonReportService.DETAILED, undefined);
      return this.CommonReportService.getCustomerReport(options, this.activePromise).then((response: any): IActiveUserWrapper => {
        let data = _.get(response, 'data.data[0].data');
        if (data) {
          return this.adjustActiveData(data, filter, returnData, linegraph);
        } else {
          return returnData;
        }
      }).catch((error: any): IActiveUserWrapper => {
        return this.CommonReportService.returnErrorCheck(error, 'activeUsers.overallActiveUserGraphError', returnData);
      });
    }
  }

  private adjustActiveData(activeData: any, filter: ITimespan, returnData: IActiveUserWrapper, linegraph: boolean): IActiveUserWrapper {
    let emptyGraph: boolean = true;
    let graphItem: IActiveUserData = {
      date: '',
      totalRegisteredUsers: 0,
      activeUsers: 0,
      percentage: 0,
      balloon: true,
    };
    let returnGraph: Array<IActiveUserData>;
    if (linegraph) {
      returnGraph = this.CommonReportService.getReturnLineGraph(filter, graphItem);
    } else {
      returnGraph = this.CommonReportService.getReturnGraph(filter, activeData[(activeData.length - 1)].date, graphItem);
    }

    _.forEach(activeData, (item: any): void => {
      let date: string = this.CommonReportService.getModifiedLineDate(item.date);
      let details: any;
      if (linegraph) {
        details = _.get(item, 'details[0]');
      } else {
        details = _.get(item, 'details');
      }

      if (details) {
        let activeUsers: number;
        let totalRegisteredUsers: number;
        if (linegraph) {
          activeUsers = this.CommonReportService.getInt(details.combinedActiveUsers);
          totalRegisteredUsers = this.CommonReportService.getInt(details.totalSparkEntitled);
        } else {
          activeUsers = this.CommonReportService.getInt(details.activeUsers);
          totalRegisteredUsers = this.CommonReportService.getInt(details.totalRegisteredUsers);
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

    if (!emptyGraph && linegraph) {
      returnData.graphData = this.trimEmptyDataSets(returnGraph);
      returnData.isActiveUsers = true;
    } else if (!emptyGraph) {
      returnData.graphData = returnGraph;
      returnData.isActiveUsers = true;
    }
    return returnData;
  }

  private trimEmptyDataSets(graph: Array<IActiveUserData>): Array<IActiveUserData> {
    if (graph.length <= this.ReportConstants.THIRTEEN_WEEKS) {
      return graph;
    } else {
      let returnGraph: Array<IActiveUserData> = [];
      let emptyGraph: boolean = true;
      _.forEach(graph, (item: any, index: number) => {
        if (index !== 0 && emptyGraph) {
          let totalUsers = _.get(item, 'totalRegisteredUsers');
          let nextTotalUsers = _.get(graph[index + 1], 'totalRegisteredUsers');
          if (totalUsers > 0 || nextTotalUsers > 0 || index >= (graph.length - this.ReportConstants.THIRTEEN_WEEKS)) {
            emptyGraph = false;
          }
        }

        if (!emptyGraph) {
          returnGraph.push(item);
        }
      });
      return returnGraph;
    }
  }

  // Most Active User Data
  public getMostActiveUserData(filter: ITimespan): ng.IHttpPromise<IActiveTableWrapper> {
    // cancel any currently running jobs
    if (this.mostActivePromise) {
      this.mostActivePromise.resolve(this.ReportConstants.ABORT);
    }
    this.mostActivePromise = this.$q.defer();
    let returnObject: IActiveTableWrapper = {
      tableData: [],
      error: false,
    };

    let options: ITypeQuery = this.CommonReportService.getTypeOptions(filter, 'mostActive');
    return this.CommonReportService.getCustomerAltReportByType(options, this.mostActivePromise).then((response: any): IActiveTableWrapper => {
      let responseData: any = _.get(response, 'data.data');
      if (responseData) {
        _.forEach(responseData, (item: any): void => {
          let details: any = _.get(item, 'details');
          if (details) {
            returnObject.tableData.push({
              numCalls: this.CommonReportService.getInt(details.sparkCalls) + this.CommonReportService.getInt(item.details.sparkUcCalls),
              totalActivity: this.CommonReportService.getInt(details.totalActivity),
              sparkMessages: this.CommonReportService.getInt(details.sparkMessages),
              userName: details.userName,
            });
          }
        });
      }
      return returnObject;
    }).catch((error: any): IActiveTableWrapper => {
      returnObject.error = true;
      return this.CommonReportService.returnErrorCheck(error, 'activeUsers.mostActiveError', returnObject);
    });
  }

  // Average Room Data
  public getAvgRoomData(filter: ITimespan): ng.IPromise<Array<IAvgRoomData>> {
    // cancel any currently running jobs
    if (this.groupCancelPromise) {
      this.groupCancelPromise.resolve(this.ReportConstants.ABORT);
    }
    if (this.oneToOneCancelPromise) {
      this.oneToOneCancelPromise.resolve(this.ReportConstants.ABORT);
    }
    if (this.avgCancelPromise) {
      this.avgCancelPromise.resolve(this.ReportConstants.ABORT);
    }
    this.groupCancelPromise = this.$q.defer();
    this.oneToOneCancelPromise = this.$q.defer();
    this.avgCancelPromise = this.$q.defer();

    let groupOptions: ICustomerIntervalQuery = this.CommonReportService.getCustomerOptions(filter, 'conversations', this.CommonReportService.TIME_CHARTS, true);
    let oneToOneOptions: ICustomerIntervalQuery = this.CommonReportService.getCustomerOptions(filter, 'convOneOnOne', this.CommonReportService.TIME_CHARTS, true);
    let avgOptions: ICustomerIntervalQuery = this.CommonReportService.getCustomerOptions(filter, 'avgConversations', this.CommonReportService.TIME_CHARTS, true);
    let promises: Array<ng.IHttpPromise<any>> = [];

    let groupPromise = this.CommonReportService.getCustomerReport(groupOptions, this.groupCancelPromise).then((response: any): Array<any> => {
      return _.get(response, 'data.data', []);
    }).catch((error: any): void => {
      return this.CommonReportService.returnErrorCheck(error, 'avgRooms.groupError', []);
    });
    promises.push(groupPromise);

    let oneToOnePromise = this.CommonReportService.getCustomerReport(oneToOneOptions, this.oneToOneCancelPromise).then((response: any): Array<any> => {
      return _.get(response, 'data.data', []);
    }).catch((error: any): void => {
      return this.CommonReportService.returnErrorCheck(error, 'avgRooms.oneToOneError', []);
    });
    promises.push(oneToOnePromise);

    let avgPromise = this.CommonReportService.getCustomerReport(avgOptions, this.avgCancelPromise).then((response: any): Array<any> => {
      return _.get(response, 'data.data', []);
    }).catch((error: any): Array<any> => {
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
          returnItem.groupRooms = this.CommonReportService.getInt(groupItem.count);
          returnItem.totalRooms += this.CommonReportService.getInt(groupItem.count);
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
          returnItem.oneToOneRooms = this.CommonReportService.getInt(oneToOneItem.count);
          returnItem.totalRooms += this.CommonReportService.getInt(oneToOneItem.count);
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
    if (this.contentSharedCancelPromise) {
      this.contentSharedCancelPromise.resolve(this.ReportConstants.ABORT);
    }
    if (this.contentShareSizesCancelPromise) {
      this.contentShareSizesCancelPromise.resolve(this.ReportConstants.ABORT);
    }
    this.contentSharedCancelPromise = this.$q.defer();
    this.contentShareSizesCancelPromise = this.$q.defer();

    let contentSharedOptions: ICustomerIntervalQuery = this.CommonReportService.getCustomerOptions(filter, 'contentShared', this.CommonReportService.TIME_CHARTS, true);
    let contentShareSizesOptions: ICustomerIntervalQuery = this.CommonReportService.getCustomerOptions(filter, 'contentShareSizes', this.CommonReportService.TIME_CHARTS, true);
    let promises: Array<ng.IHttpPromise<any>> = [];

    let contentSharedPromise = this.CommonReportService.getCustomerReport(contentSharedOptions, this.contentSharedCancelPromise).then((response: any): Array<any> => {
      return _.get(response, 'data.data', []);
    }).catch((error: any): void => {
      return this.CommonReportService.returnErrorCheck(error, 'filesShared.contentSharedError', []);
    });
    promises.push(contentSharedPromise);

    let contentShareSizesPromise = this.CommonReportService.getCustomerReport(contentShareSizesOptions, this.contentShareSizesCancelPromise).then((response: any): Array<any> => {
      return _.get(response, 'data.data', []);
    }).catch((error: any): void => {
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
          returnItem.contentShared = this.CommonReportService.getInt(contentItem.count);
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
    if (this.metricsCancelPromise) {
      this.metricsCancelPromise.resolve(this.ReportConstants.ABORT);
    }
    this.metricsCancelPromise = this.$q.defer();
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

    return this.CommonReportService.getCustomerReport(options, this.metricsCancelPromise).then((response: any): IMetricsData => {
      let details: any = _.get(response, 'data.data[0].data[0].details');
      if (details) {
        let totalCalls: number = this.CommonReportService.getInt(details.totalCalls);
        if (totalCalls > 0) {
          let audioCalls: number = this.CommonReportService.getInt(details.sparkUcAudioCalls);
          let successfulCalls: number = this.CommonReportService.getInt(details.totalSuccessfulCalls);
          let videoCalls: number = this.CommonReportService.getInt(details.sparkUcVideoCalls) + this.CommonReportService.getInt(details.sparkVideoCalls);
          let totalFailedCalls: number = this.CommonReportService.getInt(details.totalFailedCalls);

          returnArray.dataProvider[0].numCalls = audioCalls;
          returnArray.dataProvider[0].percentage = this.CommonReportService.getPercentage(audioCalls, successfulCalls);
          returnArray.dataProvider[1].numCalls = videoCalls;
          returnArray.dataProvider[1].percentage = this.CommonReportService.getPercentage(videoCalls, successfulCalls);

          returnArray.displayData = {
            totalCalls: totalCalls,
            totalAudioDuration: this.CommonReportService.getInt(details.totalAudioDuration),
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
    if (this.mediaCancelPromise) {
      this.metricsCancelPromise.resolve(this.ReportConstants.ABORT);
    }
    this.mediaCancelPromise = this.$q.defer();

    let options: ICustomerIntervalQuery = this.CommonReportService.getCustomerOptions(filter, 'callQuality', this.CommonReportService.DETAILED, undefined);
    return this.CommonReportService.getCustomerReport(options, this.mediaCancelPromise).then((response: any): Array<IMediaData> => {
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
        const goodSum: number = this.CommonReportService.getInt(item.details.goodQualityDurationSum);
        const fairSum: number = this.CommonReportService.getInt(item.details.fairQualityDurationSum);
        const poorSum: number = this.CommonReportService.getInt(item.details.poorQualityDurationSum);

        const goodVideoQualityDurationSum: number = this.CommonReportService.getInt(item.details.sparkGoodVideoDurationSum) + this.CommonReportService.getInt(item.details.sparkUcGoodVideoDurationSum);
        const fairVideoQualityDurationSum: number = this.CommonReportService.getInt(item.details.sparkFairVideoDurationSum) + this.CommonReportService.getInt(item.details.sparkUcFairVideoDurationSum);
        const poorVideoQualityDurationSum: number = this.CommonReportService.getInt(item.details.sparkPoorVideoDurationSum) + this.CommonReportService.getInt(item.details.sparkUcPoorVideoDurationSum);

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
  public getDeviceData(filter: ITimespan): ng.IHttpPromise<any> {
    // cancel any currently running jobs
    if (this.deviceCancelPromise) {
      this.deviceCancelPromise.resolve(this.ReportConstants.ABORT);
    }
    this.deviceCancelPromise = this.$q.defer();
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
    return this.CommonReportService.getCustomerReportByType(options, this.deviceCancelPromise).then((response: any): IEndpointContainer => {
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
        let registeredDevices: number = this.CommonReportService.getInt(detail.totalRegisteredDevices);
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
  .service('CustomerReportService', CustomerReportService);
