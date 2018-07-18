'use strict';

describe('Controller: RemDeviceController', function () {
  var controller, $controller, $q, $rootScope, $httpBackend, CsdmDeviceService, CsdmHuronDeviceService, CsdmPlaceService, CsdmConverter, CsdmLyraConfigurationService, FeatureToggleService, device;
  var fakeModal;

  var cisUidOfPlace = 'a19b308a-PlaceWithDevice-71898e423bec';
  var device1Url = 'https://csdm-intb.ciscospark.com/csdm/api/v1/organization/584cf4cd-eea7-4c8c-83ee-67d88fc6eab5/devices/c528e32d-ed35-4e00-a20d-d4d3519efb4f';
  var huronDevice2Url = 'https://cmi.huron-int.com/api/v1/voice/customers/3a6ff373-unittest-a27460e0ac5c/sipendpoints/2c586b22-hurondev_inplace2-ace151f631fa';

  beforeEach(angular.mock.module('Squared'));
  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Hercules'));
  beforeEach(angular.mock.module('Sunlight'));
  beforeEach(inject(function (_FeatureToggleService_, $q, _$controller_, CsdmHuronOrgDeviceService) {
    $controller = _$controller_;
    FeatureToggleService = _FeatureToggleService_;
    CsdmHuronDeviceService = CsdmHuronOrgDeviceService.create();

    spyOn(FeatureToggleService, 'supports').and.returnValue($q.resolve(true));
    spyOn(CsdmHuronOrgDeviceService, 'create').and.returnValue(CsdmHuronDeviceService);
    spyOn(CsdmHuronDeviceService, 'deleteItem').and.returnValue($q.resolve());

    fakeModal = {
      close: jasmine.createSpy('close'),
    };
  }));

  describe('Expected Responses', function () {
    beforeEach(inject(function (_$rootScope_, _$q_, _$httpBackend_, _CsdmDeviceService_, _CsdmPlaceService_, _CsdmConverter_, _CsdmLyraConfigurationService_) {
      var initialDevices = getJSONFixture('squared/json/devices.json');
      var accounts = getJSONFixture('squared/json/accounts.json');
      var initialHuronDevices = getJSONFixture('squared/json/huronDevices.json');

      $q = _$q_;
      $rootScope = _$rootScope_;
      $httpBackend = _$httpBackend_;
      CsdmDeviceService = _CsdmDeviceService_;
      CsdmPlaceService = _CsdmPlaceService_;
      CsdmConverter = _CsdmConverter_;
      CsdmLyraConfigurationService = _CsdmLyraConfigurationService_;

      $httpBackend.whenGET('https://identity.webex.com/identity/scim/null/v1/Users/me').respond({});
      $httpBackend.whenGET('https://csdm-intb.ciscospark.com/csdm/api/v1/organization/null/devices/?type=huron').respond(initialHuronDevices);
      $httpBackend.whenGET('https://csdm-intb.ciscospark.com/csdm/api/v1/organization/null/devices?checkDisplayName=false&checkOnline=false').respond(initialDevices);
      $httpBackend.whenGET('https://csdm-intb.ciscospark.com/csdm/api/v1/organization/null/devices').respond(initialDevices);
      $httpBackend.whenGET('https://csdm-intb.ciscospark.com/csdm/api/v1/organization/null/nonExistingDevices').respond([]);
      $httpBackend.whenGET('https://csdm-intb.ciscospark.com/csdm/api/v1/organization/null/places/?shallow=true&type=all').respond(accounts);

      spyOn(CsdmDeviceService, 'deleteItem').and.returnValue($q.resolve());
      spyOn(CsdmPlaceService, 'deleteItem').and.returnValue($q.resolve());
    }));

    function initController() {
      controller = $controller('RemDeviceController', {
        $modalInstance: fakeModal,
        device: device,
        FeatureToggleService: FeatureToggleService,
      });
      $rootScope.$apply();
    }

    afterEach(function () {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });

    describe('when the csdm-device-delete-configuration-option is disabled', function () {
      beforeEach(function () {
        spyOn(FeatureToggleService, 'csdmDeviceDeleteConfigurationOptionGetStatus').and.returnValue($q.resolve(false));
        spyOn(CsdmLyraConfigurationService, 'deleteConfig').and.returnValue($q.resolve());
        initController();
      });

      it('should call CsdmDeviceService and CsdmLyraConfigurationService to delete a Cloudberry device and its config', function () {
        controller.device = CsdmConverter.convertCloudberryDevice({
          type: 'cloudberry',
          url: device1Url,
          cisUuid: cisUidOfPlace,
        });
        controller.deleteDevice();
        $rootScope.$digest();

        expect(fakeModal.close).toHaveBeenCalled();
        expect(CsdmDeviceService.deleteItem).toHaveBeenCalledWith(controller.device);
        expect(CsdmLyraConfigurationService.deleteConfig).toHaveBeenCalled();
      });

      it('should call CsdmHuronDeviceService and CsdmLyraConfigurationService to delete a Huron device and its config', function () {
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
        expect(CsdmLyraConfigurationService.deleteConfig).toHaveBeenCalled();
      });
    });

    describe('when the csdm-device-delete-configuration-option toggle is enabled', function () {
      beforeEach(function () {
        spyOn(FeatureToggleService, 'csdmDeviceDeleteConfigurationOptionGetStatus').and.returnValue($q.resolve(true));
        spyOn(CsdmLyraConfigurationService, 'deleteConfig').and.returnValue($q.resolve());
        initController();
      });

      it('should call CsdmDeviceService to delete a Cloudberry device', function () {
        controller.deleteConfig = false;
        controller.device = CsdmConverter.convertCloudberryDevice({
          type: 'cloudberry',
          url: device1Url,
          cisUuid: cisUidOfPlace,
        });
        controller.deleteDevice();
        $rootScope.$digest();

        expect(fakeModal.close).toHaveBeenCalled();
        expect(CsdmDeviceService.deleteItem).toHaveBeenCalledWith(controller.device);
        expect(CsdmLyraConfigurationService.deleteConfig).not.toHaveBeenCalled();
      });

      it('should call CsdmHuronDeviceService to delete a Huron device', function () {
        controller.deleteConfig = false;
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
        expect(CsdmLyraConfigurationService.deleteConfig).not.toHaveBeenCalled();
      });

      it('should call CsdmDeviceService and CsdmLyraConfigurationService to delete a Cloudberry device and its config', function () {
        controller.deleteConfig = true;
        controller.device = CsdmConverter.convertCloudberryDevice({
          type: 'cloudberry',
          url: device1Url,
          cisUuid: cisUidOfPlace,
        });
        controller.deleteDevice();
        $rootScope.$digest();

        expect(fakeModal.close).toHaveBeenCalled();
        expect(CsdmDeviceService.deleteItem).toHaveBeenCalledWith(controller.device);
        expect(CsdmLyraConfigurationService.deleteConfig).toHaveBeenCalled();
      });

      it('should call CsdmHuronDeviceService and CsdmLyraConfigurationService to delete a Huron device and its config', function () {
        controller.deleteConfig = true;
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
        expect(CsdmLyraConfigurationService.deleteConfig).toHaveBeenCalled();
      });
    });

    describe('when the configuration delete fails with 404', function () {
      beforeEach(function () {
        spyOn(FeatureToggleService, 'csdmDeviceDeleteConfigurationOptionGetStatus').and.returnValue($q.resolve(false));
        spyOn(CsdmLyraConfigurationService, 'deleteConfig').and.returnValue($q.reject({ status: 404 }));
        initController();
      });

      it('should still delete the device', function () {
        controller.deleteConfig = true;
        controller.device = CsdmConverter.convertCloudberryDevice({
          type: 'cloudberry',
          url: device1Url,
          cisUuid: cisUidOfPlace,
        });
        controller.deleteDevice();
        $rootScope.$digest();

        expect(fakeModal.close).toHaveBeenCalled();
        expect(CsdmDeviceService.deleteItem).toHaveBeenCalledWith(controller.device);
        expect(CsdmLyraConfigurationService.deleteConfig).toHaveBeenCalled();
      });
    });

    describe('when the configuration delete fails with any other code', function () {
      beforeEach(function () {
        spyOn(FeatureToggleService, 'csdmDeviceDeleteConfigurationOptionGetStatus').and.returnValue($q.resolve(false));
        spyOn(CsdmLyraConfigurationService, 'deleteConfig').and.returnValue($q.reject({ status: 500 }));
        initController();
      });

      it('should not delete the device', function () {
        controller.deleteConfig = true;
        controller.device = CsdmConverter.convertCloudberryDevice({
          type: 'cloudberry',
          url: device1Url,
          cisUuid: cisUidOfPlace,
        });
        controller.deleteDevice();
        $rootScope.$digest();

        expect(fakeModal.close).not.toHaveBeenCalled();
        expect(CsdmDeviceService.deleteItem).not.toHaveBeenCalled();
        expect(CsdmLyraConfigurationService.deleteConfig).toHaveBeenCalled();
      });
    });
  });
});
