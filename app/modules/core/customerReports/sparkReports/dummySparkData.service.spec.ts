import sparkReports from './index';
import { ITimespan } from '../../partnerReports/partnerReportInterfaces';
import { IEndpointWrapper } from './sparkReportInterfaces';

describe('Controller: Dummy Customer Reports', function () {
  beforeEach(function () {
    this.initModules(sparkReports);
    this.injectDependencies('DummySparkDataService');

    this.defaults = getJSONFixture('core/json/partnerReports/commonReportService.json');
    this.dummyData = getJSONFixture('core/json/partnerReports/dummyReportData.json');
    this.devicesJson = getJSONFixture('core/json/customerReports/devices.json');
    this.activeData = getJSONFixture('core/json/customerReports/activeUser.json');
    this.conversationData = getJSONFixture('core/json/customerReports/conversation.json');
    this.mediaData = getJSONFixture('core/json/customerReports/mediaQuality.json');
    this.metrics = getJSONFixture('core/json/customerReports/callMetrics.json');

    this.updateLineDates = (data: any, filter: ITimespan): any => {
      if (filter.value === 0) {
        for (let i = 6; i >= 0; i--) {
          data[i].date = moment().subtract(7 - i, this.defaults.DAY).format(this.defaults.dayFormat);
        }
      } else {
        for (let z = 0; z <= 51; z++) {
          data[z].date = moment().day(-1).subtract(51 - z, this.defaults.WEEK).format(this.defaults.dayFormat);
        }
      }
      return data;
    };

    this.updateDates = (data: any, filter: ITimespan): any => {
      if (filter.value === 0) {
        for (let i = 6; i >= 0; i--) {
          data[i].date = moment().subtract(7 - i, this.defaults.DAY).format(this.defaults.dayFormat);
        }
      } else if (filter.value === 1) {
        for (let x = 0; x <= 3; x++) {
          data[x].date = moment().startOf(this.defaults.WEEK).subtract(1 + ((3 - x) * 7), this.defaults.DAY).format(this.defaults.dayFormat);
        }
      } else {
        for (let y = 0; y <= 2; y++) {
          data[y].date = moment().subtract((2 - y), this.defaults.MONTH).format(this.defaults.monthFormat);
        }
      }
      return data;
    };
  });

  it('dummyActiveUserData should return the expected responses', function () {
    let dummyActiveData = _.cloneDeep(this.dummyData.activeUser);
    expect(this.DummySparkDataService.dummyActiveUserData(this.defaults.timeFilter[0], false)).toEqual(this.updateDates(dummyActiveData.one, this.defaults.timeFilter[0]));
    expect(this.DummySparkDataService.dummyActiveUserData(this.defaults.timeFilter[1], false)).toEqual(this.updateDates(dummyActiveData.two, this.defaults.timeFilter[1]));
    expect(this.DummySparkDataService.dummyActiveUserData(this.defaults.timeFilter[2], false)).toEqual(this.updateDates(dummyActiveData.three, this.defaults.timeFilter[2]));

    let dummyLineData = _.cloneDeep(this.activeData.dummyData);
    expect(this.DummySparkDataService.dummyActiveUserData(this.defaults.timeFilter[0], true)).toEqual(this.updateLineDates(dummyLineData.one, this.defaults.timeFilter[0]));
    expect(this.DummySparkDataService.dummyActiveUserData(this.defaults.timeFilter[1], true)).toEqual(this.updateLineDates(dummyLineData.two, this.defaults.timeFilter[1]));
  });

  it('dummyConversationData should return the expected responses', function () {
    let dummyData = _.cloneDeep(this.conversationData.dummyData);
    expect(this.DummySparkDataService.dummyConversationData(this.defaults.timeFilter[0])).toEqual(this.updateLineDates(dummyData.one, this.defaults.timeFilter[0]));
    expect(this.DummySparkDataService.dummyConversationData(this.defaults.timeFilter[1])).toEqual(this.updateLineDates(dummyData.two, this.defaults.timeFilter[1]));
  });

  it('dummyAvgRoomData should return the expected responses', function () {
    const dummyAvg = _.cloneDeep(this.dummyData.avgRooms);
    expect(this.DummySparkDataService.dummyAvgRoomData(this.defaults.timeFilter[0])).toEqual(this.updateDates(dummyAvg.one, this.defaults.timeFilter[0]));
    expect(this.DummySparkDataService.dummyAvgRoomData(this.defaults.timeFilter[1])).toEqual(this.updateDates(dummyAvg.two, this.defaults.timeFilter[1]));
    expect(this.DummySparkDataService.dummyAvgRoomData(this.defaults.timeFilter[2])).toEqual(this.updateDates(dummyAvg.three, this.defaults.timeFilter[2]));
  });

  it('dummyFilesSharedData should return the expected responses', function () {
    const dummyFiles = _.cloneDeep(this.dummyData.filesShared);
    expect(this.DummySparkDataService.dummyFilesSharedData(this.defaults.timeFilter[0])).toEqual(this.updateDates(dummyFiles.one, this.defaults.timeFilter[0]));
    expect(this.DummySparkDataService.dummyFilesSharedData(this.defaults.timeFilter[1])).toEqual(this.updateDates(dummyFiles.two, this.defaults.timeFilter[1]));
    expect(this.DummySparkDataService.dummyFilesSharedData(this.defaults.timeFilter[2])).toEqual(this.updateDates(dummyFiles.three, this.defaults.timeFilter[2]));
  });

  it('dummyMediaData should return the expected responses', function () {
    const dummyMedia = _.cloneDeep(this.mediaData.dummyData);
    expect(this.DummySparkDataService.dummyMediaData(this.defaults.timeFilter[0], false)).toEqual(this.updateDates(dummyMedia.one, this.defaults.timeFilter[0]));
    expect(this.DummySparkDataService.dummyMediaData(this.defaults.timeFilter[1], false)).toEqual(this.updateDates(dummyMedia.two, this.defaults.timeFilter[1]));
    expect(this.DummySparkDataService.dummyMediaData(this.defaults.timeFilter[2], false)).toEqual(this.updateDates(dummyMedia.three, this.defaults.timeFilter[2]));

    expect(this.DummySparkDataService.dummyMediaData(this.defaults.timeFilter[0], true)).toEqual(this.updateLineDates(dummyMedia.one, this.defaults.timeFilter[0]));
    expect(this.DummySparkDataService.dummyMediaData(this.defaults.timeFilter[1], true)).toEqual(this.updateLineDates(dummyMedia.four, this.defaults.timeFilter[1]));
  });

  it('dummyMetricsData should return the expected responses', function () {
    const dummyMetrics = _.cloneDeep(this.metrics.dummyData);
    dummyMetrics.displayData = undefined;
    expect(this.DummySparkDataService.dummyMetricsData()).toEqual(dummyMetrics);
  });

  it('dummyDeviceData should return the expected responses', function () {
    const devicesData: any = _.cloneDeep(this.devicesJson.dummyData);
    devicesData.one[0].graph = this.updateDates(devicesData.one[0].graph, this.defaults.timeFilter[0]);
    devicesData.two[0].graph = this.updateDates(devicesData.two[0].graph, this.defaults.timeFilter[1]);
    devicesData.three[0].graph = this.updateDates(devicesData.three[0].graph, this.defaults.timeFilter[2]);

    expect(this.DummySparkDataService.dummyDeviceData(this.defaults.timeFilter[0], false)).toEqual(devicesData.one);
    expect(this.DummySparkDataService.dummyDeviceData(this.defaults.timeFilter[1], false)).toEqual(devicesData.two);
    expect(this.DummySparkDataService.dummyDeviceData(this.defaults.timeFilter[2], false)).toEqual(devicesData.three);

    const endpoints: IEndpointWrapper = {
      deviceType: 'registeredEndpoints.allDevices',
      graph: [],
      balloon: false,
      emptyGraph: false,
    };

    for (let i = 0; i < 52; i++) {
      endpoints.graph.push({
        date: moment().tz(this.defaults.timezone).day(-1).subtract(51 - i, this.defaults.WEEK).format(this.defaults.dayFormat),
        totalRegisteredDevices: 15 + (15 * i),
      });
    }

    expect(this.DummySparkDataService.dummyDeviceData(this.defaults.timeFilter[0], true)).toEqual(devicesData.one);
    expect(this.DummySparkDataService.dummyDeviceData(this.defaults.timeFilter[1], true)).toEqual([endpoints]);
  });
});
