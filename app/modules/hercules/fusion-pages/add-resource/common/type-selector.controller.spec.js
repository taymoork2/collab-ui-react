'use strict';

var moduleName = require('./index').default;

describe('Controller: TypeSelectorController', function () {
  var $controller, $q, $rootScope, $stateParams, Authinfo, ServiceDescriptorService;

  beforeEach(angular.mock.module(moduleName));

  beforeEach(inject(function (_$controller_, _$q_, _$rootScope_, _Authinfo_, _ServiceDescriptorService_) {
    $controller = _$controller_;
    $q = _$q_;
    $rootScope = _$rootScope_;
    $stateParams = {
      wizard: {
        next: function () {},
      },
    };
    Authinfo = _Authinfo_;
    ServiceDescriptorService = _ServiceDescriptorService_;

    spyOn(Authinfo, 'isEntitled');
    spyOn(ServiceDescriptorService, 'isServiceEnabled');
    spyOn($stateParams.wizard, 'next');
    spyOn(Authinfo, 'isCustomerLaunchedFromPartner');
    Authinfo.isEntitled.and.returnValue(true);
    Authinfo.isCustomerLaunchedFromPartner.and.returnValue(false);
  }));

  function initController() {
    return $controller('TypeSelectorController', {
      $stateParams: $stateParams,
      hasCucmSupportFeatureToggle: true,
      hasImpSupportFeatureToggle: false,
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
      expect(controller.isEntitledTo.context).toBe(true);
      expect(controller.isEntitledTo.cucm).toBe(true);
    });

    it('should initialize isEntitledTo to false if org is not entitled', function () {
      Authinfo.isEntitled.and.returnValue(false);
      var controller = initController();
      expect(controller.isEntitledTo.expressway).toBe(false);
      expect(controller.isEntitledTo.mediafusion).toBe(false);
      expect(controller.isEntitledTo.context).toBe(false);
      expect(controller.isEntitledTo.cucm).toBe(false);
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

    it('should call ServiceDescriptorService.isServiceEnabled for each service', function () {
      initController();
      $rootScope.$apply();
      expect(ServiceDescriptorService.isServiceEnabled).toHaveBeenCalledTimes(2);
      expect(ServiceDescriptorService.isServiceEnabled).toHaveBeenCalledWith('squared-fusion-mgmt');
      expect(ServiceDescriptorService.isServiceEnabled).toHaveBeenCalledWith('squared-fusion-media');
    });

    it('should populate hasSetup based on ServiceDescriptorService.isServiceEnabled', function () {
      ServiceDescriptorService.isServiceEnabled.and.callFake(serviceIsSetUpMock);
      var controller = initController();
      expect(controller.hasSetup).toBe(undefined);
      $rootScope.$apply();
      expect(controller.hasSetup).toEqual({
        expressway: true,
        mediafusion: false,
        context: true,
        cucm: true,
      });
    });

    it('should autoselect the first service', function () {
      ServiceDescriptorService.isServiceEnabled.and.callFake(serviceIsSetUpMockAlwaysTrue);
      var controller = initController();
      $rootScope.$apply();
      // context will be the selected type because services get sorted alphabetically
      expect(controller.selectedType).toBe('context');
    });

    it('should go to the next step if the user had only one service entitled for and it is setup', function () {
      Authinfo.isEntitled.and.callFake(function (entitlement) {
        return entitlement === 'squared-fusion-mgmt';
      });
      ServiceDescriptorService.isServiceEnabled.and.callFake(function (serviceId) {
        return serviceId === 'squared-fusion-mgmt';
      });
      initController();
      $rootScope.$apply();
      expect($stateParams.wizard.next).toHaveBeenCalled();
    });

    it('should overwrite hasSetup to false and the help texts for media and context when partner admin', function () {
      Authinfo.isCustomerLaunchedFromPartner.and.returnValue(true);
      ServiceDescriptorService.isServiceEnabled.and.callFake(serviceIsSetUpMockAlwaysTrue);
      var controller = initController();
      expect(controller.hasSetup).toBe(undefined);
      $rootScope.$apply();
      expect(controller.hasSetup).toEqual({
        expressway: true,
        mediafusion: false,
        context: false,
        cucm: true,
      });
      expect(controller._translation.mediafusionHelpText).toEqual('hercules.fusion.add-resource.type.partner-registration-not-supported');
      expect(controller._translation.contextHelpText).toEqual('hercules.fusion.add-resource.type.partner-registration-not-supported');
    });
  });
});
