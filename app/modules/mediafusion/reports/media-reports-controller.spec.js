'use strict';

describe('Controller:MediaReportsController', function () {
  beforeEach(angular.mock.module('Mediafusion'));

  var controller, $scope, httpMock, $stateParams, $q, $translate, $timeout, $interval, Log, Config, MediaClusterServiceV2, Notification, UtilizationResourceGraphService, MediaReportsService, MediaReportsDummyGraphService, AvailabilityResourceGraphService, CallVolumeResourceGraphService, MediaSneekPeekResourceService;

  var callVolumeData = getJSONFixture('mediafusion/json/metrics-graph-report/callVolumeData.json');
  var clusteravailabilityData = getJSONFixture('mediafusion/json/metrics-graph-report/clusterAvailabilityData.json');
  var callVolumeGraphData = getJSONFixture('mediafusion/json/metrics-graph-report/callVolumeGraphData.json');
  var utilizationGraphData = getJSONFixture('mediafusion/json/metrics-graph-report/UtilizationGraphData.json');

  var timeOptions = [{
    value: 0,
    label: 'mediaFusion.metrics.last4Hours'
  }, {
    value: 1,
    label: 'mediaFusion.metrics.today'
  }, {
    value: 2,
    label: 'mediaFusion.metrics.week'
  }, {
    value: 3,
    label: 'mediaFusion.metrics.month'
  }, {
    value: 4,
    label: 'mediaFusion.metrics.threeMonths'
  }];

  var allClusters = 'mediaFusion.metrics.allclusters';

  beforeEach(inject(function ($rootScope, $controller, _$httpBackend_, _$stateParams_, _$timeout_, _$translate_, _MediaClusterServiceV2_, _$q_, _UtilizationResourceGraphService_, _Notification_, _MediaReportsDummyGraphService_, _MediaReportsService_, _$interval_, _Log_, _Config_, _AvailabilityResourceGraphService_, _CallVolumeResourceGraphService_, _MediaSneekPeekResourceService_) {
    $scope = $rootScope.$new();

    $stateParams = _$stateParams_;
    $timeout = _$timeout_;
    $translate = _$translate_;
    MediaClusterServiceV2 = _MediaClusterServiceV2_;
    $q = _$q_;
    httpMock = _$httpBackend_;
    Log = _Log_;
    Config = _Config_;

    MediaReportsDummyGraphService = _MediaReportsDummyGraphService_;
    Notification = _Notification_;
    UtilizationResourceGraphService = _UtilizationResourceGraphService_;
    MediaReportsService = _MediaReportsService_;
    AvailabilityResourceGraphService = _AvailabilityResourceGraphService_;
    CallVolumeResourceGraphService = _CallVolumeResourceGraphService_;
    MediaSneekPeekResourceService = _MediaSneekPeekResourceService_;
    $interval = _$interval_;
    Log = _Log_;
    Config = _Config_;

    spyOn(CallVolumeResourceGraphService, 'setCallVolumeGraph').and.returnValue({
      'dataProvider': callVolumeData
    });
    spyOn(AvailabilityResourceGraphService, 'setAvailabilityGraph').and.returnValue({
      'dataProvider': clusteravailabilityData
    });
    spyOn(UtilizationResourceGraphService, 'setUtilizationGraph').and.returnValue({
      'dataProvider': utilizationGraphData
    });
    httpMock.when('GET', /^\w+.*/).respond({});

    controller = $controller('MediaReportsController', {
      $scope: $scope,
      $stateParams: $stateParams,
      $timeout: $timeout,
      $translate: $translate,
      httpMock: httpMock,
      MediaClusterServiceV2: MediaClusterServiceV2,
      $q: $q,
      MediaReportsDummyGraphService: MediaReportsDummyGraphService,
      UtilizationResourceGraphService: UtilizationResourceGraphService,
      MediaReportsService: MediaReportsService,
      AvailabilityResourceGraphService: AvailabilityResourceGraphService,
      CallVolumeResourceGraphService: CallVolumeResourceGraphService,
      MediaSneekPeekResourceService: MediaSneekPeekResourceService,
      Notification: Notification,
      $interval: $interval,
      Log: Log,
      Config: Config
    });
  }));
  it('controller should be defined', function () {
    expect(controller).toBeDefined();
  });

  describe('Initializing Controller', function () {
    it('should be created successfully and all expected calls completed', function () {
      expect(controller).toBeDefined();
      spyOn(MediaReportsService, 'getCallVolumeData').and.returnValue($q.resolve(callVolumeGraphData));
      spyOn(MediaReportsService, 'getAvailabilityData').and.returnValue($q.resolve(clusteravailabilityData));
      spyOn(MediaReportsService, 'getUtilizationData').and.returnValue($q.resolve(utilizationGraphData));
      $timeout(function () {

        expect(MediaReportsService.getCallVolumeData).toHaveBeenCalledWith(timeOptions[0]);
        expect(MediaReportsService.getAvailabilityData).toHaveBeenCalledWith(timeOptions[0]);
        expect(MediaReportsService.getUtilizationData).toHaveBeenCalledWith(timeOptions[0]);

        expect(CallVolumeResourceGraphService.setCallVolumeGraph).toHaveBeenCalled();
        expect(AvailabilityResourceGraphService.setAvailabilityGraph).toHaveBeenCalled();
        expect(UtilizationResourceGraphService.setUtilizationGraph).toHaveBeenCalled();

      }, 30);
    });
  });

  describe('filter changes', function () {
    it('should set all page variables', function () {
      expect(controller.timeOptions).toEqual(timeOptions);
      expect(controller.timeSelected).toEqual(timeOptions[0]);
    });
    it('All graphs should update on cluster filter changes', function () {
      controller.clusterSelected = allClusters;
      spyOn(MediaReportsService, 'getCallVolumeData').and.returnValue($q.resolve(callVolumeGraphData));
      spyOn(MediaReportsService, 'getAvailabilityData').and.returnValue($q.resolve(clusteravailabilityData));
      spyOn(MediaReportsService, 'getUtilizationData').and.returnValue($q.resolve(utilizationGraphData));
      controller.clusterUpdate();
      expect(MediaReportsService.getCallVolumeData).toHaveBeenCalledWith(timeOptions[0], controller.clusterSelected);
      expect(MediaReportsService.getAvailabilityData).toHaveBeenCalledWith(timeOptions[0], controller.clusterSelected);
      expect(MediaReportsService.getUtilizationData).toHaveBeenCalledWith(timeOptions[0], controller.clusterSelected);
    });
  });

  describe('isRefresh', function () {
    it('should return true when sent "refresh"', function () {
      expect(controller.isRefresh('refresh')).toBeTruthy();
    });
    it('should return false when sent "set" or "empty"', function () {
      expect(controller.isRefresh('set')).toBeFalsy();
      expect(controller.isRefresh('empty')).toBeFalsy();
    });
  });

  describe('isEmpty', function () {
    it('should return true when sent "empty"', function () {
      expect(controller.isEmpty('empty')).toBeTruthy();
    });
    it('should return false when sent "set" or "refresh"', function () {
      expect(controller.isEmpty('set')).toBeFalsy();
      expect(controller.isEmpty('refresh')).toBeFalsy();
    });
  });

  describe('loadResourceDatas when changeTabs called', function () {
    it('loadResourceDatas should call all services', function () {
      expect(controller).toBeDefined();
      spyOn(MediaReportsService, 'getTotalCallsData').and.callThrough();
      spyOn(MediaReportsService, 'getClusterAvailabilityData').and.callThrough();
      spyOn(MediaReportsService, 'getClusterAvailabilityTooltip').and.callThrough();
      spyOn(MediaReportsService, 'getHostedOnPremisesTooltip').and.callThrough();
      spyOn(MediaReportsService, 'getUtilizationData').and.callThrough();
      spyOn(MediaReportsService, 'getAvailabilityData').and.callThrough();
      spyOn(MediaReportsService, 'getCallVolumeData').and.callThrough();
      controller.changeTabs(false, true);
      httpMock.flush();
      expect(MediaReportsService.getTotalCallsData).toHaveBeenCalled();
      expect(MediaReportsService.getClusterAvailabilityData).toHaveBeenCalled();
      expect(MediaReportsService.getClusterAvailabilityTooltip).toHaveBeenCalled();
      expect(MediaReportsService.getHostedOnPremisesTooltip).toHaveBeenCalled();
      expect(MediaReportsService.getUtilizationData).toHaveBeenCalled();
      expect(MediaReportsService.getAvailabilityData).toHaveBeenCalled();
      expect(MediaReportsService.getCallVolumeData).toHaveBeenCalled();
    });

    it('setTotalCallsData should invoke getTotalCallsData', function () {
      var response = {
        'data': {
          'callsOnPremise': 20,
          'callsRedirect': 30
        }
      };
      spyOn(MediaReportsService, 'getTotalCallsData').and.returnValue($q.resolve(response));
      controller.setTotalCallsData();
      httpMock.flush();
      expect(MediaReportsService.getTotalCallsData).toHaveBeenCalled();
      expect(controller.onprem).toBe(20);
      expect(controller.cloud).toBe(30);
      expect(controller.total).toBe(50);
    });

    it('setClusterAvailability should set the clusterAvailability', function () {
      var response = {
        'data': {
          'availabilityPercent': 20
        }
      };
      spyOn(MediaReportsService, 'getClusterAvailabilityData').and.returnValue($q.resolve(response));
      controller.setClusterAvailability();
      httpMock.flush();
      expect(MediaReportsService.getClusterAvailabilityData).toHaveBeenCalled();
      expect(controller.clusterAvailability).toBeDefined();
    });

    it('setSneekPeekData should call MediaReportsService and MediaSneekPeekResourceService', function () {
      spyOn(MediaReportsService, 'getClusterAvailabilityTooltip').and.callThrough();
      spyOn(MediaReportsService, 'getHostedOnPremisesTooltip').and.callThrough();
      spyOn(MediaSneekPeekResourceService, 'getClusterAvailabilitySneekPeekValues').and.returnValue({
        values: ["dummyCluster"]
      });
      spyOn(MediaSneekPeekResourceService, 'getHostedOnPremisesSneekPeekValues').and.returnValue();
      controller.setSneekPeekData();
      httpMock.flush();
      expect(MediaReportsService.getClusterAvailabilityTooltip).toHaveBeenCalled();
      expect(MediaReportsService.getHostedOnPremisesTooltip).toHaveBeenCalled();
      expect(MediaSneekPeekResourceService.getClusterAvailabilitySneekPeekValues).toHaveBeenCalled();
      expect(MediaSneekPeekResourceService.getHostedOnPremisesSneekPeekValues).toHaveBeenCalled();
    });

    it('should call dummysetUtilizationData for setUtilizationData when there is no data', function () {
      spyOn(MediaReportsService, 'getUtilizationData').and.callThrough();
      spyOn(MediaReportsDummyGraphService, 'dummyUtilizationData').and.callThrough();
      spyOn(MediaReportsDummyGraphService, 'dummyUtilizationGraph').and.callThrough();
      controller.changeTabs(false, true);
      httpMock.flush();
      expect(MediaReportsService.getUtilizationData).toHaveBeenCalled();
      expect(MediaReportsDummyGraphService.dummyUtilizationData).toHaveBeenCalled();
      expect(MediaReportsDummyGraphService.dummyUtilizationGraph).toHaveBeenCalled();
      expect(UtilizationResourceGraphService.setUtilizationGraph).toHaveBeenCalled();
    });

    it('it should call dummysetAvailabilityData for setAvailabilityData when response has no data', function () {
      spyOn(MediaReportsService, 'getAvailabilityData').and.callThrough();
      spyOn(MediaReportsDummyGraphService, 'dummyAvailabilityData').and.callThrough();
      controller.changeTabs(false, true);
      httpMock.flush();
      expect(MediaReportsService.getAvailabilityData).toHaveBeenCalled();
      expect(MediaReportsDummyGraphService.dummyAvailabilityData).toHaveBeenCalled();
      expect(AvailabilityResourceGraphService.setAvailabilityGraph).toHaveBeenCalled();
    });

    it('it should call dummysetCallVolumeData for setCallVolumeData when there is no data', function () {
      spyOn(MediaReportsService, 'getCallVolumeData').and.callThrough();
      spyOn(MediaReportsDummyGraphService, 'dummyCallVolumeData').and.callThrough();
      controller.changeTabs(false, true);
      httpMock.flush();
      expect(MediaReportsService.getCallVolumeData).toHaveBeenCalled();
      expect(MediaReportsDummyGraphService.dummyCallVolumeData).toHaveBeenCalled();
      expect(CallVolumeResourceGraphService.setCallVolumeGraph).toHaveBeenCalled();
    });
  });
});
