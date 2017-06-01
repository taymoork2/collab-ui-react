import {
  IEndpointData,
  IReportsCustomer,
  ITimespan,
} from './partnerReportInterfaces';

describe('Service: Dummy Reports', () => {
  const defaults = getJSONFixture('core/json/partnerReports/commonReportService.json');
  const timeFilter: Array<ITimespan> = _.clone(defaults.timeFilter);
  const customer: IReportsCustomer = {
    value: '6f631c7b-04e5-4dfe-b359-47d5fa9f4837',
    label: 'Test Org One',
    isAllowedToManage: true,
    isSelected: true,
  };

  const dummyData = getJSONFixture('core/json/partnerReports/dummyReportData.json');
  let endpointData: IEndpointData = _.cloneDeep(_.clone(dummyData.endpoints));
  endpointData[0][0].splitClasses = undefined;
  endpointData[0][2].splitClasses = undefined;
  endpointData[0][3].splitClasses = undefined;

  let updateDates = function (data: Array<any>, filter: ITimespan) {
    if (filter.value === 0) {
      for (let i = 6; i >= 0; i--) {
        data[i].date = moment().subtract(7 - i, 'day').format(defaults.dayFormat);
      }
    } else if (filter.value === 1) {
      for (let x = 0; x <= 3; x++) {
        data[x].date = moment().startOf('week').subtract(1 + ((3 - x) * 7), 'day').format(defaults.dayFormat);
      }
    } else {
      for (let y = 0; y <= 2; y++) {
        data[y].date = moment().subtract((2 - y), 'month').format(defaults.monthFormat);
      }
    }
    return data;
  };

  beforeEach(function () {
    this.initModules('Core');
    this.injectDependencies('DummyReportService');
  });

  it('dummyActiveUserData should return the expected responses', function () {
    expect(this.DummyReportService.dummyActiveUserData(timeFilter[0])).toEqual(updateDates(_.clone(dummyData.activeUser.one), timeFilter[0]));
    expect(this.DummyReportService.dummyActiveUserData(timeFilter[1])).toEqual(updateDates(_.clone(dummyData.activeUser.two), timeFilter[1]));
    expect(this.DummyReportService.dummyActiveUserData(timeFilter[2])).toEqual(updateDates(_.clone(dummyData.activeUser.three), timeFilter[2]));
  });

  it('dummyActivePopulationData should return the expected response', function () {
    expect(this.DummyReportService.dummyActivePopulationData(customer)).toEqual(_.clone(dummyData.activeUserPopulation));
  });

  it('dummyMediaQualityData should return the expected responses', function () {
    expect(this.DummyReportService.dummyMediaQualityData(timeFilter[0])).toEqual(updateDates(_.clone(dummyData.mediaQuality.one), timeFilter[0]));
    expect(this.DummyReportService.dummyMediaQualityData(timeFilter[1])).toEqual(updateDates(_.clone(dummyData.mediaQuality.two), timeFilter[1]));
    expect(this.DummyReportService.dummyMediaQualityData(timeFilter[2])).toEqual(updateDates(_.clone(dummyData.mediaQuality.three), timeFilter[2]));
  });

  it('dummyCallMetricsData should return the expected response', function () {
    expect(this.DummyReportService.dummyCallMetricsData()).toEqual(_.clone(dummyData.callMetrics));
  });

  it('dummyEndpointData should return the expected response', function () {
    expect(this.DummyReportService.dummyEndpointData()).toEqual(endpointData);
  });
});
