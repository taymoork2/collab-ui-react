'use strict';

describe('Controller: DeviceOverviewCtrl', function () {
  var $scope, $controller, controller, $httpBackend;
  var $q, CsdmConfigService, HuronConfig;

  beforeEach(module('Hercules'));
  beforeEach(module('Squared'));
  beforeEach(module('Huron'));
  beforeEach(inject(dependencies));
  beforeEach(initSpies);
  beforeEach(initController);

  function dependencies(_$q_, $rootScope, _$controller_, _$httpBackend_, _CsdmConfigService_, _HuronConfig_) {
    $scope = $rootScope.$new();
    $controller = _$controller_;
    $httpBackend = _$httpBackend_;
    $q = _$q_;
    CsdmConfigService = _CsdmConfigService_;
    HuronConfig = _HuronConfig_;
  }

  function initSpies() {
    $httpBackend.whenGET(CsdmConfigService.getUrl() + '/organization/null/devices?checkOnline=true&checkDisplayName=false').respond(200);
    $httpBackend.whenGET(CsdmConfigService.getUrl() + '/organization/null/upgradeChannels').respond(200);
    $httpBackend.whenGET('https://identity.webex.com/identity/scim/null/v1/Users/me').respond(200);
  }

  var $stateParams = {
    currentDevice: {
      isHuronDevice: false,
      product: 'Cisco 8865',
      cisUuid: 2,
      huronId: 3,
      kem: {
        addonModule: []
      }
    }
  };

  function initController() {
    controller = $controller('DeviceOverviewCtrl', {
      $scope: $scope,
      channels: {},
      $stateParams: $stateParams
    });
    controller.form = {
      $setPristine: function () {},
      $setUntouched: function () {}
    };
    spyOn(controller.form, '$setPristine');
    spyOn(controller.form, '$setUntouched');
    $scope.$apply();
  }

  it('should init controller', function () {
    expect(controller).toBeDefined();
  });

  describe('reset', function () {
    it('should put back old value and hide button panel', function () {
      expect(controller.kemNumber.value).toEqual(0);
      controller.kemNumber.value = 3;
      expect(controller.kemNumber.value).toEqual(3);
      controller.reset();
      expect(controller.kemNumber.value).toEqual(0);
      expect(controller.form.$setPristine).toHaveBeenCalled();
      expect(controller.form.$setUntouched).toHaveBeenCalled();
    });
  });

});
