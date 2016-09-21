import {
  IActiveUserData,
  ICallMetricsData,
  IEndpointData,
  IMediaQualityData,
  IPopulationData,
  IReportsCustomer,
  ITimespan,
} from './partnerReportInterfaces';

export class DummyReportService {
  private dayFormat: string = 'MMM DD';
  private monthFormat: string = 'MMMM';
  private loadingCustomer: string;

  // timespan values
  private days = 7;
  private weeks = 3;
  private months = 2;

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private chartColors
  ) {
    this.loadingCustomer = $translate.instant('activeUserPopulation.loadingCustomer');
  }

  private getTimeAndOffset(filter: ITimespan, index) {
    let offset = this.days - index;
    let date: string = moment().subtract(index, 'day').format(this.dayFormat);
    if (filter.value === 1) {
      offset = this.weeks - index;
      date = moment().startOf('week').subtract(1 + (index * 7), 'day').format(this.dayFormat);
    } else if (filter.value === 2) {
      offset = this.months - index;
      date = moment().subtract(index, 'month').format(this.monthFormat);
    }

    return {
      date: date,
      offset: offset,
    };
  }

  public dummyActiveUserData (filter: ITimespan): Array<IActiveUserData> {
    let dummyGraph = [];

    if (filter.value === 0) {
      for (let i = this.days; i >= 1; i--) {
        dummyGraph.push(this.getActiveUserDatapoint(filter, i));
      }
    } else if (filter.value === 1) {
      for (let x = this.weeks; x >= 0; x--) {
        dummyGraph.push(this.getActiveUserDatapoint(filter, x));
      }
    } else {
      for (let y = this.months; y >= 0; y--) {
        dummyGraph.push(this.getActiveUserDatapoint(filter, y));
      }
    }

    return dummyGraph;
  }

  private getActiveUserDatapoint(filter: ITimespan, index): IActiveUserData {
    let timeAndOffset = this.getTimeAndOffset(filter, index);
    let totalRegisteredUsers = 25 + (25 * timeAndOffset.offset);
    let activeUsers = 25 * timeAndOffset.offset;

    return {
      date: timeAndOffset.date,
      totalRegisteredUsers: totalRegisteredUsers,
      activeUsers: activeUsers,
      percentage: Math.round((activeUsers / totalRegisteredUsers) * 100),
      balloon: false,
    };
  }

  public dummyActivePopulationData(customers: Array<IReportsCustomer>): Array<IPopulationData> {
    if (customers && customers.length > 0) {
      let returnArray = [];
      _.forEach(customers, (item, index) => {
        returnArray.push(this.getActivePopulationDatapoint(this.loadingCustomer, index));
      });
      return returnArray;
    } else {
      return [this.getActivePopulationDatapoint(this.loadingCustomer, 0)];
    }
  }

  private getActivePopulationDatapoint(name: string, index): IPopulationData {
    return {
      customerName: name,
      percentage: 85 - (index * 10),
      overallPopulation: 50,
      color: this.chartColors.grayLightFour,
      balloon: false,
      labelColorField: this.chartColors.grayLight,
    };
  }

  public dummyMediaQualityData(filter: ITimespan): Array<IMediaQualityData> {
    let dummyGraph = [];

    if (filter.value === 0) {
      for (let i = this.days; i >= 1; i--) {
        dummyGraph.push(this.getMediaDatapoint(filter, i));
      }
    } else if (filter.value === 1) {
      for (let x = this.weeks; x >= 0; x--) {
        dummyGraph.push(this.getMediaDatapoint(filter, x));
      }
    } else {
      for (let y = this.months; y >= 0; y--) {
        dummyGraph.push(this.getMediaDatapoint(filter, y));
      }
    }

    return dummyGraph;
  }

  private getMediaDatapoint(filter: ITimespan, index): IMediaQualityData {
    let timeAndOffset = this.getTimeAndOffset(filter, index);
    let goodQualityDurationSum = 25 + (15 * timeAndOffset.offset);
    let fairQualityDurationSum = 15 + (10 * timeAndOffset.offset);
    let poorQualityDurationSum = 5 + (5 * timeAndOffset.offset);

    return {
      date: timeAndOffset.date,
      totalDurationSum: goodQualityDurationSum + fairQualityDurationSum + poorQualityDurationSum,
      partialSum: fairQualityDurationSum + poorQualityDurationSum,
      goodQualityDurationSum: goodQualityDurationSum,
      fairQualityDurationSum: fairQualityDurationSum,
      poorQualityDurationSum: poorQualityDurationSum,
      balloon: false,
    };
  }

  public dummyCallMetricsData(): ICallMetricsData {
    return {
      dataProvider: [{
        label: this.$translate.instant('callMetrics.callConditionFail'),
        value: '200',
        color: this.chartColors.grayLightThree,
      }, {
        label: this.$translate.instant('callMetrics.callConditionSuccessful'),
        value: '800',
        color: this.chartColors.grayLightFour,
      }],
      labelData: {
        numTotalCalls: 1000,
        numTotalMinutes: 1800,
      },
      dummy: true,
    };
  }

  public dummyEndpointData(): Array<Array<IEndpointData>> {
    return [[{
      class: 'vertical-center customer-data',
      output: [this.loadingCustomer],
      splitClasses: undefined,
    }, {
      class: 'table-data',
      output: ['0', '0'],
      splitClasses: 'table-half vertical-center horizontal-center',
    }, {
      class: 'vertical-center horizontal-center',
      output: ['0'],
      splitClasses: undefined,
    }, {
      class: 'vertical-center horizontal-center',
      output: ['0'],
      splitClasses: undefined,
    }]];
  }
}

angular.module('Core')
  .service('DummyReportService', DummyReportService);
