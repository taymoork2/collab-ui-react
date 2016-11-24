'use strict';

describe('Service: Meeting Reports Meeting Service', function () {
  var $httpBackend, MeetingsReportService, meetingMetricsLink;

  beforeEach(angular.mock.module('Mediafusion'));

  var Authinfo = {
    getOrgId: jasmine.createSpy('getOrgId').and.returnValue('1')
  };
  var timeFilter = {
    value: 0
  };
  beforeEach(angular.mock.module(function ($provide) {
    $provide.value('Authinfo', Authinfo);
  }));
  var meetingMetricsRes = { 'totalMeetings': 187, 'totalMeetingDuration': 138905, 'orgId': '2c3c9f9e-73d9-4460-a668-047162ff1bac' };
  beforeEach(inject(function (_$httpBackend_, _MeetingsReportService_, UrlConfig) {
    $httpBackend = _$httpBackend_;
    MeetingsReportService = _MeetingsReportService_;
    var baseUrl = UrlConfig.getAthenaServiceUrl() + '/organizations/' + Authinfo.getOrgId();
    meetingMetricsLink = baseUrl + '/meeting_metrics/?relativeTime=1d';

  }));

  it('should exist', function () {
    expect(MeetingsReportService).toBeDefined();
  });

  it('should getMeetingMetrics data', function () {
    $httpBackend.whenGET(meetingMetricsLink).respond(meetingMetricsRes);
    MeetingsReportService.getMeetingMetrics(timeFilter).then(function (response) {
      expect(response).toEqual(meetingMetricsRes);
    });
    $httpBackend.flush();
  });
});
