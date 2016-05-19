(function () {
  'use strict';

  describe('Chat Template Service', function () {

    var $httpBackend, $q, BrandService, CTService, logoUrlDeferred;
    var orgId = 'a-b-c-d';
    var logoUrl = 'logoUrl';
    var logoResponse = 'logo';
    var spiedAuthinfo = {
      getOrgId: jasmine.createSpy('getOrgId').and.returnValue(orgId)
    };
    beforeEach(module('Sunlight'));
    beforeEach(module(function ($provide) {
      $provide.value("Authinfo", spiedAuthinfo);
    }));
    beforeEach(inject(function (_$q_, _$httpBackend_, _BrandService_, _CTService_) {
      $q = _$q_;
      $httpBackend = _$httpBackend_;
      BrandService = _BrandService_;
      CTService = _CTService_;
      logoUrlDeferred = $q.defer();
      return spyOn(BrandService, 'getLogoUrl').and.returnValue(logoUrlDeferred.promise);
    }));
    afterEach(function () {
      $httpBackend.flush();
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });

    it('should return image data when logo url is present', function () {
      logoUrlDeferred.resolve(logoUrl);
      $httpBackend.expectGET(logoUrl).respond(200, logoResponse);
      CTService.getLogo().then(function (response) {
        expect(angular.equals(response.data, logoResponse)).toBeTruthy();
      });
    });
  });

})();
