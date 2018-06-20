'use strict';

describe('Controller: RemDeviceController', function () {
  var controller, $q, $rootScope, $httpBackend, CsdmDeviceService, CsdmHuronDeviceService, CsdmPlaceService, CsdmConverter, device;
  var fakeModal = {
    close: jasmine.createSpy('close'),
  };

  var cisUidOfPlace = 'a19b308a-PlaceWithDevice-71898e423bec';
  var device1Url = 'https://csdm-intb.ciscospark.com/csdm/api/v1/organization/584cf4cd-eea7-4c8c-83ee-67d88fc6eab5/devices/c528e32d-ed35-4e00-a20d-d4d3519efb4f';
  var huronDevice2Url = 'https://cmi.huron-int.com/api/v1/voice/customers/3a6ff373-unittest-a27460e0ac5c/sipendpoints/2c586b22-hurondev_inplace2-ace151f631fa';

  beforeEach(angular.mock.module('Squared'));
  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Hercules'));
  beforeEach(angular.mock.module('Sunlight'));
  beforeEach(inject(function (FeatureToggleService, $q, CsdmHuronOrgDeviceService) {
    CsdmHuronDeviceService = CsdmHuronOrgDeviceService.create();

    spyOn(FeatureToggleService, 'supports').and.returnValue($q.resolve(true));
    spyOn(CsdmHuronOrgDeviceService, 'create').and.returnValue(CsdmHuronDeviceService);
    spyOn(CsdmHuronDeviceService, 'deleteItem').and.returnValue($q.resolve());
  }));

  describe('Expected Responses', function () {
    beforeEach(inject(function (_$rootScope_, $controller, _$q_, _$httpBackend_, _CsdmDeviceService_, _CsdmPlaceService_, _CsdmConverter_) {
      var initialDevices = getJSONFixture('squared/json/devices.json');
      var accounts = getJSONFixture('squared/json/accounts.json');
      var initialHuronDevices = getJSONFixture('squared/json/huronDevices.json');

      $q = _$q_;
      $rootScope = _$rootScope_;
      $httpBackend = _$httpBackend_;
      CsdmDeviceService = _CsdmDeviceService_;
      CsdmPlaceService = _CsdmPlaceService_;
      CsdmConverter = _CsdmConverter_;

      $httpBackend.whenGET('https://identity.webex.com/identity/scim/null/v1/Users/me').respond({});
      $httpBackend.whenGET('https://csdm-intb.ciscospark.com/csdm/api/v1/organization/null/devices/?type=huron').respond(initialHuronDevices);
      $httpBackend.whenGET('https://csdm-intb.ciscospark.com/csdm/api/v1/organization/null/devices?checkDisplayName=false&checkOnline=false').respond(initialDevices);
      $httpBackend.whenGET('https://csdm-intb.ciscospark.com/csdm/api/v1/organization/null/devices').respond(initialDevices);
      $httpBackend.whenGET('https://csdm-intb.ciscospark.com/csdm/api/v1/organization/null/nonExistingDevices').respond([]);
      $httpBackend.whenGET('https://csdm-intb.ciscospark.com/csdm/api/v1/organization/null/places/?shallow=true&type=all').respond(accounts);

      spyOn(CsdmDeviceService, 'deleteItem').and.returnValue($q.resolve());
      spyOn(CsdmPlaceService, 'deleteItem').and.returnValue($q.resolve());

      controller = $controller('RemDeviceController', {
        $modalInstance: fakeModal,
        device: device,
      });
    }));

    afterEach(function () {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });

    it('should call CsdmDeviceService to delete a Cloudberry device', function () {
      controller.device = CsdmConverter.convertCloudberryDevice({
        type: 'cloudberry',
        url: device1Url,
        cisUuid: cisUidOfPlace,
      });
      controller.deleteDevice();
      $rootScope.$digest();

      expect(fakeModal.close).toHaveBeenCalled();
      expect(CsdmDeviceService.deleteItem).toHaveBeenCalledWith(controller.device);
    });

    it('should call CsdmHuronDeviceService to delete a Huron device', function () {
      controller.device = CsdmConverter.convertHuronDevice({
        needsActivation: false,
        type: 'huron',
        url: huronDevice2Url,
        cisUuid: '68351854-Place2WithHuronDevice-c9c844421ec2',
      });
      controller.deleteDevice();
      $rootScope.$digest();

      expect(fakeModal.close).toHaveBeenCalled();
      expect(CsdmHuronDeviceService.deleteItem).toHaveBeenCalled();
    });
  });
});
