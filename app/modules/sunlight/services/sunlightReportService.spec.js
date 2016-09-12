"use strict";

describe(' sunlightReportService', function () {
  var sunlightReportService, $httpBackend, scope, q;
  var dummyStats = getJSONFixture('sunlight/json/features/careReport/sunlightReportStats.json');

  var fifteenMinutesOrgStats = dummyStats.fifteenMinutesOrgStats;
  var fifteenMinutesOrgSnapshotStats = dummyStats.fifteenMinutesOrgSnapshotStats;
  var hourlyOrgStats = dummyStats.hourlyOrgStats;
  var dailyOrgStats = dummyStats.dailyOrgStats;
  var weeklyOrgStats = dummyStats.weeklyOrgStats;
  var overviewStats = dummyStats.overviewStats;

  var spiedAuthinfo = {
    getOrgId: jasmine.createSpy('getOrgId').and.returnValue('676a82cd-64e9-4ebd-933c-4dce087a02bd')
  };

  beforeEach(angular.mock.module('Sunlight'));
  beforeEach(angular.mock.module(function ($provide) {
    $provide.value("Authinfo", spiedAuthinfo);
  }));

  beforeEach(inject(function (_SunlightReportService_, _$httpBackend_) {
    sunlightReportService = _SunlightReportService_;
    $httpBackend = _$httpBackend_;
    $httpBackend.whenGET(/.*\/org_stats.*/g)
      .respond(function (method, url, data, headers, params) {
        if (params.viewType === 'fifteen_minutes') {
          return [200, fifteenMinutesOrgStats];
        } else if (params.viewType === 'hourly') {
          return [200, hourlyOrgStats];
        } else if (params.viewType === 'daily') {
          return [200, dailyOrgStats];
        } else if (params.viewType === 'weekly') {
          return [200, weeklyOrgStats];
        } else {
          return [200, []];
        }
      });
    $httpBackend.whenGET(/.*\/org_snapshot_stats.*/g)
      .respond(function (method, url, data, headers, params) {
        if (params.viewType === 'fifteen_minutes') {
          return [200, fifteenMinutesOrgSnapshotStats];
        } else {
          return [200, []];
        }
      });
    $httpBackend.whenGET(/.*\/org_stats.*/g)
      .respond(function (method, url, data, headers, params) {
        if (params.viewType === 'daily') {
          return [200, dailyOrgStats];
        } else {
          return [200, []];
        }
      });
  }));

  beforeEach(inject(function ($rootScope, $q) {
    scope = $rootScope.$new();
    q = $q;
  }));

  it('should get and snapshot stats for org for given fifteen minutes viewType and time range', function () {
    var config = {
      "params": {
        "viewType": 'fifteen_minutes',
        "mediaType": 'chat',
        "startTime": '1465381084699',
        "endTime": '1467973084699'
      }
    };
    sunlightReportService.getStats('org_stats', config).then(function (response) {
      expect(response.data.data.length).toBe(2);
      expect(response.data.metadata.jobName).toBe('org_stats_15min');
    });
    $httpBackend.flush();

    sunlightReportService.getStats('org_snapshot_stats', config).then(function (response) {
      expect(response.data.data.length).toBe(4);
      expect(response.data.metadata.jobName).toBe('org_snapshot_stats_15min');
    });
    $httpBackend.flush();

  });

  it('should get stats for org for given hourly viewType and time range', function () {
    var config = {
      "params": {
        "viewType": 'hourly',
        "mediaType": 'chat',
        "startTime": '1465381084699',
        "endTime": '1467973084699'
      }
    };
    sunlightReportService.getStats('org_stats', config).then(function (response) {
      expect(response.data.data.length).toBe(3);
      expect(response.data.metadata.jobName).toBe('org_stats_hourly');
    });
    $httpBackend.flush();

  });

  it('should get stats for org for given daily viewType and time range', function () {
    var config = {
      "params": {
        "viewType": 'daily',
        "mediaType": 'chat',
        "startTime": '1465381084699',
        "endTime": '1467973084699'
      }
    };
    sunlightReportService.getStats('org_stats', config).then(function (response) {
      expect(response.data.data.length).toBe(2);
      expect(response.data.metadata.jobName).toBe('org_stats_daily');
    });
    $httpBackend.flush();

  });

  it('should get overview data with daily aggregation', function () {
    sunlightReportService.getOverviewData();
    var defer = q.defer();
    scope.$on('incomingChatTasksLoaded', function (event, message) {
      defer.resolve(message);
    });
    defer.promise.then(function (message) {
      expect(message.data.intervalCount).toBe(overviewStats.data.intervalCount);
      expect(message.data.spanType).toBe(overviewStats.data.spanType);
      expect(message.data.mediaType).toBe(overviewStats.data.mediaType);
      expect(message.data.values[0].count).toBe(overviewStats.data.values[0].count);
      expect(message.data.values[1].count).toBe(overviewStats.data.values[1].count);
    });
    $httpBackend.flush();
  });

  it('should get stats for org for given weekly viewType and time range', function () {
    var config = {
      "params": {
        "viewType": 'weekly',
        "mediaType": 'chat',
        "startTime": '1465381084699',
        "endTime": '1467973084699'
      }
    };
    sunlightReportService.getStats('org_stats', config).then(function (response) {
      expect(response.data.data.length).toBe(2);
      expect(response.data.metadata.jobName).toBe('org_stats_weekly');
    });
    $httpBackend.flush();

  });

  it('should get ReportingData for org for time selected last week for mediaType chat', function () {
    sunlightReportService.getReportingData('org_stats', 2, 'chat').then(function (response) {
      expect(response.length).toBe(7);
      _.each(response, function (reportData) {
        expect(moment(reportData.createdTime, 'MMM DD', true).isValid()).toBe(true);
      });
    });
    $httpBackend.flush();
  });

  it('should get ReportingData for org for time selected last month for mediaType chat', function () {
    sunlightReportService.getReportingData('org_stats', 3, 'chat').then(function (response) {
      expect(response.length).toBe(4);
      _.each(response, function (reportData) {
        expect(moment(reportData.createdTime, 'MMM DD', true).isValid()).toBe(true);
      });
    });
    $httpBackend.flush();
  });

  it('should get ReportingData for org for time selected yesterday for mediaType chat', function () {
    sunlightReportService.getReportingData('org_stats', 1, 'chat').then(function (response) {
      expect(response.length).toBe(24);
      _.each(response, function (reportData) {
        expect(moment(reportData.createdTime, 'HH:mm', true).isValid()).toBe(true);
      });
    });
    $httpBackend.flush();
  });

  it('should get ReportingData for org for time selected today for mediaType chat', function () {
    sunlightReportService.getReportingData('org_stats', 0, 'chat').then(function (response) {
      expect(response.length).toBe(24);
      _.each(response, function (reportData) {
        expect(moment(reportData.createdTime, 'HH:mm', true).isValid()).toBe(true);
      });
      var nonZeroDataPoint = _.find(response, function (reportData) {
        return reportData.numCsatScores !== 0;
      });
      expect(nonZeroDataPoint.avgCsatScores).toBe(3.67);
    });
    $httpBackend.flush();
  });

  it('should get snapshot ReportingData for org for time selected today for mediaType chat', function () {

    sunlightReportService.getReportingData('org_snapshot_stats', 0, 'chat').then(function (response) {
      expect(response.length).toBe(24);
      _.each(response, function (reportData) {
        expect(moment(reportData.createdTime, 'HH:mm', true).isValid()).toBe(true);
      });
      var nonZeroDataPoint = _.find(response, function (reportData) {
        return reportData.numPendingTasks !== 0;
      });
      // The below assertions fail if run from a timezone that is at HH:15 or HH:45 offset
      expect(nonZeroDataPoint.numWorkingTasks).toBe(7);
      expect(nonZeroDataPoint.numPendingTasks).toBe(8);
    });
    $httpBackend.flush();
  });

  it('should get ReportingData for org for time selected last 3 months for mediaType chat', function () {
    sunlightReportService.getReportingData('org_stats', 4, 'chat').then(function (response) {
      expect(response.length).toBe(3);
      _.each(response, function (reportData) {
        expect(moment(reportData.createdTime, 'MMM', true).isValid()).toBe(true);
      });
    });
    $httpBackend.flush();
  });

});
