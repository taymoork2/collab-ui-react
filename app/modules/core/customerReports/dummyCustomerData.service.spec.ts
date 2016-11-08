import {
  ITimespan,
} from '../partnerReports/partnerReportInterfaces';

describe('Controller: Dummy Customer Reports', function () {
  const defaults = getJSONFixture('core/json/partnerReports/commonReportService.json');
  const dummyData = getJSONFixture('core/json/partnerReports/dummyReportData.json');
  const devicesJson = getJSONFixture('core/json/customerReports/devices.json');
  const activeData = getJSONFixture('core/json/customerReports/activeUser.json');
  const mediaData: any = getJSONFixture('core/json/customerReports/mediaQuality.json');
  const metrics = getJSONFixture('core/json/customerReports/callMetrics.json');
  const timeFilter: Array<ITimespan> = _.cloneDeep(defaults.timeFilter);

  let updateLineDates = function (data: any, filter: ITimespan): any {
    if (filter.value === 0) {
      for (let i = 7; i >= 0; i--) {
        data[i].date = moment().subtract(8 - i, defaults.DAY).format(defaults.dayFormat);
      }
    } else if (filter.value === 1) {
      for (let x = 0; x <= 4; x++) {
        data[x].date = moment().day(-1).subtract(4 - x, defaults.WEEK).format(defaults.dayFormat);
      }
    } else {
      for (let z = 0; z <= 52; z++) {
        data[z].date = moment().day(-1).subtract(52 - z, defaults.WEEK).format(defaults.dayFormat);
      }
    }
    return data;
  };

  let updateDates = function (data: any, filter: ITimespan): any {
    if (filter.value === 0) {
      for (let i = 6; i >= 0; i--) {
        data[i].date = moment().subtract(7 - i, defaults.DAY).format(defaults.dayFormat);
      }
    } else if (filter.value === 1) {
      for (let x = 0; x <= 3; x++) {
        data[x].date = moment().startOf(defaults.WEEK).subtract(1 + ((3 - x) * 7), defaults.DAY).format(defaults.dayFormat);
      }
    } else {
      for (let y = 0; y <= 2; y++) {
        data[y].date = moment().subtract((2 - y), defaults.MONTH).format(defaults.monthFormat);
      }
    }
    return data;
  };

  beforeEach(function () {
    this.initModules('Core');
    this.injectDependencies('DummyCustomerReportService');
  });

  it('dummyActiveUserData should return the expected responses', function () {
    let dummyActiveData = _.cloneDeep(dummyData.activeUser);
    expect(this.DummyCustomerReportService.dummyActiveUserData(timeFilter[0], false)).toEqual(updateDates(dummyActiveData.one, timeFilter[0]));
    expect(this.DummyCustomerReportService.dummyActiveUserData(timeFilter[1], false)).toEqual(updateDates(dummyActiveData.two, timeFilter[1]));
    expect(this.DummyCustomerReportService.dummyActiveUserData(timeFilter[2], false)).toEqual(updateDates(dummyActiveData.three, timeFilter[2]));

    let dummyLineData = _.cloneDeep(activeData.dummyData);
    expect(this.DummyCustomerReportService.dummyActiveUserData(timeFilter[0], true)).toEqual(updateLineDates(dummyLineData.one, timeFilter[0]));
    expect(this.DummyCustomerReportService.dummyActiveUserData(timeFilter[1], true)).toEqual(updateLineDates(dummyLineData.two, timeFilter[1]));
    expect(this.DummyCustomerReportService.dummyActiveUserData(timeFilter[2], true)).toEqual(updateLineDates(dummyLineData.three, timeFilter[2]));
  });

  it('dummyAvgRoomData should return the expected responses', function () {
    let dummyAvg = _.cloneDeep(dummyData.avgRooms);
    expect(this.DummyCustomerReportService.dummyAvgRoomData(timeFilter[0])).toEqual(updateDates(dummyAvg.one, timeFilter[0]));
    expect(this.DummyCustomerReportService.dummyAvgRoomData(timeFilter[1])).toEqual(updateDates(dummyAvg.two, timeFilter[1]));
    expect(this.DummyCustomerReportService.dummyAvgRoomData(timeFilter[2])).toEqual(updateDates(dummyAvg.three, timeFilter[2]));
  });

  it('dummyFilesSharedData should return the expected responses', function () {
    let dummyFiles = _.cloneDeep(dummyData.filesShared);
    expect(this.DummyCustomerReportService.dummyFilesSharedData(timeFilter[0])).toEqual(updateDates(dummyFiles.one, timeFilter[0]));
    expect(this.DummyCustomerReportService.dummyFilesSharedData(timeFilter[1])).toEqual(updateDates(dummyFiles.two, timeFilter[1]));
    expect(this.DummyCustomerReportService.dummyFilesSharedData(timeFilter[2])).toEqual(updateDates(dummyFiles.three, timeFilter[2]));
  });

  it('dummyMediaData should return the expected responses', function () {
    let dummyMedia = _.cloneDeep(mediaData.dummyData);
    expect(this.DummyCustomerReportService.dummyMediaData(timeFilter[0])).toEqual(updateDates(dummyMedia.one, timeFilter[0]));
    expect(this.DummyCustomerReportService.dummyMediaData(timeFilter[1])).toEqual(updateDates(dummyMedia.two, timeFilter[1]));
    expect(this.DummyCustomerReportService.dummyMediaData(timeFilter[2])).toEqual(updateDates(dummyMedia.three, timeFilter[2]));
  });

  it('dummyMetricsData should return the expected responses', function () {
    let dummyMetrics = _.cloneDeep(metrics.dummyData);
    dummyMetrics.displayData = undefined;
    expect(this.DummyCustomerReportService.dummyMetricsData()).toEqual(dummyMetrics);
  });

  it('dummyDeviceData should return the expected responses', function () {
    let devicesData = _.cloneDeep(devicesJson.dummyData);
    devicesData.one[0].graph = updateDates(devicesData.one[0].graph, timeFilter[0]);
    devicesData.two[0].graph = updateDates(devicesData.two[0].graph, timeFilter[1]);
    devicesData.three[0].graph = updateDates(devicesData.three[0].graph, timeFilter[2]);

    expect(this.DummyCustomerReportService.dummyDeviceData(timeFilter[0])).toEqual(devicesData.one);
    expect(this.DummyCustomerReportService.dummyDeviceData(timeFilter[1])).toEqual(devicesData.two);
    expect(this.DummyCustomerReportService.dummyDeviceData(timeFilter[2])).toEqual(devicesData.three);
  });
});
