'use strict';

describe('Controller: DevicesCtrl', function () {
  var $scope, $controller, controller, $httpBackend;
  var CsdmConfigService, AccountOrgService, CsdmHuronOrgDeviceService;

  beforeEach(module('Squared'));
  beforeEach(module('Huron'));
  beforeEach(inject(dependencies));
  beforeEach(initSpies);
  beforeEach(initController);

  function dependencies($rootScope, _$controller_, _$httpBackend_, _CsdmConfigService_, _AccountOrgService_, _CsdmHuronOrgDeviceService_) {
    $scope = $rootScope.$new();
    $controller = _$controller_;
    $httpBackend = _$httpBackend_;
    CsdmConfigService = _CsdmConfigService_;
    AccountOrgService = _AccountOrgService_;
    CsdmHuronOrgDeviceService = _CsdmHuronOrgDeviceService_;
  }

  function initSpies() {
    // TODO - eww this is wrong - Just make this init right now
    $httpBackend.whenGET(CsdmConfigService.getUrl() + '/organization/null/nonExistingDevices').respond(200);
    $httpBackend.whenGET(CsdmConfigService.getUrl() + '/organization/null/devices?checkOnline=true&checkDisplayName=false').respond(200);
    $httpBackend.whenGET(CsdmConfigService.getUrl() + '/organization/null/codes').respond(200);
    $httpBackend.whenGET(CsdmConfigService.getUrl() + '/organization/null/devices?checkOnline=true').respond(200);
    spyOn(AccountOrgService, 'getAccount').and.returnValue({
      success: _.noop
    });
    spyOn(CsdmHuronOrgDeviceService, 'create').and.returnValue({
      on: _.noop
    });
  }

  function initController() {
    controller = $controller('DevicesCtrl', {
      $scope: $scope
    });
    $scope.$apply();
  }

  it('should init controller', function () {
    expect(controller).toBeDefined();
  });
});
