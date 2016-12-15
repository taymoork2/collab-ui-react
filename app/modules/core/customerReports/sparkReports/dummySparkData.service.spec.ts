import {
  ITimespan,
} from '../../partnerReports/partnerReportInterfaces';

describe('Controller: Dummy Customer Reports', function () {
  let defaults: any = getJSONFixture('core/json/partnerReports/commonReportService.json');
  let dummyData: any = getJSONFixture('core/json/partnerReports/dummyReportData.json');
  let devicesJson: any = getJSONFixture('core/json/customerReports/devices.json');
  let activeData: any = getJSONFixture('core/json/customerReports/activeUser.json');
  let conversationData: any = getJSONFixture('core/json/customerReports/conversation.json');
  let mediaData: any = getJSONFixture('core/json/customerReports/mediaQuality.json');
  let metrics: any = getJSONFixture('core/json/customerReports/callMetrics.json');

  let updateLineDates: any = function (data: any, filter: ITimespan): any {
    if (filter.value === 0) {
      for (let i = 7; i >= 0; i--) {
        data[i].date = moment().subtract(8 - i, defaults.DAY).format(defaults.dayFormat);
      }
    } else {
      for (let z = 0; z <= 52; z++) {
        data[z].date = moment().day(-1).subtract(52 - z, defaults.WEEK).format(defaults.dayFormat);
      }
    }
    return data;
  };

  let updateDates: any = function (data: any, filter: ITimespan): any {
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

  afterAll(function () {
    defaults = dummyData = devicesJson = activeData = conversationData = mediaData = metrics = updateLineDates = updateDates = undefined;
  });

  beforeEach(function () {
    this.initModules('Core');
    this.injectDependencies('DummySparkDataService');
  });

  it('dummyActiveUserData should return the expected responses', function () {
    let dummyActiveData = _.cloneDeep(dummyData.activeUser);
    expect(this.DummySparkDataService.dummyActiveUserData(defaults.timeFilter[0], false)).toEqual(updateDates(dummyActiveData.one, defaults.timeFilter[0]));
    expect(this.DummySparkDataService.dummyActiveUserData(defaults.timeFilter[1], false)).toEqual(updateDates(dummyActiveData.two, defaults.timeFilter[1]));
    expect(this.DummySparkDataService.dummyActiveUserData(defaults.timeFilter[2], false)).toEqual(updateDates(dummyActiveData.three, defaults.timeFilter[2]));

    let dummyLineData = _.cloneDeep(activeData.dummyData);
    expect(this.DummySparkDataService.dummyActiveUserData(defaults.timeFilter[0], true)).toEqual(updateLineDates(dummyLineData.one, defaults.timeFilter[0]));
    expect(this.DummySparkDataService.dummyActiveUserData(defaults.timeFilter[1], true)).toEqual(updateLineDates(dummyLineData.two, defaults.timeFilter[1]));
  });

  it('dummyConversationData should return the expected responses', function () {
    let dummyData = _.cloneDeep(conversationData.dummyData);
    expect(this.DummySparkDataService.dummyConversationData(defaults.timeFilter[0])).toEqual(updateLineDates(dummyData.one, defaults.timeFilter[0]));
    expect(this.DummySparkDataService.dummyConversationData(defaults.timeFilter[1])).toEqual(updateLineDates(dummyData.two, defaults.timeFilter[1]));
  });

  it('dummyAvgRoomData should return the expected responses', function () {
    let dummyAvg = _.cloneDeep(dummyData.avgRooms);
    expect(this.DummySparkDataService.dummyAvgRoomData(defaults.timeFilter[0])).toEqual(updateDates(dummyAvg.one, defaults.timeFilter[0]));
    expect(this.DummySparkDataService.dummyAvgRoomData(defaults.timeFilter[1])).toEqual(updateDates(dummyAvg.two, defaults.timeFilter[1]));
    expect(this.DummySparkDataService.dummyAvgRoomData(defaults.timeFilter[2])).toEqual(updateDates(dummyAvg.three, defaults.timeFilter[2]));
  });

  it('dummyFilesSharedData should return the expected responses', function () {
    let dummyFiles = _.cloneDeep(dummyData.filesShared);
    expect(this.DummySparkDataService.dummyFilesSharedData(defaults.timeFilter[0])).toEqual(updateDates(dummyFiles.one, defaults.timeFilter[0]));
    expect(this.DummySparkDataService.dummyFilesSharedData(defaults.timeFilter[1])).toEqual(updateDates(dummyFiles.two, defaults.timeFilter[1]));
    expect(this.DummySparkDataService.dummyFilesSharedData(defaults.timeFilter[2])).toEqual(updateDates(dummyFiles.three, defaults.timeFilter[2]));
  });

  it('dummyMediaData should return the expected responses', function () {
    let dummyMedia = _.cloneDeep(mediaData.dummyData);
    expect(this.DummySparkDataService.dummyMediaData(defaults.timeFilter[0], false)).toEqual(updateDates(dummyMedia.one, defaults.timeFilter[0]));
    expect(this.DummySparkDataService.dummyMediaData(defaults.timeFilter[1], false)).toEqual(updateDates(dummyMedia.two, defaults.timeFilter[1]));
    expect(this.DummySparkDataService.dummyMediaData(defaults.timeFilter[2], false)).toEqual(updateDates(dummyMedia.three, defaults.timeFilter[2]));

    expect(this.DummySparkDataService.dummyMediaData(defaults.timeFilter[0], true)).toEqual(updateLineDates(dummyMedia.four, defaults.timeFilter[0]));
    expect(this.DummySparkDataService.dummyMediaData(defaults.timeFilter[1], true)).toEqual(updateLineDates(dummyMedia.five, defaults.timeFilter[1]));
  });

  it('dummyMetricsData should return the expected responses', function () {
    let dummyMetrics = _.cloneDeep(metrics.dummyData);
    dummyMetrics.displayData = undefined;
    expect(this.DummySparkDataService.dummyMetricsData()).toEqual(dummyMetrics);
  });

  it('dummyDeviceData should return the expected responses', function () {
    let devicesData = _.cloneDeep(devicesJson.dummyData);
    devicesData.one[0].graph = updateDates(devicesData.one[0].graph, defaults.timeFilter[0]);
    devicesData.two[0].graph = updateDates(devicesData.two[0].graph, defaults.timeFilter[1]);
    devicesData.three[0].graph = updateDates(devicesData.three[0].graph, defaults.timeFilter[2]);

    expect(this.DummySparkDataService.dummyDeviceData(defaults.timeFilter[0])).toEqual(devicesData.one);
    expect(this.DummySparkDataService.dummyDeviceData(defaults.timeFilter[1])).toEqual(devicesData.two);
    expect(this.DummySparkDataService.dummyDeviceData(defaults.timeFilter[2])).toEqual(devicesData.three);
  });
});
