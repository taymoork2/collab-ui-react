import { CommonReportService } from '../../partnerReports/commonReportServices/commonReport.service';
import { ReportConstants } from '../../partnerReports/commonReportServices/reportConstants.service';
import { ChartColors } from 'modules/core/config/chartColors';
import {
  IActiveUserData,
  ITimespan,
} from '../../partnerReports/partnerReportInterfaces';

import {
  IAvgRoomData,
  IConversation,
  IEndpointData,
  IEndpointWrapper,
  IFilesShared,
  IMediaData,
  IMetricsData,
} from './sparkReportInterfaces';

interface ICommonData {
  date: string;
  count: number;
}

export class DummySparkDataService {
  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private CommonReportService: CommonReportService,
    private ReportConstants: ReportConstants,
  ) {}

  private static getCommonData(filter: ITimespan, index: number, constants: any): ICommonData {
    let count = constants.DAYS - index;
    let date = moment().subtract(index + 1, constants.DAY).format(constants.DAY_FORMAT);
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

  private getDummyData(filter: ITimespan, callFunction: Function): any[] {
    const dummyGraph: any[] = [];

    if (filter.value === 0) {
      for (let i = this.ReportConstants.DAYS; i >= 0; i--) {
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

  // should return one set of data for column version and one set for line graph version
  // TODO: remove column version of data after feature toggle is removed
  public dummyActiveUserData(filter: ITimespan, lineGraph: boolean): IActiveUserData[] {
    const dummyGraph: IActiveUserData[] = [];
    let timespan: number;

    if (filter.value === this.ReportConstants.WEEK_FILTER.value) {
      timespan = this.ReportConstants.DAYS;
    } else if (filter.value === this.ReportConstants.MONTH_FILTER.value) {
      timespan = this.ReportConstants.WEEKS;
      if (lineGraph) {
        timespan = this.ReportConstants.YEAR;
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
      if (filter.value === this.ReportConstants.WEEK_FILTER.value) {
        date = moment().subtract(index + 1, this.ReportConstants.DAY).format(this.ReportConstants.DAY_FORMAT);
      } else {
        date = moment().day(-1).subtract(index, this.ReportConstants.WEEK).format(this.ReportConstants.DAY_FORMAT);
      }
    } else {
      const commonData: ICommonData = DummySparkDataService.getCommonData(filter, index, this.ReportConstants);
      date = commonData.date;
    }

    const totalRegisteredUsers = 25 + (25 * count);
    const activeUsers = 25 * count;

    return {
      date: date,
      totalRegisteredUsers: totalRegisteredUsers,
      activeUsers: activeUsers,
      percentage: this.CommonReportService.getPercentage(activeUsers, totalRegisteredUsers),
      balloon: false,
    };
  }

  // TODO: remove dummyAvgRoom functions after final switch to new reports
  public dummyAvgRoomData(filter: ITimespan): IAvgRoomData[] {
    return this.getDummyData(filter, this.getAvgRoomDataPoint);
  }

  private getAvgRoomDataPoint(filter: ITimespan, index: number, constants: any): IAvgRoomData {
    const commonData: ICommonData = DummySparkDataService.getCommonData(filter, index, constants);

    return {
      date: commonData.date,
      totalRooms: 10 + (10 * commonData.count),
      oneToOneRooms: 10 * commonData.count,
      groupRooms: 0,
      avgRooms: 0,
      balloon: false,
    };
  }

  // TODO: remove dummyFilesShared functions after final switch to new reports
  public dummyFilesSharedData(filter: ITimespan): IFilesShared[] {
    return this.getDummyData(filter, this.getFilesSharedDataPoint);
  }

  private getFilesSharedDataPoint(filter: ITimespan, index: number, constants: any): IFilesShared {
    const commonData: ICommonData = DummySparkDataService.getCommonData(filter, index, constants);

    return {
      date: commonData.date,
      contentShared: 80 - (10 * commonData.count),
      contentShareSizes: 0,
      balloon: false,
    };
  }

  // dummy conversation data
  public dummyConversationData(filter: ITimespan): IConversation[] {
    const dummyGraph: IConversation[] = [];
    let timespan: number;

    if (filter.value === this.ReportConstants.WEEK_FILTER.value) {
      timespan = this.ReportConstants.DAYS;
    } else {
      timespan = this.ReportConstants.YEAR;
    }

    for (let i = timespan; i >= 0; i--) {
      dummyGraph.push(this.getConversationDataPoint(filter, i, timespan - i));
    }

    return dummyGraph;
  }

  private getConversationDataPoint(filter: ITimespan, index: number, count: number): IConversation {
    let date: string;
    if (filter.value === this.ReportConstants.WEEK_FILTER.value) {
      date = moment().subtract(index + 1, this.ReportConstants.DAY).format(this.ReportConstants.DAY_FORMAT);
    } else {
      date = moment().day(-1).subtract(index, this.ReportConstants.WEEK).format(this.ReportConstants.DAY_FORMAT);
    }

    const newCount: number = 25 * count;
    return {
      date: date,
      balloon: false,
      avgRooms: 0,
      contentShared: newCount,
      contentShareSizes: 0,
      groupRooms: newCount,
      oneToOneRooms: 25 + newCount,
      totalRooms: 25 + (newCount * 2),
    };
  }

  // media data
  public dummyMediaData(filter: ITimespan, linegraph: boolean): IMediaData[] {
    if (linegraph) {
      const dummyGraph: IMediaData[] = [];
      let timespan: number;

      if (filter.value === this.ReportConstants.WEEK_FILTER.value) {
        timespan = this.ReportConstants.DAYS;
      } else {
        timespan = this.ReportConstants.YEAR;
      }

      for (let i = timespan; i >= 0; i--) {
        dummyGraph.push(this.getQualityDataPoint(filter, i, timespan - i));
      }

      return dummyGraph;
    } else {
      return this.getDummyData(filter, this.getMediaDataPoint);
    }
  }

  private getQualityDataPoint(filter: ITimespan, index: number, count: number): IMediaData {
    let date: string;
    if (filter.value === this.ReportConstants.WEEK_FILTER.value) {
      date = moment().subtract(index + 1, this.ReportConstants.DAY).format(this.ReportConstants.DAY_FORMAT);
    } else {
      date = moment().day(-1).subtract(index, this.ReportConstants.WEEK).format(this.ReportConstants.DAY_FORMAT);
    }

    const goodQualityDurationSum = 25 + (15 * count);
    const fairQualityDurationSum = 15 + (10 * count);
    const poorQualityDurationSum = 5 + (5 * count);

    return {
      date: date,
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

  // TODO: Delete when the feature toggle is removed
  private getMediaDataPoint(filter: ITimespan, index: number, constants: any): IMediaData {
    const commonData: ICommonData = DummySparkDataService.getCommonData(filter, index, constants);
    const goodQualityDurationSum = 25 + (15 * commonData.count);
    const fairQualityDurationSum = 15 + (10 * commonData.count);
    const poorQualityDurationSum = 5 + (5 * commonData.count);

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
        color: ChartColors.grayLightThree,
      }, {
        callCondition: this.$translate.instant('callMetrics.videoCalls'),
        numCalls: 9000,
        percentage: 90,
        color: ChartColors.grayLightTwo,
      }],
      displayData: undefined,
      dummy: true,
    };
  }

  public dummyDeviceData(filter: ITimespan, linegraph: boolean): IEndpointWrapper[] {
    if (linegraph) {
      const dummyGraph: IEndpointData[] = [];
      let timespan: number;

      if (filter.value === this.ReportConstants.WEEK_FILTER.value) {
        timespan = this.ReportConstants.DAYS;
      } else {
        timespan = this.ReportConstants.YEAR;
      }

      for (let i = timespan; i >= 0; i--) {
        dummyGraph.push(this.getDeviceData(filter, i, timespan - i));
      }

      return [{
        deviceType: this.$translate.instant('registeredEndpoints.allDevices'),
        graph: dummyGraph,
        balloon: false,
        emptyGraph: false,
      }];
    } else {
      return [{
        deviceType: this.$translate.instant('registeredEndpoints.allDevices'),
        graph: this.getDummyData(filter, this.getDeviceDataPoint),
        balloon: false,
        emptyGraph: false,
      }];
    }
  }

  private getDeviceDataPoint(filter: ITimespan, index: number, constants: any): IEndpointData {
    const commonData: ICommonData = DummySparkDataService.getCommonData(filter, index, constants);

    return {
      date: commonData.date,
      totalRegisteredDevices: 15 + (15 * commonData.count),
    };
  }

  private getDeviceData(filter: ITimespan, index: number, count: number): IEndpointData {
    let date: string;
    if (filter.value === this.ReportConstants.WEEK_FILTER.value) {
      date = moment().subtract(index + 1, this.ReportConstants.DAY).format(this.ReportConstants.DAY_FORMAT);
    } else {
      date = moment().day(-1).subtract(index, this.ReportConstants.WEEK).format(this.ReportConstants.DAY_FORMAT);
    }

    return {
      date: date,
      totalRegisteredDevices: 15 + (15 * count),
    };
  }
}
