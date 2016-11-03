import {
  IActiveUserData,
  ITimespan,
} from '../partnerReports/partnerReportInterfaces';

import {
  IAvgRoomData,
  IEndpointData,
  IEndpointWrapper,
  IFilesShared,
  IMediaData,
  IMetricsData,
} from './customerReportInterfaces';

interface ICommonData {
  date: string;
  count: number;
}

class DummyCustomerReportService {
  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private chartColors,
    private ReportConstants,
  ) {}

  private static getCommonData(filter: ITimespan, index: number, constants: any): ICommonData {
    let count = constants.DAYS - index;
    let date = moment().subtract(index, constants.DAY).format(constants.DAY_FORMAT);
    if (filter.value === 1) {
      count = constants.WEEKS - index;
      date = moment().startOf(constants.WEEK).subtract(1 + (index * 7), constants.DAY).format(constants.DAY_FORMAT);
    } else if (filter.value === 2) {
      count = constants.MONTHS - index;
      date = moment().subtract(index, constants.MONTH).format(constants.MONTH_FORMAT);
    }

    return {
      date: date,
      count: count,
    };
  }

  private getDummyData(filter: ITimespan, callFunction: Function): Array<any> {
    let dummyGraph: Array<any> = [];

    if (filter.value === 0) {
      for (let i = this.ReportConstants.DAYS; i >= 1; i--) {
        dummyGraph.push(callFunction(filter, i, this.ReportConstants));
      }
    } else if (filter.value === 1) {
      for (let x = this.ReportConstants.WEEKS; x >= 0; x--) {
        dummyGraph.push(callFunction(filter, x, this.ReportConstants));
      }
    } else {
      for (let y = this.ReportConstants.MONTHS; y >= 0; y--) {
        dummyGraph.push(callFunction(filter, y, this.ReportConstants));
      }
    }

    return dummyGraph;
  }

  private getPercentage(numberOne: number, numberTwo: number): number {
    return Math.round((numberOne / numberTwo) * 100);
  }

  // should return one set of data for column version and one set for line graph version
  // TODO: remove column version of data after feature toggle is removed
  public dummyActiveUserData(filter: ITimespan, lineGraph: boolean): Array<IActiveUserData> {
    let dummyGraph: Array<IActiveUserData> = [];
    let timespan: number;

    if (filter.value === 0) {
      timespan = this.ReportConstants.DAYS - 1;
      if (lineGraph) {
        timespan = this.ReportConstants.DAYS;
      }
    } else if (filter.value === 1) {
      timespan = this.ReportConstants.WEEKS;
      if (lineGraph) {
        timespan = this.ReportConstants.LINE_WEEKS;
      }
    } else {
      timespan = this.ReportConstants.MONTHS;
      if (lineGraph) {
        timespan = this.ReportConstants.YEAR;
      }
    }
    for (let i = timespan; i >= 0; i--) {
      dummyGraph.push(this.getActiveUserDataPoint(filter, i, lineGraph, timespan - i));
    }

    return dummyGraph;
  }

  private getActiveUserDataPoint(filter: ITimespan, index: number, lineGraph: boolean, count: number): IActiveUserData {
    let date;

    if (lineGraph) {
      if (filter.value === 0) {
        date = moment().subtract(index + 1, this.ReportConstants.DAY).format(this.ReportConstants.DAY_FORMAT);
      } else {
        date = moment().day(-1).subtract(index, this.ReportConstants.WEEK).format(this.ReportConstants.DAY_FORMAT);
      }
    } else {
      if (filter.value === 0) {
        index++;
      }
      let commonData: ICommonData = DummyCustomerReportService.getCommonData(filter, index, this.ReportConstants);
      date = commonData.date;
    }

    let totalRegisteredUsers = 25 + (25 * count);
    let activeUsers = 25 * count;

    return {
      date: date,
      totalRegisteredUsers: totalRegisteredUsers,
      activeUsers: activeUsers,
      percentage: this.getPercentage(activeUsers, totalRegisteredUsers),
      balloon: false,
    };
  }

  public dummyAvgRoomData(filter: ITimespan): Array<IAvgRoomData> {
    return this.getDummyData(filter, this.getAvgRoomDataPoint);
  }

  private getAvgRoomDataPoint(filter: ITimespan, index: number, constants: any): IAvgRoomData {
    let commonData: ICommonData = DummyCustomerReportService.getCommonData(filter, index, constants);

    return {
      date: commonData.date,
      totalRooms: 10 + (10 * commonData.count),
      oneToOneRooms: 10 * commonData.count,
      groupRooms: 0,
      avgRooms: 0,
      balloon: false,
    };
  }

  public dummyFilesSharedData(filter: ITimespan): Array<IFilesShared> {
    return this.getDummyData(filter, this.getFilesSharedDataPoint);
  }

  private getFilesSharedDataPoint(filter: ITimespan, index: number, constants: any): IFilesShared {
    let commonData: ICommonData = DummyCustomerReportService.getCommonData(filter, index, constants);

    return {
      date: commonData.date,
      contentShared: 80 - (10 * commonData.count),
      contentShareSizes: 0,
      balloon: false,
    };
  }

  public dummyMediaData(filter: ITimespan): Array<IMediaData> {
    return this.getDummyData(filter, this.getMediaDataPoint);
  }

  private getMediaDataPoint(filter: ITimespan, index: number, constants: any): IMediaData {
    let commonData: ICommonData = DummyCustomerReportService.getCommonData(filter, index, constants);
    let goodQualityDurationSum = 25 + (15 * commonData.count);
    let fairQualityDurationSum = 15 + (10 * commonData.count);
    let poorQualityDurationSum = 5 + (5 * commonData.count);

    return {
      date: commonData.date,
      totalDurationSum: goodQualityDurationSum + fairQualityDurationSum + poorQualityDurationSum,
      partialSum: fairQualityDurationSum + poorQualityDurationSum,
      goodQualityDurationSum: goodQualityDurationSum,
      fairQualityDurationSum: fairQualityDurationSum,
      poorQualityDurationSum: poorQualityDurationSum,
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
      balloon: false,
    };
  }

  public dummyMetricsData(): IMetricsData {
    return {
      dataProvider: [{
        callCondition: this.$translate.instant('callMetrics.audioCalls'),
        numCalls: 1000,
        percentage: 10,
        color: this.chartColors.dummyGrayLight,
      }, {
        callCondition: this.$translate.instant('callMetrics.videoCalls'),
        numCalls: 9000,
        percentage: 90,
        color: this.chartColors.dummyGray,
      }],
      labelData: {
        numTotalCalls: 0,
        numTotalMinutes: 0,
      },
      dummy: true,
    };
  }

  public dummyDeviceData(filter: ITimespan): Array<IEndpointWrapper> {
    return [{
      deviceType: this.$translate.instant('registeredEndpoints.allDevices'),
      graph: this.getDummyData(filter, this.getDeviceDataPoint),
      balloon: false,
    }];
  }

  private getDeviceDataPoint(filter: ITimespan, index: number, constants: any): IEndpointData {
    let commonData: ICommonData = DummyCustomerReportService.getCommonData(filter, index, constants);

    return {
      date: commonData.date,
      totalRegisteredDevices: 15 + (15 * commonData.count),
    };
  }
}

angular.module('Core')
  .service('DummyCustomerReportService', DummyCustomerReportService);
