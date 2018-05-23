'use strict';

var testModule = require('../index').default;
var testData = {
  testOrgId: 'acb14e01-d869-47e4-a595-e67453279b08',
  conferenceService: [
    {
      license: {
        siteUrl: 'test.qa.webex.com',
      },
    },
    {
      license: {
        siteUrl: 'testabc.webex.com',
      },
    },
  ],
  conferenceServiceLinked: [
    {
      license: {
        linkedSiteUrl: 'testLinked.qa.webex.com',
      },
    },
    {
      license: {
        linkedSiteUrl: 'testabcLinked.webex.com',
      },
    },
  ],
  classicSitesSupport: [false, true],
};

describe('WebexMetricsService', function () {
  function init() {
    this.initModules(testModule, 'WebExApp');
    this.injectDependencies('$httpBackend', '$q', 'Authinfo', 'Config', 'FeatureToggleService', 'WebexMetricsService', 'WebExApiGatewayService');
    initDependencySpies.apply(this);
  }

  function initDependencySpies() {
    spyOn(this.Authinfo, 'getOrgId').and.returnValue(testData.testOrgId);
    this.identityMe = 'https://identity.webex.com/identity/scim/' + testData.testOrgId + '/v1/Users/me';

    this.getUserMe = getJSONFixture('core/json/customerReports/me.json');
    this.$httpBackend.whenGET(this.identityMe).respond(200, this.getUserMe);

    spyOn(this.Authinfo, 'getConferenceServicesWithoutSiteUrl').and.returnValue(testData.conferenceService);
    spyOn(this.Authinfo, 'getConferenceServicesWithLinkedSiteUrl').and.returnValue(testData.conferenceServiceLinked);
    spyOn(this.Authinfo, 'isCisco').and.returnValue(true);
    spyOn(this.Config, 'isIntegration').and.returnValue(true);

    spyOn(this.FeatureToggleService, 'webexMEIGetStatus').and.returnValue(true);
    spyOn(this.FeatureToggleService, 'webexSystemGetStatus').and.returnValue(false);
    spyOn(this.WebExApiGatewayService, 'siteFunctions').and.returnValue(this.$q.resolve([true, true]));
    // checkWebexAccessiblity
    this.WebExApiGatewayService = {
      siteFunctions: function (url) {
        var defer = this.$q.defer();
        defer.resolve({
          siteUrl: url,
        });
        return defer.promise;
      },
    };
  }

  beforeEach(init);

  afterEach(function () {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  it('should get the metrics site list from me properties', function () {
    spyOn(this.Authinfo, 'isCustomerLaunchedFromPartner').and.returnValue(false);

    this.WebexMetricsService.getMetricsSites().then(function (data) {
      expect(data).toEqual(['betatrain.webex.com', 'blessedorigin.webex.com', 'go.webex.com']);
    });
    this.$httpBackend.flush();
  });

  it('should get metrics site list from conference', function () {
    spyOn(this.Authinfo, 'isCustomerLaunchedFromPartner').and.returnValue(true);

    this.WebexMetricsService.getMetricsSites().then(function (data) {
      expect(data).toEqual(['go.webex.com', 'testabc.webex.com', 'testabcLinked.webex.com']);
    });
  });

  it('should return true if MEI feature toggle is on', function () {
    expect(this.WebexMetricsService.isMEIFeatureToggleOn()).toBeTruthy();
  });

  it('should return false if system feature toggle is off', function () {
    expect(this.WebexMetricsService.isSystemFeatureToggleOn()).toBeFalsy();
  });

  it('should check the classic enabled and get the classic sites', function () {
    this.WebexMetricsService.hasClassicEnabled().then(function (hasClassicSite) {
      expect(hasClassicSite).toBe(false);
    });
  });

  it('should get the classic sites', function () {
    expect(this.WebexMetricsService.getClassicSites()).toEqual(['test.qa.webex.com', 'testabc.webex.com']);
  });

  it('should get the true', function () {
    expect(this.WebexMetricsService.isAnySupported(testData.classicSitesSupport)).toBeTruthy();
  });

  it('check checkWebexAccessiblity', function () {
    spyOn(this.Authinfo, 'isCustomerLaunchedFromPartner').and.returnValue(false);
    var mx = this.WebexMetricsService;
    mx.checkWebexAccessiblity().then(function (results) {
      expect(mx.isAnySupported(results)).toBeTruthy();
    });
    this.$httpBackend.flush();
  });
});
