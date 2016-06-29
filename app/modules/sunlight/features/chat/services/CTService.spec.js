'use strict';

describe('Chat Template Service', function () {

  var $httpBackend, $q, BrandService, CTService, logoUrlDeferred;
  var orgId = 'a-b-c-d';
  var logoUrl = 'logoUrl';
  var logoResponse = 'logo';
  var appName = 'testApp.ciscoservice.com';
  var templateId = 'abcd';

  var spiedUrlConfig = {
    getSunlightBubbleUrl: jasmine.createSpy('getSunlightBubbleUrl').and.returnValue(appName)
  };
  var spiedAuthinfo = {
    getOrgId: jasmine.createSpy('getOrgId').and.returnValue(orgId)
  };

  beforeEach(angular.mock.module('Sunlight'));
  beforeEach(angular.mock.module(function ($provide) {
    $provide.value("UrlConfig", spiedUrlConfig);
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

  it('should return image data when logo url is present', function () {
    logoUrlDeferred.resolve(logoUrl);
    $httpBackend.expectGET(logoUrl).respond(200, logoResponse);
    CTService.getLogo().then(function (response) {
      expect(angular.equals(response.data, logoResponse)).toBeTruthy();
    });
    $httpBackend.flush();
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should generate chat template script when template id is provided', function () {
    var result = CTService.generateCodeSnippet(templateId);
    expect(result).toContainText(templateId);
    expect(result).toContainText(orgId);
    expect(result).toContainText(appName);
  });
});
