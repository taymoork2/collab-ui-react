'use strict';

describe('Controller: AnalyticsUtilizationGraphController', function () {

  // load the service's module
  beforeEach(angular.mock.module('Mediafusion'));

  var Authinfo, controller, $scope, httpMock, $q, $modal, log, $state;
  var MediaFusionAnalyticsService;

  var clusterNameTest = 'Bangalore-Test';
  var startTimeTest = '2016-03-28 11:05:56';
  var endTimeTest = '2016-03-28 12:05:56';

  beforeEach(angular.mock.module(function ($provide) {
    // $provide.value("Authinfo", authInfo);
  }));

  beforeEach(inject(function ($rootScope, $state, $controller, _$httpBackend_, _$q_, _$modal_, $log, _MediaFusionAnalyticsService_) {
    $scope = $rootScope.$new();
    $state = $state;
    log = $log;
    log.reset();
    httpMock = _$httpBackend_;
    $q = _$q_;
    $modal = _$modal_;

    MediaFusionAnalyticsService = _MediaFusionAnalyticsService_;

    controller = $controller('AnalyticsUtilizationGraphController', {
      $scope: $scope,
      $state: $state,
      log: log,
      httpMock: httpMock,
      $q: $q,
      $modal: $modal,

      MediaFusionAnalyticsService: MediaFusionAnalyticsService,

    });

  }));

  afterEach(function () {
    httpMock.verifyNoOutstandingRequest();
  });

  it('controller should be defined', function () {
    expect(controller).toBeDefined();
  });

  /*it('cpuUtlization should be defined', function () {
    expect(controller.cpuUtlization).toBeDefined();
  });

  it('activeMediaCount should be defined', function () {
    expect(controller.activeMediaCount).toBeDefined();
  });

  it('cpuCallReject should be defined', function () {
    expect(controller.cpuCallReject).toBeDefined();
  });

  /*it('getCallRejects should be defined', function () {
    controller.plotGraph();
    expect(controller.getCallRejects()).toHaveBeenCalled();
    //expect(controller.getCallRejects("MFA", "2016-03-28 11:05:56", "2016-03-28 12:05:56")).toBeDefined();
  });

  /*it('getActiveMediaCounts should be defined', function () {
    expect(controller.getActiveMediaCounts()).toBeDefined();
  });

  it('getClusterAvailability should be defined', function () {
    expect(controller.getClusterAvailability()).toBeDefined();
  });

  it('getCallRejects should have been called', function () {

    spyOn(MediaFusionAnalyticsService, 'getCallReject').and.returnValue($q.when());
    controller.plotGraph();
    //controller.getCallRejects("selectedCluster", "fromDate", "toDate");
    expect(MediaFusionAnalyticsService.getCallReject).toHaveBeenCalled();

  });

  /* it('getActiveMediaCounts should have been called', function () {

     spyOn(MediaFusionAnalyticsService, 'getActiveMediaCount').and.returnValue($q.when());
     controller.getActiveMediaCounts();
     expect(MediaFusionAnalyticsService.getActiveMediaCount).toHaveBeenCalled();

   });

   it('cpuOverload should have been called', function () {

     spyOn(MediaFusionAnalyticsService, 'getClusterAvailability').and.returnValue($q.when());
     controller.getClusterAvailability();
     expect(MediaFusionAnalyticsService.getClusterAvailability).toHaveBeenCalled();

   });

   it('check if getClusters is called with  clusterId', function () {

     spyOn(MediaFusionAnalyticsService, 'getClusters').and.returnValue($q.when());
     controller.getClusters();
     expect(MediaFusionAnalyticsService.getClusters).toHaveBeenCalled();

   });

   it('getRelativeTimeActiveMediaCount should have been called', function () {

     spyOn(MediaFusionAnalyticsService, 'getRelativeTimeActiveMediaCount').and.returnValue($q.when());
     controller.plotGraph();
     expect(controller.getRelativeTimeActiveMediaCount).toHaveBeenCalled();

   });

   it('getRelativeTimeClusterAvailability should have been called', function () {

     spyOn(MediaFusionAnalyticsService, 'getRelativeTimeClusterAvailability').and.returnValue($q.when());
     controller.plotGraph();
     expect(controller.getRelativeTimeClusterAvailability).toHaveBeenCalled();

   });

   it('getRelativeTimeCallReject should have been called', function () {

     spyOn(MediaFusionAnalyticsService, 'getRelativeTimeCallReject').and.returnValue($q.when());
     controller.plotGraph();
     expect(controller.getRelativeTimeCallReject).toHaveBeenCalled();

   });

   it('getRelativeTimeActiveMediaCount should have been called', function () {

     spyOn(MediaFusionAnalyticsService, 'getRelativeTimeActiveMediaCount').and.returnValue($q.when());
     controller.getRelativeTimeActiveMediaCount();
     expect(MediaFusionAnalyticsService.getRelativeTimeActiveMediaCount).toHaveBeenCalled();

   });

   it('getRelativeTimeClusterAvailability should have been called', function () {

     spyOn(MediaFusionAnalyticsService, 'getRelativeTimeClusterAvailability').and.returnValue($q.when());
     controller.getRelativeTimeClusterAvailability();
     expect(MediaFusionAnalyticsService.getRelativeTimeClusterAvailability).toHaveBeenCalled();

   });

   it('getRelativeTimeCallReject should have been called', function () {

     spyOn(MediaFusionAnalyticsService, 'getRelativeTimeCallReject').and.returnValue($q.when());
     controller.getRelativeTimeCallReject();
     expect(MediaFusionAnalyticsService.getRelativeTimeCallReject).toHaveBeenCalled();

   });*/

});
