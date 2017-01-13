'use strict';

describe('Controller:MetricsContoller', function () {
  beforeEach(angular.mock.module('Mediafusion'));

  var controller, $scope, httpMock, $stateParams, $q, $translate, $timeout, $interval, Log, Config, MediaClusterServiceV2, Notification, DummyMetricsReportServiceV2, MetricsReportServiceV2, MetricsGraphServiceV2;

  var dummydata = getJSONFixture('mediafusion/json/metrics-graph-report/UtilizationGraphData.json');

  var callVolumeData = getJSONFixture('mediafusion/json/metrics-graph-report/callVolumeData.json');
  var clusteravailabilityData = getJSONFixture('mediafusion/json/metrics-graph-report/clusterAvailabilityData.json');
  var callVolumeGraphData = getJSONFixture('mediafusion/json/metrics-graph-report/callVolumeGraphData.json');

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

  var allClusters = 'mediaFusion.metrics.allclusters';
  var sampleClusters = 'mediaFusion.metrics.samplecluster';

  beforeEach(inject(function ($rootScope, $controller, _$httpBackend_, _$stateParams_, _$timeout_, _$translate_, _MediaClusterServiceV2_, _$q_, _MetricsReportServiceV2_, _Notification_, _MetricsGraphServiceV2_, _DummyMetricsReportServiceV2_, _$interval_, _Log_, _Config_) {
    $scope = $rootScope.$new();

    $stateParams = _$stateParams_;
    $timeout = _$timeout_;
    $translate = _$translate_;
    MediaClusterServiceV2 = _MediaClusterServiceV2_;
    $q = _$q_;
    httpMock = _$httpBackend_;
    Log = _Log_;
    Config = _Config_;

    MetricsReportServiceV2 = _MetricsReportServiceV2_;
    Notification = _Notification_;
    MetricsGraphServiceV2 = _MetricsGraphServiceV2_;
    DummyMetricsReportServiceV2 = _DummyMetricsReportServiceV2_;
    $interval = _$interval_;
    Log = _Log_;
    Config = _Config_;

    spyOn(MetricsGraphServiceV2, 'setCallVolumeGraph').and.returnValue({
      'dataProvider': callVolumeData
    });
    spyOn(MetricsGraphServiceV2, 'setAvailabilityGraph').and.returnValue({
      'dataProvider': clusteravailabilityData
    });
    spyOn(MetricsGraphServiceV2, 'setUtilizationGraph').and.returnValue({
      'dataProvider': dummydata
    });
    httpMock.when('GET', /^\w+.*/).respond({});
    spyOn(MetricsReportServiceV2, 'getCallVolumeData').and.returnValue($q.when(callVolumeGraphData));
    spyOn(MetricsReportServiceV2, 'getAvailabilityData').and.returnValue($q.when(clusteravailabilityData));
    spyOn(MetricsReportServiceV2, 'getUtilizationData').and.returnValue($q.when(dummydata));
    spyOn(MetricsReportServiceV2, 'getClusterAvailabilityData').and.returnValue($q.when(clusteravailabilityData));
    spyOn(MediaClusterServiceV2, 'getAll').and.callThrough();

    controller = $controller('MetricsContoller', {
      $scope: $scope,
      $stateParams: $stateParams,
      $timeout: $timeout,
      $translate: $translate,
      httpMock: httpMock,
      MediaClusterServiceV2: MediaClusterServiceV2,
      $q: $q,
      MetricsReportServiceV2: MetricsReportServiceV2,
      Notification: Notification,
      MetricsGraphServiceV2: MetricsGraphServiceV2,
      DummyMetricsReportServiceV2: DummyMetricsReportServiceV2,
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
      $timeout(function () {

        expect(MetricsReportServiceV2.getCallVolumeData).toHaveBeenCalledWith(timeOptions[0]);
        expect(MetricsReportServiceV2.getAvailabilityData).toHaveBeenCalledWith(timeOptions[0]);
        expect(MetricsReportServiceV2.getUtilizationData).toHaveBeenCalledWith(timeOptions[0]);

        expect(MetricsGraphServiceV2.setCallVolumeGraph).toHaveBeenCalled();
        expect(MetricsGraphServiceV2.setAvailabilityGraph).toHaveBeenCalled();
        expect(MetricsGraphServiceV2.setUtilizationGraph).toHaveBeenCalled();

      }, 30);
    });
  });

  describe('filter changes', function () {
    it('should set all page variables', function () {
      expect(controller.timeOptions).toEqual(timeOptions);
      expect(controller.timeSelected).toEqual(timeOptions[0]);
    });

    it('All graphs should update on time filter changes', function () {
      controller.timeSelected = timeOptions[3];
      controller.clusterUpdate();
      controller.timeUpdate();
      httpMock.flush();
      expect(controller.timeSelected).toEqual(timeOptions[3]);
      expect(MetricsReportServiceV2.getCallVolumeData).toHaveBeenCalledWith(timeOptions[3], allClusters);
      expect(MetricsReportServiceV2.getAvailabilityData).toHaveBeenCalledWith(timeOptions[3], allClusters);
      expect(MetricsReportServiceV2.getUtilizationData).toHaveBeenCalledWith(timeOptions[3], allClusters);

    });

    it('All graphs should update on cluster filter changes', function () {
      controller.clusterSelected = allClusters;
      controller.clusterUpdate();
      expect(MetricsReportServiceV2.getCallVolumeData).toHaveBeenCalledWith(timeOptions[0], controller.clusterSelected);
      expect(MetricsReportServiceV2.getAvailabilityData).toHaveBeenCalledWith(timeOptions[0], controller.clusterSelected);
      expect(MetricsReportServiceV2.getUtilizationData).toHaveBeenCalledWith(timeOptions[0], controller.clusterSelected);

    });
    it('should call getClusterAvailabilityData on time filter changes', function () {
      controller.timeSelected = timeOptions[2];
      controller.clusterUpdate();
      controller.timeUpdate();
      httpMock.flush();
      expect(controller.timeSelected).toEqual(timeOptions[2]);
      expect(MetricsReportServiceV2.getClusterAvailabilityData).toHaveBeenCalledWith(timeOptions[2], allClusters);
    });
  });

  xdescribe('Evaluating Total calls Card', function () {
    it('should return total calls count when both onprem and cloud values are there', function () {
      controller.clusterSelected = allClusters;
      controller.timeSelected = timeOptions[0];
      controller.clusterId = allClusters;
      var response = {
        "data": {
          "orgId": "1eb65fdf-9643-417f-9974-ad72cae0e10f",
          "callsOnPremise": 8,
          "callsOverflow": 4
        }
      };

      spyOn(MetricsReportServiceV2, 'getTotalCallsData').and.returnValue($q.when(response));

      controller.setTotalCallsHistoricalData();
      expect(controller.onprem).toBe(8);
      expect(controller.cloud).toBe(4);
      expect(controller.total).toBe(12);

      expect(MetricsReportServiceV2.getTotalCallsData).toHaveBeenCalledWith(timeOptions[0], allClusters);

    });

    it('should return total calls count when  onprem value only is there', function () {
      controller.clusterSelected = 'All Clusters';
      controller.timeSelected = timeOptions[0];
      controller.clusterId = 'All Clusters';
      var response = {
        "data": {
          "orgId": "1eb65fdf-9643-417f-9974-ad72cae0e10f",
          "callsOnPremise": 23
        }
      };

      spyOn(MetricsReportServiceV2, 'getTotalCallsData').and.returnValue($q.when(response));

      controller.setTotalCallsHistoricalData();
      expect(controller.onprem).toBe(23);
      expect(controller.cloud).toBe('N/A');
      expect(controller.total).toBe(23);

    });

    it('should return total calls count when  cloud value only is there', function () {
      controller.clusterSelected = 'All Clusters';
      controller.timeSelected = timeOptions[0];
      controller.clusterId = 'All Clusters';
      var response = {
        "data": {
          "orgId": "1eb65fdf-9643-417f-9974-ad72cae0e10f",
          "callsOverflow": 14
        }
      };

      spyOn(MetricsReportServiceV2, 'getTotalCallsData').and.returnValue($q.when(response));

      controller.setTotalCallsHistoricalData();
      expect(controller.onprem).toBe('N/A');
      expect(controller.cloud).toBe(14);
      expect(controller.total).toBe(14);

    });

    it('should return total calls as 0 when zero values are present', function () {
      controller.clusterSelected = 'All Clusters';
      controller.timeSelected = timeOptions[0];
      controller.clusterId = 'All Clusters';
      var response = {
        "data": {
          "orgId": "1eb65fdf-9643-417f-9974-ad72cae0e10f",
          "callsOnPremise": 0,
          "callsOverflow": 0
        }
      };

      spyOn(MetricsReportServiceV2, 'getTotalCallsData').and.returnValue($q.when(response));

      controller.setTotalCallsHistoricalData();
      expect(controller.onprem).toBe(0);
      expect(controller.cloud).toBe(0);
      expect(controller.total).toBe(0);

      expect(MetricsReportServiceV2.getTotalCallsData).toHaveBeenCalledWith(timeOptions[0], 'All Clusters');

    });

    it('should return total calls count when  cloud value only is there for a host', function () {
      controller.clusterSelected = 'MFA';
      controller.timeSelected = timeOptions[0];
      controller.clusterId = 'MFA';
      var response = {
        "data": {
          "orgId": "1eb65fdf-9643-417f-9974-ad72cae0e10f",
          "clusterId": "MFA",
          "callsRedirect": 14
        }
      };

      spyOn(MetricsReportServiceV2, 'getTotalCallsData').and.returnValue($q.when(response));

      controller.setTotalCallsHistoricalData();
      expect(controller.onprem).toBe('N/A');
      expect(controller.cloud).toBe(14);
      expect(controller.total).toBe(14);

    });

    it('should return N/A as there is no response data with calls', function () {
      controller.clusterSelected = 'MFA';
      controller.timeSelected = timeOptions[0];
      controller.clusterId = 'MFA';
      var response = {
        "data": {
          "orgId": "1eb65fdf-9643-417f-9974-ad72cae0e10f",
          "clusterId": "MFA"
        }
      };

      spyOn(MetricsReportServiceV2, 'getTotalCallsData').and.returnValue($q.when(response));

      controller.setTotalCallsHistoricalData();
      expect(controller.onprem).toBe('N/A');
      expect(controller.cloud).toBe('N/A');
      expect(controller.total).toBe('N/A');

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
  xit('getClusterAvailabilityData should be called for setClusterAvailabilityHistorical', function () {
    controller.timeSelected = timeOptions[2];
    controller.clusterId = allClusters;
    controller.setClusterAvailabilityHistorical();
    expect(MetricsReportServiceV2.getAvailabilityData).toHaveBeenCalled();
  });
  it('getUtilizationData should be called for setUtilizationHistoricalData', function () {
    controller.timeSelected = timeOptions[2];
    controller.allClusters = allClusters;
    controller.clusterId = allClusters;
    controller.setUtilizationHistoricalData();
    httpMock.flush();
    expect(MetricsReportServiceV2.getUtilizationData).toHaveBeenCalled();
  });
  xit('getUtilizationData should be called for setUtilizationHistoricalData when clusterId is not allClusters', function () {
    controller.timeSelected = timeOptions[3];
    controller.allClusters = allClusters;
    controller.clusterId = sampleClusters;
    controller.setUtilizationHistoricalData();
    httpMock.flush();
    expect(MetricsReportServiceV2.getUtilizationData).toHaveBeenCalled();
  });
});
