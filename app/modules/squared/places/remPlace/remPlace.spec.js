'use strict';

describe('Controller: RemPlaceController', function () {
  var controller, $q, $rootScope, $httpBackend, CsdmPlaceService, place;
  var fakeModal = {
    close: sinon.stub()
  };

  var pWithoutDeviceUrl = 'https://csdm-integration.wbx2.com/csdm/api/v1/organization/testOrg/places/938d9c32-placeWithoutDevice-88d7c1a7f63e';
  var cisUidOfPlace = '938d9c32-placeWithoutDevice-88d7c1a7f63e';
  var pWithDeviceUrl = 'https://csdm-integration.wbx2.com/csdm/api/v1/organization/testOrg/places/a19b308a-PlaceWithDevice-71898e423bec';
  var cisUidOfPlaceWithDev = 'a19b308a-PlaceWithDevice-71898e423bec';
  //var device1Url = 'https://csdm-integration.wbx2.com/csdm/api/v1/organization/584cf4cd-eea7-4c8c-83ee-67d88fc6eab5/devices/c528e32d-ed35-4e00-a20d-d4d3519efb4f';

  beforeEach(angular.mock.module('Squared'));
  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Hercules'));
  beforeEach(angular.mock.module('Sunlight'));
  beforeEach(inject(function (FeatureToggleService, $q, Authinfo) {
    spyOn(FeatureToggleService, 'supports').and.returnValue($q.when(true));
    spyOn(Authinfo, 'getOrgId').and.returnValue('testOrg');
  }));

  describe('Expected Responses', function () {
    beforeEach(inject(function (_$rootScope_, $controller, _$q_, _$httpBackend_, CsdmDataModelService, _CsdmPlaceService_) {
      var initialDevices = getJSONFixture('squared/json/devices.json');
      var codes = getJSONFixture('squared/json/activationCodes.json');
      var accounts = getJSONFixture('squared/json/accounts.json');

      $q = _$q_;
      $rootScope = _$rootScope_;
      $httpBackend = _$httpBackend_;
      CsdmPlaceService = _CsdmPlaceService_;

      $httpBackend.whenGET('https://identity.webex.com/identity/scim/testOrg/v1/Users/me').respond({});
      $httpBackend.whenGET('https://csdm-integration.wbx2.com/csdm/api/v1/organization/testOrg/devices/?type=huron&checkDisplayName=false').respond([]);
      $httpBackend.whenGET('https://csdm-integration.wbx2.com/csdm/api/v1/organization/testOrg/devices?checkDisplayName=false&checkOnline=false').respond(initialDevices);
      $httpBackend.whenGET('https://csdm-integration.wbx2.com/csdm/api/v1/organization/testOrg/devices').respond(initialDevices);
      $httpBackend.whenGET('https://csdm-integration.wbx2.com/csdm/api/v1/organization/testOrg/nonExistingDevices').respond([]);
      $httpBackend.whenGET('https://csdm-integration.wbx2.com/csdm/api/v1/organization/testOrg/codes').respond(codes);
      $httpBackend.whenGET('https://csdm-integration.wbx2.com/csdm/api/v1/organization/testOrg/places/?shallow=true&type=all').respond(accounts);
      $httpBackend.whenGET('https://csdm-integration.wbx2.com/csdm/api/v1/organization/testOrg/devices/?type=huron').respond([]);

      spyOn(CsdmPlaceService, 'deleteItem').and.returnValue($q.when());
      spyOn(fakeModal, 'close');

      controller = $controller('RemPlaceController', {
        $modalInstance: fakeModal,
        place: place
      });

      CsdmDataModelService.getPlacesMap();
      $httpBackend.flush();
    }));

    afterEach(function () {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });


    it('should call CsdmDeviceService to delete a Cloudberry place (without devices)', function () {
      controller.place = {
        type: 'cloudberry',
        url: pWithoutDeviceUrl,
        cisUuid: cisUidOfPlace,
        isPlace: true
      };
      controller.deletePlace();
      $rootScope.$digest();

      expect(fakeModal.close).toHaveBeenCalled();
      expect(CsdmPlaceService.deleteItem).toHaveBeenCalledWith(controller.place);
    });

    it('should call CsdmDeviceService to delete a Cloudberry place (with devices)', function () {
      controller.place = {
        type: 'cloudberry',
        url: pWithDeviceUrl,
        cisUuid: cisUidOfPlaceWithDev,
        isPlace: true
      };
      controller.deletePlace();
      $rootScope.$digest();

      expect(fakeModal.close).toHaveBeenCalled();
      expect(CsdmPlaceService.deleteItem).toHaveBeenCalledWith(controller.place);
    });

    it('should call CsdmDeviceService to delete a Huron place', function () {
      controller.place = {
        needsActivation: false,
        isUnused: false,
        type: 'huron',
        isHuronDevice: true,
        url: 'fake url',
        isPlace: true
      };
      controller.deletePlace();
      $rootScope.$digest();

      expect(fakeModal.close).toHaveBeenCalled();
      expect(CsdmPlaceService.deleteItem).toHaveBeenCalled();
    });
  });
});
