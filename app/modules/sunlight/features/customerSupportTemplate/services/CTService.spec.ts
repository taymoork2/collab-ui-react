describe('Chat Template Service', function () {
  const orgId = 'a-b-c-d';
  const orgName = 'abcdOrg';
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
    getOrgName: jasmine.createSpy('getOrgName').and.returnValue(orgName),
  };

  beforeEach(function () {
    angular.mock.module('Sunlight');
    angular.mock.module('Hercules');
    angular.mock.module(function ($provide) {
      $provide.value('UrlConfig', spiedUrlConfig);
      $provide.value('Authinfo', spiedAuthinfo);
    });
    this.injectDependencies(
      '$q',
      '$httpBackend',
      'BrandService',
      'CTService',
    );
    this.logoUrlDeferred = this.$q.defer();
    this.orgSettingsDeferred = this.$q.defer();
    spyOn(this.BrandService, 'getLogoUrl').and.returnValue(this.logoUrlDeferred.promise);
    spyOn(this.BrandService, 'getSettings').and.returnValue(this.orgSettingsDeferred.promise);
  });

  it('should return image data when logo url is present', function () {
    this.logoUrlDeferred.resolve(logoUrl);
    this.$httpBackend.expectGET(logoUrl).respond(200, logoResponse);
    this.CTService.getLogo().then((response) => {
      expect(angular.equals(response.data, logoResponse)).toBeTruthy();
    });
    this.$httpBackend.flush();
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  it('should generate chat template script when template id is provided', function () {
    const result = this.CTService.generateCodeSnippet(templateId);
    expect(result).toContainText(templateId);
    expect(result).toContainText(orgId);
    expect(result).toContainText(appName);
  });

  it('should return a promise that resolves to a url, if getting org setting succeeds', function () {
    this.orgSettingsDeferred.resolve(orgSettings);
    return this.CTService.getLogoUrl().then(function (url) {
      expect(angular.equals(url, logoUrl)).toBeTruthy();
    });
  });

  it('should return getOverviewPageCards length as 5, if isVirtualChatAssistantEnabled is true', function () {
    const result = this.CTService.getOverviewPageCards('chat', false, true);
    expect(result.length).toBe(5);
  });

  it('should return getOverviewPageCards length as 5, if isVirtualChatAssistantEnabled is false', function () {
    const result = this.CTService.getOverviewPageCards('chat', false, false);
    expect(result.length).toBe(4);
  });
});
