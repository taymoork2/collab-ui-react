'use strict';

describe('Controller: RemDeviceController', function () {
  var controller, $q, $httpBackend, CsdmCodeService, CsdmDeviceService, CsdmHuronOrgDeviceService, CsdmHuronDeviceService, CsdmUnusedAccountsService, deviceOrCode;
  var fakeModal = {
    close: sinon.stub()
  };

  beforeEach(angular.mock.module('Squared'));
  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Hercules'));
  beforeEach(angular.mock.module('Sunlight'));

  describe('Expected Responses', function () {
    beforeEach(inject(function ($controller, _$q_, _$httpBackend_, _CsdmCodeService_, _CsdmDeviceService_, _CsdmHuronOrgDeviceService_, _CsdmUnusedAccountsService_) {
      $q = _$q_;
      $httpBackend = _$httpBackend_;
      CsdmCodeService = _CsdmCodeService_;
      CsdmDeviceService = _CsdmDeviceService_;
      CsdmHuronOrgDeviceService = _CsdmHuronOrgDeviceService_;
      CsdmUnusedAccountsService = _CsdmUnusedAccountsService_;
      $httpBackend.whenGET('https://identity.webex.com/identity/scim/null/v1/Users/me').respond({});
      $httpBackend.whenGET('https://csdm-integration.wbx2.com/csdm/api/v1/organization/null/huronDevices?checkDisplayName=false').respond([]);
      $httpBackend.whenGET('https://csdm-integration.wbx2.com/csdm/api/v1/organization/null/devices?checkOnline=true&checkDisplayName=false').respond([]);
      $httpBackend.whenGET('https://csdm-integration.wbx2.com/csdm/api/v1/organization/null/nonExistingDevices').respond([]);

      CsdmHuronDeviceService = {
        deleteDevice: function () {
          return null;
        }
      };

      spyOn(CsdmCodeService, 'deleteCode').and.returnValue($q.when());
      spyOn(CsdmDeviceService, 'deleteDevice').and.returnValue($q.when());
      spyOn(CsdmHuronDeviceService, 'deleteDevice').and.returnValue($q.when());
      spyOn(CsdmHuronOrgDeviceService, 'create').and.returnValue(CsdmHuronDeviceService);
      spyOn(CsdmUnusedAccountsService, 'deleteAccount').and.returnValue($q.when());
      spyOn(fakeModal, 'close');

      controller = $controller('RemDeviceController', {
        $modalInstance: fakeModal,
        deviceOrCode: deviceOrCode
      });
    }));

    afterEach(function () {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });

    it('should call CsdmCodeService to delete a code', function () {
      controller.deviceOrCode = {
        needsActivation: true
      };
      controller.deleteDeviceOrCode();
      $httpBackend.flush();

      expect(fakeModal.close).toHaveBeenCalled();
      expect(CsdmCodeService.deleteCode).toHaveBeenCalled();
    });

    it('should call CsdmUnusedAccountsService to delete an unused account', function () {
      controller.deviceOrCode = {
        needsActivation: false,
        isUnused: true
      };
      controller.deleteDeviceOrCode();
      $httpBackend.flush();

      expect(fakeModal.close).toHaveBeenCalled();
      expect(CsdmUnusedAccountsService.deleteAccount).toHaveBeenCalled();
    });

    it('should call CsdmDeviceService to delete a Cloudberry device', function () {
      controller.deviceOrCode = {
        needsActivation: false,
        isUnused: false,
        type: 'cloudberry'
      };
      controller.deleteDeviceOrCode();
      $httpBackend.flush();

      expect(fakeModal.close).toHaveBeenCalled();
      expect(CsdmDeviceService.deleteDevice).toHaveBeenCalled();
    });

    it('should call CsdmHuronDeviceService to delete a Huron device', function () {
      controller.deviceOrCode = {
        needsActivation: false,
        isUnused: false,
        type: 'huron'
      };
      controller.deleteDeviceOrCode();
      $httpBackend.flush();

      expect(fakeModal.close).toHaveBeenCalled();
      expect(CsdmHuronDeviceService.deleteDevice).toHaveBeenCalled();
    });
  });
});
