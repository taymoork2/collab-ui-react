'use strict';

describe('Controller: DeviceOverviewCtrl', function () {
  var $scope, $controller, controller, $httpBackend;
  var $q, CsdmConfigService;

  beforeEach(module('Hercules'));
  beforeEach(module('Squared'));
  beforeEach(module('Huron'));
  beforeEach(module('Sunlight'));
  beforeEach(inject(dependencies));
  beforeEach(initSpies);
  beforeEach(initController);

  function dependencies(_$q_, $rootScope, _$controller_, _$httpBackend_, _CsdmConfigService_) {
    $scope = $rootScope.$new();
    $controller = _$controller_;
    $httpBackend = _$httpBackend_;
    $q = _$q_;
    CsdmConfigService = _CsdmConfigService_;
  }

  function initSpies() {
    $httpBackend.whenGET(CsdmConfigService.getUrl() + '/organization/null/devices?checkOnline=true&checkDisplayName=false').respond(200);
    $httpBackend.whenGET(CsdmConfigService.getUrl() + '/organization/null/upgradeChannels').respond(200);
    $httpBackend.whenGET('https://identity.webex.com/identity/scim/null/v1/Users/me').respond(200);
  }

  var $stateParams = {
    currentDevice: {
      isHuronDevice: false
    }
  };

  function initController() {
    controller = $controller('DeviceOverviewCtrl', {
      $scope: $scope,
      channels: {},
      $stateParams: $stateParams
    });
    $scope.$apply();
  }

  it('should init controller', function () {
    expect(controller).toBeDefined();
  });
});
