'use strict';

describe('Service: CsdmPlacesService', function () {
  beforeEach(angular.mock.module('Squared'));

  var $httpBackend;
  var $rootScope;

  var CsdmPlaceService;
  var placesUrl = 'https://csdm-integration.wbx2.com/csdm/api/v1/organization/null/places/';
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

  describe('feature not enabled', function () {
    beforeEach(inject(function (FeatureToggleService, $q) {
      spyOn(FeatureToggleService, 'supports').and.returnValue($q.when(false));
    }));

    it('get device list should return empty ', function () {
      $httpBackend.whenGET(placesUrl).respond({});
      var promiseExecuted;
      CsdmPlaceService.getPlacesList().then(function () {
        fail();
      }).catch(function () {
        promiseExecuted = true;
      });

      $rootScope.$apply();
      expect(promiseExecuted).toBe(true);
    });
  });

  describe('feature enabled', function () {
    beforeEach(inject(function (FeatureToggleService, $q) {
      spyOn(FeatureToggleService, 'supports').and.returnValue($q.when(true));
    }));

    it('get device list should return a non empty list ', function () {
      $httpBackend.whenGET(placesUrl).respond(accounts);

      var promiseExecuted;
      CsdmPlaceService.getPlacesList().then(function (placeList) {
        expect(_.keys(placeList).length).toBe(2);
        promiseExecuted = true;
      });

      $httpBackend.flush();
      $rootScope.$apply();
      expect(promiseExecuted).toBe(true);
    });
  });
});
