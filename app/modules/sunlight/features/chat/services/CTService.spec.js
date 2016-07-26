'use strict';

describe('Chat Template Service', function () {

  var $httpBackend, $q, BrandService, CTService, logoUrlDeferred, orgSettingsDeferred;
  var orgId = 'a-b-c-d';
  var logoUrl = 'https://www.example.com/logo.png';
  var logoResponse = 'logo';
  var appName = 'testApp.ciscoservice.com';
  var templateId = 'abcd';
  var orgSettings = {
    'logoUrl': logoUrl
  };

  var spiedUrlConfig = {
    getSunlightBubbleUrl: jasmine.createSpy('getSunlightBubbleUrl').and.returnValue(appName)
  };
  var spiedAuthinfo = {
    getOrgId: jasmine.createSpy('getOrgId').and.returnValue(orgId)
  };

  beforeEach(module('Sunlight'));
  beforeEach(module('Hercules'));
  beforeEach(module(function ($provide) {
    $provide.value("UrlConfig", spiedUrlConfig);
    $provide.value("Authinfo", spiedAuthinfo);
  }));

  beforeEach(inject(function (_$q_, _$httpBackend_, _BrandService_, _CTService_) {
    $q = _$q_;
    $httpBackend = _$httpBackend_;
    BrandService = _BrandService_;
    CTService = _CTService_;
    logoUrlDeferred = $q.defer();
    orgSettingsDeferred = $q.defer();
    spyOn(BrandService, 'getLogoUrl').and.returnValue(logoUrlDeferred.promise);
    return spyOn(BrandService, 'getSettings').and.returnValue(orgSettingsDeferred.promise);
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

  it('should return a promise that resolves to a url, if getting org setting succeeds', function () {
    orgSettingsDeferred.resolve(orgSettings);
    return CTService.getLogoUrl().then(function (url) {
      expect(angular.equals(url, logoUrl)).toBeTruthy();
    });
  });
});
