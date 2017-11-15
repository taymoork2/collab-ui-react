import { CTService } from './CTService';

describe('Chat Template Service', function () {
  let $httpBackend, $q, BrandService, CTService: CTService, logoUrlDeferred, orgSettingsDeferred;
  const orgId = 'a-b-c-d';
  const logoUrl = 'https://www.example.com/logo.png';
  const logoResponse = 'logo';
  const appName = 'testApp.ciscoservice.com';
  const templateId = 'abcd';
  const orgSettings = {
    logoUrl: logoUrl,
  };

  const spiedUrlConfig = {
    getSunlightBubbleUrl: jasmine.createSpy('getSunlightBubbleUrl').and.returnValue(appName),
  };
  const spiedAuthinfo = {
    getOrgId: jasmine.createSpy('getOrgId').and.returnValue(orgId),
  };

  beforeEach(angular.mock.module('Sunlight'));
  beforeEach(angular.mock.module('Hercules'));
  beforeEach(angular.mock.module(function ($provide) {
    $provide.value('UrlConfig', spiedUrlConfig);
    $provide.value('Authinfo', spiedAuthinfo);
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
    const result = CTService.generateCodeSnippet(templateId);
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

  it('should return getOverviewPageCards length as 5, if isVirtualChatAssistantEnabled is true', function () {
    const result = CTService.getOverviewPageCards('chat', false, true);
    expect(result.length).toBe(5);
  });

  it('should return getOverviewPageCards length as 5, if isVirtualChatAssistantEnabled is false', function () {
    const result = CTService.getOverviewPageCards('chat', false, false);
    expect(result.length).toBe(4);
  });
});
