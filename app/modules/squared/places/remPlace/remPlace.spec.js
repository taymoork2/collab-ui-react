'use strict';

describe('Controller: RemPlaceController', function () {
  var controller, $q, $rootScope, $httpBackend, CsdmPlaceService, CsdmConverter, place;
  var fakeModal = {
    close: jasmine.createSpy('close'),
  };

  var pWithoutDeviceUrl = 'https://csdm-intb.ciscospark.com/csdm/api/v1/organization/testOrg/places/938d9c32-placeWithoutDevice-88d7c1a7f63e';
  var cisUidOfPlace = '938d9c32-placeWithoutDevice-88d7c1a7f63e';
  var pWithDeviceUrl = 'https://csdm-intb.ciscospark.com/csdm/api/v1/organization/testOrg/places/a19b308a-PlaceWithDevice-71898e423bec';
  var cisUidOfPlaceWithDev = 'a19b308a-PlaceWithDevice-71898e423bec';

  beforeEach(angular.mock.module('Squared'));
  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Hercules'));
  beforeEach(angular.mock.module('Sunlight'));
  beforeEach(inject(function (FeatureToggleService, $q, Authinfo) {
    spyOn(FeatureToggleService, 'supports').and.returnValue($q.resolve(true));
    spyOn(Authinfo, 'getOrgId').and.returnValue('testOrg');
  }));

  describe('Expected Responses', function () {
    beforeEach(inject(function (_$rootScope_, $controller, _$q_, _$httpBackend_, CsdmDataModelService, _CsdmPlaceService_, _CsdmConverter_) {
      var initialDevices = getJSONFixture('squared/json/devices.json');
      var accounts = getJSONFixture('squared/json/accounts.json');

      $q = _$q_;
      $rootScope = _$rootScope_;
      $httpBackend = _$httpBackend_;
      CsdmPlaceService = _CsdmPlaceService_;
      CsdmConverter = _CsdmConverter_;

      $httpBackend.whenGET('https://identity.webex.com/identity/scim/testOrg/v1/Users/me').respond({});
      $httpBackend.whenGET('https://csdm-intb.ciscospark.com/csdm/api/v1/organization/testOrg/devices/?type=huron&checkDisplayName=false').respond([]);
      $httpBackend.whenGET('https://csdm-intb.ciscospark.com/csdm/api/v1/organization/testOrg/devices?checkDisplayName=false&checkOnline=false').respond(initialDevices);
      $httpBackend.whenGET('https://csdm-intb.ciscospark.com/csdm/api/v1/organization/testOrg/devices').respond(initialDevices);
      $httpBackend.whenGET('https://csdm-intb.ciscospark.com/csdm/api/v1/organization/testOrg/nonExistingDevices').respond([]);
      $httpBackend.whenGET('https://csdm-intb.ciscospark.com/csdm/api/v1/organization/testOrg/places/?shallow=true&type=all').respond(accounts);
      $httpBackend.whenGET('https://csdm-intb.ciscospark.com/csdm/api/v1/organization/testOrg/devices/?type=huron').respond([]);

      spyOn(CsdmPlaceService, 'deleteItem').and.returnValue($q.resolve());

      controller = $controller('RemPlaceController', {
        $modalInstance: fakeModal,
        place: place,
      });

      CsdmDataModelService.isBigOrg = $q.resolve(false);
    }));

    afterEach(function () {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });


    it('should call CsdmDeviceService to delete a Cloudberry place (without devices)', function () {
      controller.place = CsdmConverter.convertPlace({
        type: 'cloudberry',
        url: pWithoutDeviceUrl,
        cisUuid: cisUidOfPlace,
      });
      controller.deletePlace();
      $rootScope.$digest();

      expect(fakeModal.close).toHaveBeenCalled();
      expect(CsdmPlaceService.deleteItem).toHaveBeenCalledWith(controller.place);
    });

    it('should call CsdmDeviceService to delete a Cloudberry place (with devices)', function () {
      controller.place = CsdmConverter.convertPlace({
        type: 'cloudberry',
        url: pWithDeviceUrl,
        cisUuid: cisUidOfPlaceWithDev,
      });
      controller.deletePlace();
      $rootScope.$digest();

      expect(fakeModal.close).toHaveBeenCalled();
      expect(CsdmPlaceService.deleteItem).toHaveBeenCalledWith(controller.place);
    });

    it('should call CsdmDeviceService to delete a Huron place', function () {
      controller.place = CsdmConverter.convertPlace({
        type: 'huron',
        isHuronDevice2: function () { return true; },
        url: 'fake url',
      });
      controller.deletePlace();
      $rootScope.$digest();

      expect(fakeModal.close).toHaveBeenCalled();
      expect(CsdmPlaceService.deleteItem).toHaveBeenCalled();
    });
  });
});
