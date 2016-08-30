'use strict';

describe('Controller: TypeSelectorController', function () {
  var $controller, $q, $rootScope, $stateParams, Authinfo, FusionClusterService;

  beforeEach(angular.mock.module('Hercules'));

  beforeEach(inject(function (_$controller_, _$q_, _$rootScope_, _Authinfo_, _FusionClusterService_) {
    $controller = _$controller_;
    $q = _$q_;
    $rootScope = _$rootScope_;
    $stateParams = {
      wizard: {
        next: function () {}
      }
    };
    Authinfo = _Authinfo_;
    FusionClusterService = _FusionClusterService_;

    spyOn(Authinfo, 'isEntitled');
    spyOn(FusionClusterService, 'serviceIsSetUp');
    spyOn($stateParams.wizard, 'next');
    Authinfo.isEntitled.and.returnValue(true);
  }));

  function initController(options) {
    var feature = _.get(options, 'hasMediaFeatureToggle', true);
    return $controller('TypeSelectorController', {
      $stateParams: $stateParams,
      hasMediaFeatureToggle: feature,
    });
  }

  describe('init', function () {
    it('should initialize with UIstate as loading', function () {
      var controller = initController();
      expect(controller.UIstate).toBe('loading');
    });

    it('should initialize isEntitledTo to true if org is entitled', function () {
      var controller = initController();
      expect(controller.isEntitledTo.expressway).toBe(true);
      expect(controller.isEntitledTo.mediafusion).toBe(true);
    });

    it('should initialize isEntitledTo to false if org is not entitled', function () {
      Authinfo.isEntitled.and.returnValue(false);
      var controller = initController();
      expect(controller.isEntitledTo.expressway).toBe(false);
      expect(controller.isEntitledTo.mediafusion).toBe(false);
    });

    it('should initialize isEntitledTo.mediafusion to false if no media feature toggle', function () {
      // fake the entitlement to true, and observe that the feature toggle is more important
      var controller = initController({ hasMediaFeatureToggle: false });
      expect(controller.isEntitledTo.mediafusion).toBe(false);
    });
  });

  describe('canGoNext()', function () {
    it('should return false if selectedType is not a valid type', function () {
      var controller = initController();
      controller.selectedType = '';
      expect(controller.canGoNext()).toBe(false);
    });

    it('should return true if selectedType is not falsy', function () {
      var controller = initController();
      controller.selectedType = 'expressway';
      expect(controller.canGoNext()).toBe(true);
    });
  });

  describe('getSetupState()', function () {
    var serviceIsSetUpMock = function (serviceId) {
      if (serviceId === 'squared-fusion-mgmt') {
        return $q.resolve(true);
      } else if (serviceId === 'squared-fusion-media') {
        return $q.resolve(false);
      }
      return $q.resolve(true);
    };
    var serviceIsSetUpMockAlwaysTrue = function () {
      return $q.resolve(true);
    };

    it('should call FusionClusterService.serviceIsSetUp for each service', function () {
      initController();
      $rootScope.$apply();
      expect(FusionClusterService.serviceIsSetUp).toHaveBeenCalledTimes(2);
      expect(FusionClusterService.serviceIsSetUp).toHaveBeenCalledWith('squared-fusion-mgmt');
      expect(FusionClusterService.serviceIsSetUp).toHaveBeenCalledWith('squared-fusion-media');
    });

    it('should populate hasSetup based on FusionClusterService.serviceIsSetUp', function () {
      FusionClusterService.serviceIsSetUp.and.callFake(serviceIsSetUpMock);
      var controller = initController();
      expect(controller.hasSetup).toBe(undefined);
      $rootScope.$apply();
      expect(controller.hasSetup).toEqual({
        expressway: true,
        mediafusion: false,
      });
    });

    it('should autoselect the first service', function () {
      FusionClusterService.serviceIsSetUp.and.callFake(serviceIsSetUpMockAlwaysTrue);
      var controller = initController();
      $rootScope.$apply();
      expect(controller.selectedType).toBe('expressway');
    });

    it('should go to the next step if the user had only one service entitled for and it is setup', function () {
      Authinfo.isEntitled.and.callFake(function (entitlement) {
        return entitlement === 'squared-fusion-mgmt';
      });
      FusionClusterService.serviceIsSetUp.and.callFake(function (serviceId) {
        return serviceId === 'squared-fusion-mgmt';
      });
      initController();
      $rootScope.$apply();
      expect($stateParams.wizard.next).toHaveBeenCalled();
    });
  });
});
