'use strict';

describe('Controller:MediaServiceMetricsContoller', function () {
  var controller, $scope, $stateParams, $q, $translate, $timeout, Log, Authinfo, Config, MediaFusionAnalyticsService, DummyMetricsReportService, MetricsReportService, MetricsGraphService;

  var ABORT = 'ABORT';
  var REFRESH = 'refresh';
  var SET = 'set';
  var EMPTY = 'empty';
  var dummydata = '';

  var callVolumeData = getJSONFixture('mediafusion/json/metrics-graph-report/callVolumeData.json');
  var callVolumeData = callVolumeData.callvolume;
  var clusteravailabilityData = getJSONFixture('mediafusion/json/metrics-graph-report/clusterAvailabilityData.json');
  var clusteravailabilityData = clusteravailabilityData.clusteravailability;

  var timeOptions = [{
    value: 0,
    label: 'mediaFusion.metrics.today',
    description: 'mediaFusion.metrics.today2'
  }, {
    value: 1,
    label: 'mediaFusion.metrics.week',
    description: 'mediaFusion.metrics.week2'
  }, {
    value: 2,
    label: 'mediaFusion.metrics.month',
    description: 'mediaFusion.metrics.month2'
  }, {
    value: 3,
    label: 'mediaFusion.metrics.threeMonths',
    description: 'mediaFusion.metrics.threeMonths2'
  }];

  beforeEach(module('Mediafusion'));

  describe('MediaServiceMetricsContoller - Expected Responses', function () {
    beforeEach(inject(function ($rootScope, $controller, _$stateParams_, _$q_, _$translate_, _$timeout_, _Log_, _Config_, _MediaFusionAnalyticsService_, _MetricsReportService_, _DummyMetricsReportService_, _MetricsGraphService_) {
      $scope = $rootScope.$new();
      $stateParams = _$stateParams_;
      $q = _$q_;
      $translate = _$translate_;
      $timeout = _$timeout_;
      Log = _Log_;
      Config = _Config_;
      MediaFusionAnalyticsService = _MediaFusionAnalyticsService_;
      MetricsReportService = _MetricsReportService_;
      DummyMetricsReportService = _DummyMetricsReportService_;
      MetricsGraphService = _MetricsGraphService_;

      spyOn(MetricsGraphService, 'setCallVolumeGraph').and.returnValue({
        'dataProvider': callVolumeData
      });
      spyOn(MetricsGraphService, 'setAvailabilityGraph').and.returnValue({
        'dataProvider': clusteravailabilityData
      });
      spyOn(MetricsGraphService, 'setUtilizationGraph').and.returnValue({
        'dataProvider': dummydata
      });

      spyOn(MetricsReportService, 'getCallVolumeData').and.returnValue($q.when(callVolumeData));
      spyOn(MetricsReportService, 'getAvailabilityData').and.returnValue($q.when(clusteravailabilityData));
      spyOn(MetricsReportService, 'getUtilizationData').and.returnValue($q.when(dummydata));
      //spyOn(MetricsReportService, 'getTotalCallsData').and.returnValue($q.when(totalcallsdata));

      controller = $controller('MediaServiceMetricsContoller', {
        $stateParams: $stateParams,
        $scope: $scope,
        $q: $q,
        $translate: $translate,
        Log: Log,
        Config: Config,
        MediaFusionAnalyticsService: MediaFusionAnalyticsService,
        MetricsReportService: MetricsReportService,
        DummyMetricsReportService: DummyMetricsReportService,
        MetricsGraphService: MetricsGraphService
      });
      //$scope.$apply();
    }));

    describe('Initializing Controller', function () {
      it('should be created successfully and all expected calls completed', function () {
        expect(controller).toBeDefined();
        $timeout(function () {

          expect(MetricsReportService.getCallVolumeData).toHaveBeenCalledWith(timeOptions[0]);
          expect(MetricsReportService.getAvailabilityData).toHaveBeenCalledWith(timeOptions[0]);
          expect(MetricsReportService.getUtilizationData).toHaveBeenCalledWith(timeOptions[0]);
          //expect(MetricsReportService.getTotalCallsData).toHaveBeenCalledWith(timeOptions[0]);

          expect(MetricsGraphService.setCallVolumeGraph).toHaveBeenCalled();
          expect(MetricsGraphService.setAvailabilityGraph).toHaveBeenCalled();
          expect(MetricsGraphService.setUtilizationGraph).toHaveBeenCalled();

        }, 30);
      });
    });

    describe('filter changes', function () {
      it('should set all page variables', function () {
        expect(controller.timeOptions).toEqual(timeOptions);
        expect(controller.timeSelected).toEqual(timeOptions[0]);
      });

      it('All graphs should update on time filter changes', function () {
        controller.timeSelected = timeOptions[1];
        controller.timeUpdate();
        expect(controller.timeSelected).toEqual(timeOptions[1]);
        expect(MetricsReportService.getCallVolumeData).toHaveBeenCalledWith(timeOptions[1], 'All Clusters');
        expect(MetricsReportService.getAvailabilityData).toHaveBeenCalledWith(timeOptions[1], 'All Clusters');
        expect(MetricsReportService.getUtilizationData).toHaveBeenCalledWith(timeOptions[1], 'All Clusters');
        //expect(MetricsReportService.getTotalCallsData).toHaveBeenCalledWith(timeOptions[1], 'All');

      });

      it('All graphs should update on cluster filter changes', function () {
        controller.clusterSelected = 'All Clusters';
        controller.clusterUpdate();

        expect(MetricsReportService.getCallVolumeData).toHaveBeenCalledWith(timeOptions[0], controller.clusterSelected);
        expect(MetricsReportService.getAvailabilityData).toHaveBeenCalledWith(timeOptions[0], controller.clusterSelected);
        expect(MetricsReportService.getUtilizationData).toHaveBeenCalledWith(timeOptions[0], controller.clusterSelected);
        //expect(MetricsReportService.getUtilizationData).toHaveBeenCalledWith(timeOptions[0], controller.clusterSelected);

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

  });
});
