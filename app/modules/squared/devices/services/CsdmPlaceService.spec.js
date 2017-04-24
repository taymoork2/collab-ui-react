'use strict';

describe('Service: CsdmPlacesService', function () {
  beforeEach(angular.mock.module('Squared'));

  var $httpBackend;
  var $rootScope;

  var CsdmPlaceService;
  var placesUrl = 'https://csdm-intb.ciscospark.com/csdm/api/v1/organization/null/places/?shallow=true&type=all';
  var accounts = getJSONFixture('squared/json/accounts.json');

  beforeEach(inject(function (_CsdmPlaceService_, _$httpBackend_, _$rootScope_) {
    CsdmPlaceService = _CsdmPlaceService_;
    $httpBackend = _$httpBackend_;
    $rootScope = _$rootScope_;
    $httpBackend.whenGET('https://identity.webex.com/identity/scim/null/v1/Users/me').respond({});

  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('getPlacesList()', function () {
    it('get device list should return a non empty list ', function () {
      $httpBackend.whenGET(placesUrl).respond(accounts);

      var promiseExecuted;
      CsdmPlaceService.getPlacesList().then(function (placeList) {
        expect(_.keys(placeList).length).toBe(5);
        expect(placeList["https://csdm-intb.ciscospark.com/csdm/api/v1/organization/testOrg/places/a19b308a-Place1WithHuronDevice-71898e423bec"].type).toBe('huron');
        expect(placeList["https://csdm-intb.ciscospark.com/csdm/api/v1/organization/testOrg/places/a19b308a-PlaceWithDevice-71898e423bec"].type).toBe('cloudberry');
        promiseExecuted = true;
      });

      $httpBackend.flush();
      $rootScope.$apply();
      expect(promiseExecuted).toBe(true);
    });
  });
});
