'use strict';

describe('Controller: FusionClusterListController', function () {
  var controller, $controller, $q, $rootScope, FusionClusterService, XhrNotificationService;

  beforeEach(module('Hercules'));
  beforeEach(inject(dependencies));
  beforeEach(initSpies);

  function dependencies(_$rootScope_, _$controller_, _$q_, _FusionClusterService_, _XhrNotificationService_) {
    $rootScope = _$rootScope_;
    $controller = _$controller_;
    $q = _$q_;
    FusionClusterService = _FusionClusterService_;
    XhrNotificationService = _XhrNotificationService_;
  }

  function initSpies() {
    spyOn(FusionClusterService, 'getAll');
    spyOn(XhrNotificationService, 'notify');
  }

  function initController() {
    controller = $controller('FusionClusterListController', {
      hasFeatureToggle: true
    });
  }

  describe('init', function () {
    beforeEach(function () {
      FusionClusterService.getAll.and.returnValue($q.resolve());
      initController();
    });

    it('should be loading', function () {
      expect(controller.loading).toBe(true);
    });

    it('should have 0 clusters to be displayed', function () {
      expect(controller.displayedClusters).toEqual([]);
    });
  });

  describe('after loading clusters', function () {
    it('should call XhrNotificationService.notify if loading failed', function () {
      FusionClusterService.getAll.and.returnValue($q.reject());
      initController();
      expect(controller.loading).toBe(true);
      expect(XhrNotificationService.notify).not.toHaveBeenCalled();
      $rootScope.$apply(); // force FusionClusterService.getAll() to return
      expect(controller.loading).toBe(false);
      expect(XhrNotificationService.notify).toHaveBeenCalled();
    });

    it('should update filters and displayed clusters', function () {
      FusionClusterService.getAll.and.returnValue($q.resolve([{
        state: 'fused',
        type: 'expressway',
        connectors: [{
          alarms: [],
          connectorType: 'c_mgmt',
          runningState: 'running',
          hostname: 'a.elg.no'
        }]
      }, {
        state: 'fused',
        type: 'mediafusion',
        connectors: [{
          alarms: [],
          connectorType: 'mf_mgmt',
          runningState: 'running',
          hostname: 'a.elg.no'
        }]
      }]));
      initController();
      expect(controller.filters[0].count).toBe(0);
      expect(controller.filters[1].count).toBe(0);
      expect(controller.displayedClusters.length).toBe(0);
      $rootScope.$apply(); // force FusionClusterService.getAll() to return
      expect(controller.filters[0].count).toBe(1);
      expect(controller.filters[1].count).toBe(1);
      expect(controller.displayedClusters.length).toBe(2);
    });
  });
});
