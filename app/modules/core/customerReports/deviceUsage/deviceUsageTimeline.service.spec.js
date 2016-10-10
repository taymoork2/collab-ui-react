'use strict';

describe('DeviceUsageTimelineService', function () {

  beforeEach(angular.mock.module('Core'));

  var Authinfo = {
    getOrgId: jasmine.createSpy('getOrgId').and.returnValue('123')
  };

  beforeEach(angular.mock.module(function ($provide) {
    $provide.value('Authinfo', Authinfo);
  }));

  var DeviceUsageTimelineService, $httpBackend, urlBase;

  function createDayMockData(startDate, dayCount, samplesPerDay) {
    var items = [];
    var start = moment(startDate);
    _.times(dayCount, function () {
      _.times(samplesPerDay, function (s) {
        items.push({
          date: start.format('YYYYMMDD'),
          count: s,
          totalDuration: s * 100,
          deviceId: 'device_' + s,
          pairedCount: s
        });
      });
      start = start.add(1, 'days');
    });
    return {
      items: items
    };
  }

  beforeEach(inject(function (_DeviceUsageTimelineService_, _$httpBackend_, UrlConfig) {
    DeviceUsageTimelineService = _DeviceUsageTimelineService_;
    $httpBackend = _$httpBackend_;
    urlBase = UrlConfig.getAdminServiceUrl();
  }));

  it('provides chart', function () {
    var chart = DeviceUsageTimelineService.getLineChart();
    expect(chart.type).toEqual('serial');
    expect(chart.export.enabled).toBeTruthy();
  });

  it('provides chart data for last week', function () {
    var start = moment().startOf('week').subtract(1, 'weeks');
    var mockData = createDayMockData(start.format('YYYY-MM-DD'), 7, 3);
    var end = moment().startOf('week').format('YYYY-MM-DD');
    var path = 'organizations/123/reports/device/call?intervalType=day&';
    var range = 'rangeStart=' + start.format('YYYY-MM-DD') + '&rangeEnd=' + end;
    $httpBackend
      .when('GET', urlBase + path + range)
      .respond(mockData);
    DeviceUsageTimelineService.getDataForLastWeek('backend').then(function (data) {
      expect(data.length).toEqual(7);
      _.each(data, function (item) {
        expect(item.video).toEqual(300);
        expect(item.pairedCount).toEqual(3);
      });
    });
    $httpBackend.flush();
  });

  it('provides chart data for last month', function () {
    var start = moment().startOf('month').subtract(1, 'months');
    var mockData = createDayMockData(start.format('YYYY-MM-DD'), 30, 3);
    var end = moment().startOf('month').format('YYYY-MM-DD');
    var path = 'organizations/123/reports/device/call?intervalType=day&';
    var range = 'rangeStart=' + start.format('YYYY-MM-DD') + '&rangeEnd=' + end;
    $httpBackend
      .when('GET', urlBase + path + range)
      .respond(mockData);
    DeviceUsageTimelineService.getDataForLastMonth('backend').then(function (data) {
      expect(data.length).toEqual(30);
      _.each(data, function (item) {
        expect(item.video).toEqual(300);
        expect(item.pairedCount).toEqual(3);
      });
    });
    $httpBackend.flush();
  });
});
