'use strict';

describe('Controller:MediaSeriveMeetingsReportsCtrl', function () {
  beforeEach(angular.mock.module('Mediafusion'));

  var controller, httpMock, $translate, $scope, $interval, Notification, MeetingsReportService, MeetingsGraphService, $timeout, $q;

  beforeEach(inject(function (_$q_, $controller, _$translate_, $rootScope, _$interval_, _Notification_, _MeetingsReportService_, _MeetingsGraphService_, _$timeout_, _$httpBackend_) {
    httpMock = _$httpBackend_;
    httpMock.when('GET', /^\w+.*/).respond({});
    $translate = _$translate_;
    $scope = $rootScope.$new();
    $interval = _$interval_;
    Notification = _Notification_;
    MeetingsGraphService = _MeetingsGraphService_;
    MeetingsReportService = _MeetingsReportService_;
    $timeout = _$timeout_;
    $q = _$q_;
    spyOn(MeetingsReportService, 'getMeetingMetrics').and.returnValue($q.when({}));
    spyOn(MeetingsReportService, 'getMeetingTypeData').and.returnValue($q.when({}));
    spyOn(MeetingsReportService, 'getMeetingTypeDurationData').and.returnValue($q.when({}));
    controller = $controller('MediaSeriveMeetingsReportsCtrl', {
      httpMock: httpMock,
      $translate: $translate,
      $scope: $scope,
      $interval: $interval,
      Notification: Notification,
      MeetingsReportService: MeetingsReportService,
      MeetingsGraphService: MeetingsGraphService,
      $timeout: $timeout
    });
  }));
  it('controller should be defined', function () {
    expect(controller).toBeDefined();
  });
  it('should be created successfully and all expected calls completed', function () {
    expect(controller).toBeDefined();
    $timeout.flush();
    expect(MeetingsReportService.getMeetingMetrics).toHaveBeenCalled();
    expect(MeetingsReportService.getMeetingTypeData).toHaveBeenCalled();
    expect(MeetingsReportService.getMeetingTypeDurationData).toHaveBeenCalled();
  });
});
