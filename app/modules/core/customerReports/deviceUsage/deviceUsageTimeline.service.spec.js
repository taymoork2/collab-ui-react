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

  function createDayMockData(startDate, dayCount) {
    var items = [];
    var start = moment(startDate);
    _.times(dayCount, function () {
      items.push({
        date: start.format('YYYYMMDD'),
        callCount: 1,
        totalDuration: 100,
        pairedCount: 1,
        deviceCategory: 'ce'
      });
      items.push({
        date: start.format('YYYYMMDD'),
        callCount: 2,
        totalDuration: 200,
        pairedCount: 2,
        deviceCategory: 'darling'
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
    var mockData = createDayMockData(start.format('YYYY-MM-DD'), 7);
    var end = moment().startOf('week').format('YYYY-MM-DD');
    var path = 'organizations/123/reports/device/call?intervalType=day&';
    var range = 'rangeStart=' + start.format('YYYY-MM-DD') + '&rangeEnd=' + end;
    var deviceCategories = '&deviceCategories=ce,darling';
    $httpBackend
      .when('GET', urlBase + path + range + deviceCategories)
      .respond(mockData);
    DeviceUsageTimelineService.getDataForLastWeek('backend').then(function (data) {
      expect(data.length).toEqual(7);
      _.each(data, function (item) {
        expect(item.totalDuration).toEqual('5.00');
        expect(item.pairedCount).toEqual(3);
      });
    });
    $httpBackend.flush();
  });

  it('provides chart data for last month', function () {
    var start = moment().startOf('month').subtract(1, 'months');
    var mockData = createDayMockData(start.format('YYYY-MM-DD'), 30);
    var end = moment().startOf('month').format('YYYY-MM-DD');
    var path = 'organizations/123/reports/device/call?intervalType=day&';
    var range = 'rangeStart=' + start.format('YYYY-MM-DD') + '&rangeEnd=' + end;
    var deviceCategories = '&deviceCategories=ce,darling';
    $httpBackend
      .when('GET', urlBase + path + range + deviceCategories)
      .respond(mockData);
    DeviceUsageTimelineService.getDataForLastMonth('backend').then(function (data) {
      expect(data.length).toEqual(30);
      _.each(data, function (item) {
        expect(item.totalDuration).toEqual('5.00');
        expect(item.pairedCount).toEqual(3);
      });
    });
    $httpBackend.flush();
  });
});
