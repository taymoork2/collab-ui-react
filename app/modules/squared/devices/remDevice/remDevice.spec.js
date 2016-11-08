'use strict';

describe('Controller: RemDeviceController', function () {
  var controller, $q, $rootScope, $httpBackend, CsdmCodeService, CsdmDeviceService, CsdmHuronDeviceService, CsdmUnusedAccountsService, deviceOrCode;
  var fakeModal = {
    close: sinon.stub()
  };

  var cisUidOfPlace = 'a19b308a-PlaceWithDevice-71898e423bec';
  var device1Url = 'https://csdm-integration.wbx2.com/csdm/api/v1/organization/584cf4cd-eea7-4c8c-83ee-67d88fc6eab5/devices/c528e32d-ed35-4e00-a20d-d4d3519efb4f';
  var code2Url = 'https://csdm-integration.wbx2.com/csdm/api/v1/organization/584cf4cd-eea7-4c8c-83ee-67d88fc6eab5/codes/ad233bb2-code2-for-place-with-dev-93da278b3a0c';
  var huronDevice2Url = 'https://cmi.huron-int.com/api/v1/voice/customers/3a6ff373-unittest-a27460e0ac5c/sipendpoints/2c586b22-hurondev_inplace2-ace151f631fa';

  beforeEach(angular.mock.module('Squared'));
  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Hercules'));
  beforeEach(angular.mock.module('Sunlight'));
  beforeEach(inject(function (FeatureToggleService, $q, CsdmHuronOrgDeviceService) {

    CsdmHuronDeviceService = CsdmHuronOrgDeviceService.create();

    spyOn(FeatureToggleService, 'supports').and.returnValue($q.when(true));
    spyOn(CsdmHuronOrgDeviceService, 'create').and.returnValue(CsdmHuronDeviceService);
    spyOn(CsdmHuronDeviceService, 'deleteItem').and.returnValue($q.when());
  }));

  describe('Expected Responses', function () {
    beforeEach(inject(function (_$rootScope_, $controller, _$q_, _$httpBackend_, _CsdmCodeService_, _CsdmDeviceService_, _CsdmUnusedAccountsService_, CsdmDataModelService) {
      var initialDevices = getJSONFixture('squared/json/devices.json');
      var codes = getJSONFixture('squared/json/activationCodes.json');
      var accounts = getJSONFixture('squared/json/accounts.json');
      var initialHuronDevices = getJSONFixture('squared/json/huronDevices.json');

      $q = _$q_;
      $rootScope = _$rootScope_;
      $httpBackend = _$httpBackend_;
      CsdmCodeService = _CsdmCodeService_;
      CsdmDeviceService = _CsdmDeviceService_;
      CsdmUnusedAccountsService = _CsdmUnusedAccountsService_;

      $httpBackend.whenGET('https://identity.webex.com/identity/scim/null/v1/Users/me').respond({});
      $httpBackend.whenGET('https://csdm-integration.wbx2.com/csdm/api/v1/organization/null/devices/?type=huron').respond(initialHuronDevices);
      $httpBackend.whenGET('https://csdm-integration.wbx2.com/csdm/api/v1/organization/null/devices?checkDisplayName=false&checkOnline=false').respond(initialDevices);
      $httpBackend.whenGET('https://csdm-integration.wbx2.com/csdm/api/v1/organization/null/devices').respond(initialDevices);
      $httpBackend.whenGET('https://csdm-integration.wbx2.com/csdm/api/v1/organization/null/nonExistingDevices').respond([]);
      $httpBackend.whenGET('https://csdm-integration.wbx2.com/csdm/api/v1/organization/null/codes').respond(codes);
      $httpBackend.whenGET('https://csdm-integration.wbx2.com/csdm/api/v1/organization/null/places/?shallow=true&type=all').respond(accounts);

      spyOn(CsdmCodeService, 'deleteItem').and.returnValue($q.when());
      spyOn(CsdmDeviceService, 'deleteItem').and.returnValue($q.when());
      spyOn(CsdmUnusedAccountsService, 'deleteAccount').and.returnValue($q.when());
      spyOn(fakeModal, 'close');

      controller = $controller('RemDeviceController', {
        $modalInstance: fakeModal,
        deviceOrCode: deviceOrCode
      });

      CsdmDataModelService.getPlacesMap();
      $httpBackend.flush();
    }));

    afterEach(function () {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });

    it('should call CsdmCodeService to delete a code', function () {
      controller.deviceOrCode = {
        needsActivation: true,
        isCode: true,
        url: code2Url
      };
      controller.deleteDeviceOrCode();
      $rootScope.$digest();

      expect(fakeModal.close).toHaveBeenCalled();
      expect(CsdmCodeService.deleteItem).toHaveBeenCalledWith(controller.deviceOrCode);
    });

    it('should call CsdmUnusedAccountsService to delete an unused account', function () {
      controller.deviceOrCode = {
        needsActivation: false,
        isUnused: true,
        isCloudberryDevice: true,
        url: 'fake url unused'
      };
      controller.deleteDeviceOrCode();
      $rootScope.$digest();

      expect(fakeModal.close).toHaveBeenCalled();
      expect(CsdmUnusedAccountsService.deleteAccount).toHaveBeenCalled();
    });

    it('should call CsdmDeviceService to delete a Cloudberry device', function () {
      controller.deviceOrCode = {
        needsActivation: false,
        isUnused: false,
        type: 'cloudberry',
        isCloudberryDevice: true,
        url: device1Url,
        cisUuid: cisUidOfPlace
      };
      controller.deleteDeviceOrCode();
      $rootScope.$digest();

      expect(fakeModal.close).toHaveBeenCalled();
      expect(CsdmDeviceService.deleteItem).toHaveBeenCalledWith(controller.deviceOrCode);
    });

    it('should call CsdmHuronDeviceService to delete a Huron device', function () {
      controller.deviceOrCode = {
        needsActivation: false,
        isUnused: false,
        type: 'huron',
        isHuronDevice: true,
        url: huronDevice2Url,
        cisUuid: '68351854-Place2WithHuronDevice-c9c844421ec2'
      };
      controller.deleteDeviceOrCode();
      $rootScope.$digest();

      expect(fakeModal.close).toHaveBeenCalled();
      expect(CsdmHuronDeviceService.deleteItem).toHaveBeenCalled();
    });
  });
});
