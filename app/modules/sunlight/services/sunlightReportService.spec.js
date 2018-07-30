'use strict';

var testModule = require('./index').default;

describe(' sunlightReportService', function () {
  var sunlightReportService, $httpBackend, scope, q;
  var dummyStats = getJSONFixture('sunlight/json/features/careReport/sunlightReportStats.json');

  var fifteenMinutesOrgStats = dummyStats.fifteenMinutesOrgStats;
  var fifteenMinutesOrgSnapshotStats = dummyStats.fifteenMinutesOrgSnapshotStats;
  var hourlyOrgStats = dummyStats.hourlyOrgStats;
  var dailyOrgStats = dummyStats.dailyOrgStats;
  var weeklyOrgStats = dummyStats.weeklyOrgStats;
  var overviewStats = dummyStats.overviewStats;

  var allUserFifteenMinutesStats = dummyStats.reportUsersFifteenMinutesStats;
  var allUserHourlyStats = dummyStats.reportUsersHourlyStats;
  var ciUserStats = dummyStats.ciUserStats;
  var ciNonCareUserStats = dummyStats.ciNonCareUserStats;

  var spiedAuthinfo = {
    getOrgId: jasmine.createSpy('getOrgId').and.returnValue('676a82cd-64e9-4ebd-933c-4dce087a02bd'),
  };

  beforeEach(angular.mock.module(testModule));
  beforeEach(angular.mock.module(function ($provide) {
    $provide.value('Authinfo', spiedAuthinfo);
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
    $httpBackend.whenGET(/.*\/all_user_stats.*/g)
      .respond(function (method, url, data, headers, params) {
        if (params.viewType === 'fifteen_minutes') {
          return [200, allUserFifteenMinutesStats];
        } else if (params.viewType === 'hourly') {
          return [200, allUserHourlyStats];
        } else {
          return [200, []];
        }
      });
    $httpBackend.whenGET(/.*filter=entitlements.*/g)
      .respond(function () {
        return [200, ciUserStats];
      });
    $httpBackend.whenGET(/.*filter=id.*/g)
      .respond(function () {
        return [200, ciNonCareUserStats];
      });
  }));

  beforeEach(inject(function ($rootScope, $q) {
    scope = $rootScope.$new();
    q = $q;
  }));

  it('should get and snapshot stats for org for given fifteen minutes viewType and time range', function () {
    var config = {
      params: {
        viewType: 'fifteen_minutes',
        mediaType: 'chat',
        startTime: '1465381084699',
        endTime: '1467973084699',
      },
    };
    sunlightReportService.getStats('org_stats', config).then(function (response) {
      expect(response.data.data.length).toBe(3);
      expect(response.data.metadata.jobName).toBe('org_stats_15min');
    });
    $httpBackend.flush();

    sunlightReportService.getStats('org_snapshot_stats', config).then(function (response) {
      expect(response.data.data.length).toBe(4);
      expect(response.data.metadata.jobName).toBe('org_snapshot_stats_15min');
    });
    $httpBackend.flush();

    sunlightReportService.getStats('all_user_stats', config).then(function (response) {
      expect(response.data.data.length).toBe(14);
      expect(response.data.metadata.jobName).toBe('user_contact_stats_fifteen_minutes');
    });
    $httpBackend.flush();
  });

  it('should get stats for org for given hourly viewType and time range', function () {
    var config = {
      params: {
        viewType: 'hourly',
        mediaType: 'chat',
        startTime: '1465381084699',
        endTime: '1467973084699',
      },
    };
    sunlightReportService.getStats('org_stats', config).then(function (response) {
      expect(response.data.data.length).toBe(4);
      expect(response.data.metadata.jobName).toBe('org_stats_hourly');
    });
    $httpBackend.flush();

    sunlightReportService.getStats('all_user_stats', config).then(function (response) {
      expect(response.data.data.length).toBe(3);
      expect(response.data.metadata.jobName).toBe('user_contact_stats_hourly');
    });
    $httpBackend.flush();
  });

  it('should get stats for org for given daily viewType and time range', function () {
    var config = {
      params: {
        viewType: 'daily',
        mediaType: 'chat',
        startTime: '1465381084699',
        endTime: '1467973084699',
      },
    };
    sunlightReportService.getStats('org_stats', config).then(function (response) {
      expect(response.data.data.length).toBe(3);
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
      params: {
        viewType: 'weekly',
        mediaType: 'chat',
        startTime: '1465381084699',
        endTime: '1467973084699',
      },
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

  it('should get the aggregated data based on userId', function (onSuccess, onError) {
    sunlightReportService.getAllUsersAggregatedData('all_user_stats', 1, 'chat').then(function (aggregatedData) {
      expect(aggregatedData.data.length).toBe(7);

      expect(aggregatedData.data[0].avgCsatScore).toBe(3.2);
      expect(aggregatedData.data[0].tasksHandled).toBe(5);
      expect(aggregatedData.data[0].tasksAssigned).toBe(10);
      expect(aggregatedData.data[0].avgHandleTime).toBe(17000);
      expect(aggregatedData.data[0].tasksOffered).toBe(20);
      expect(aggregatedData.data[0].tasksMissed).toBe(24);
      expect(aggregatedData.data[0].tasksAccepted).toBe(0);
      expect(aggregatedData.data[0].avgWebcallHandleTime).toBe(13000);
      expect(aggregatedData.data[0].avgWebcallCsatScore).toBe(3.4);
      expect(aggregatedData.data[0].webcallTasksHandled).toBe(5);
      expect(aggregatedData.data[0].displayName).toBe('A GT user5');

      expect(aggregatedData.data[1].avgCsatScore).toBe(3.67);
      expect(aggregatedData.data[1].tasksHandled).toBe(3);
      expect(aggregatedData.data[1].tasksAssigned).toBe(4);
      expect(aggregatedData.data[1].avgHandleTime).toBe(27887);
      expect(aggregatedData.data[1].tasksOffered).toBe(25);
      expect(aggregatedData.data[1].tasksMissed).toBe(20);
      expect(aggregatedData.data[1].tasksAccepted).toBe(5);
      expect(aggregatedData.data[1].displayName).toBe('display GT User 4');

      expect(aggregatedData.data[2].avgCsatScore).toBe(4);
      expect(aggregatedData.data[2].tasksHandled).toBe(7);
      expect(aggregatedData.data[2].tasksAssigned).toBe(10);
      expect(aggregatedData.data[2].avgHandleTime).toBe(401973);
      expect(aggregatedData.data[2].tasksOffered).toBe(80);
      expect(aggregatedData.data[2].tasksMissed).toBe(53);
      expect(aggregatedData.data[2].tasksAccepted).toBe(27);
      expect(aggregatedData.data[2].displayName).toBe('A GT user5');

      expect(aggregatedData.data[3].avgCsatScore).toBe(4);
      expect(aggregatedData.data[3].tasksHandled).toBe(0);
      expect(aggregatedData.data[3].tasksAssigned).toBe(0);
      expect(aggregatedData.data[3].avgHandleTime).toBe(0);
      expect(aggregatedData.data[3].tasksOffered).toBe(15);
      expect(aggregatedData.data[3].tasksMissed).toBe(7);
      expect(aggregatedData.data[3].tasksAccepted).toBe(8);
      expect(aggregatedData.data[3].displayName).toBe('sunlight-user1@outlook.com');

      expect(aggregatedData.data[4].displayName).toBe('A GT Non Care user');

      expect(aggregatedData.data[5].displayName).toBe('careReportsPage.deletedUser1');
      expect(aggregatedData.data[5].isUserDeleted).toBe(true);

      expect(aggregatedData.data[6].displayName).toBe('careReportsPage.deletedUser2');
      expect(aggregatedData.data[6].isUserDeleted).toBe(true);

      expect(aggregatedData.isWebcallDataPresent.isAvgCSATPresent).toBe(true);
      expect(aggregatedData.isWebcallDataPresent.isAvgHandleTimePresent).toBe(true);
      expect(aggregatedData.isWebcallDataPresent.isTotalHandledPresent).toBe(true);

      onSuccess(aggregatedData);
    }, function () {
      onError();
    });
    $httpBackend.flush();
  });

  xit('should get ReportingData for org for time selected yesterday for mediaType chat', function () {
    sunlightReportService.getReportingData('org_stats', 1, 'chat').then(function (response) {
      expect(response.length).toBe(24);
      _.each(response, function (reportData) {
        expect(moment(reportData.createdTime, 'HH:mm', true).isValid()).toBe(true);
      });
    });
    $httpBackend.flush();
  });

  xit('should get ReportingData for org for time selected today for mediaType chat', function () {
    sunlightReportService.getReportingData('org_stats', 0, 'chat').then(function (response) {
      var startTimeStamp = moment().startOf('day');
      var endTimeStamp = moment().add(1, 'hours').startOf('hour');
      var duration = moment.duration(endTimeStamp.diff(startTimeStamp));
      var hours = duration.asHours();
      expect(response.length).toBe(hours);
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

  xit('should get snapshot ReportingData for org for time selected today for mediaType chat', function () {
    sunlightReportService.getReportingData('org_snapshot_stats', 0, 'chat').then(function (response) {
      var startTimeStamp = moment().startOf('day');
      var endTimeStamp = moment().add(1, 'hours').startOf('hour');
      var duration = moment.duration(endTimeStamp.diff(startTimeStamp));
      var hours = duration.asHours();
      expect(response.length).toBe(hours);
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

  // ABC stuff
  xit('should get ReportingData for org for time selected today for mediaType abc', function () {
    sunlightReportService.getReportingData('org_stats', 0, 'abc').then(function (response) {
      var startTimeStamp = moment().startOf('day');
      var endTimeStamp = moment().add(1, 'hours').startOf('hour');
      var duration = moment.duration(endTimeStamp.diff(startTimeStamp));
      var hours = duration.asHours();
      expect(response.length).toBe(hours);
      _.each(response, function (reportData) {
        expect(moment(reportData.createdTime, 'HH:mm', true).isValid()).toBe(true);
      });
      var abcData = _.find(response, function (reportData) {
        return reportData.mediaChannel === 'abc';
      });
      expect(abcData).toBeDefined();
      expect(abcData.numTasksHandledState).toBeDefined();
      expect(abcData.numTasksHandledState).toEqual(4);
    });
    $httpBackend.flush();
  });

  it('should get ReportingData for org for time selected yesterday for mediaType abc', function () {
    sunlightReportService.getReportingData('org_stats', 1, 'abc').then(function (response) {
      expect(response.length).toBe(24);
      _.each(response, function (reportData) {
        expect(moment(reportData.createdTime, 'HH:mm', true).isValid()).toBe(true);
      });
      var abcData = _.find(response, function (reportData) {
        return reportData.mediaChannel === 'abc';
      });
      expect(abcData).toBeDefined();
      expect(abcData.numTasksHandledState).toBeDefined();
      expect(abcData.numTasksHandledState).toEqual(4);
    });
    $httpBackend.flush();
  });

  it('should get ReportingData for org for time selected last week for mediaType abc', function () {
    sunlightReportService.getReportingData('org_stats', 2, 'abc').then(function (response) {
      expect(response.length).toBe(7);
      _.each(response, function (reportData) {
        expect(moment(reportData.createdTime, 'MMM DD', true).isValid()).toBe(true);
      });
      var abcData = _.find(response, function (reportData) {
        return reportData.mediaChannel === 'abc';
      });
      // abc record should not be there because it is excluded
      expect(abcData).toBeUndefined();
    });
    $httpBackend.flush();
  });

  it('should get ReportingData for org for time selected last month for mediaType abc', function () {
    sunlightReportService.getReportingData('org_stats', 3, 'abc').then(function (response) {
      expect(response.length).toBe(4);
      _.each(response, function (reportData) {
        expect(moment(reportData.createdTime, 'MMM DD', true).isValid()).toBe(true);
      });
      var abcData = _.find(response, function (reportData) {
        return reportData.mediaChannel === 'abc';
      });
      // abc record should not be there because it is excluded
      expect(abcData).toBeUndefined();
    });
    $httpBackend.flush();
  });

  it('should get ReportingData for org for time selected last 3 months for mediaType abc', function () {
    sunlightReportService.getReportingData('org_stats', 4, 'abc').then(function (response) {
      expect(response.length).toBe(3);
      _.each(response, function (reportData) {
        expect(moment(reportData.createdTime, 'MMM', true).isValid()).toBe(true);
      });
      var abcData = _.find(response, function (reportData) {
        return reportData.mediaChannel === 'abc';
      });
      expect(abcData).toBeDefined();
      expect(abcData.numTasksHandledState).toBeDefined();
      expect(abcData.numTasksHandledState).toEqual(4);
    });
    $httpBackend.flush();
  });
});
