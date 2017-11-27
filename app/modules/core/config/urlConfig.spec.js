'use strict';

describe('UrlConfigSpec', function () {
  beforeEach(angular.mock.module('core.urlconfig'));

  var UrlConfig, $location;

  afterEach(function () {
    UrlConfig = $location = undefined;
  });

  beforeEach(inject(function (_$location_, _UrlConfig_) {
    UrlConfig = _UrlConfig_;
    $location = _$location_;
    spyOn($location, 'host');
  }));


  var devHost = 'localhost';
  var cfeHost = 'cfe-admin.ciscospark.com';
  var intHost = 'int-admin.ciscospark.com';
  var prodHost = 'admin.ciscospark.com';

  var orgId = 'abc123efg456';
  var siteURL = 'webex.com';

  var whenCalling = function (fn, arg) {
    var hosts = {
      dev: devHost,
      cfe: cfeHost,
      integration: intHost,
      prod: prodHost,
    };
    return {
      expectUrlToBe: function (obj) {
        _.each(obj, function (expected, env) {
          var host = hosts[env];
          if (!host) {
            throw new Error('Unknown environment ' + env);
          }
          if (!UrlConfig[fn]) {
            throw new Error('Unknown method ' + fn);
          }
          $location.host.and.returnValue(host);
          var actual = UrlConfig[fn](arg);

          if (expected != actual) {
            throw new Error('Expected ' + fn + ' in ' + env + " to be '" + expected + "' but it was '" + actual + "'");
          }
        });
      },
    };
  };

  afterAll(function () {
    devHost = cfeHost = intHost = prodHost = orgId = siteURL = whenCalling = undefined;
  });

  it('should return correct identity user service url', function () {
    whenCalling('getScimUrl', orgId).expectUrlToBe({
      dev: 'https://identity.webex.com/identity/scim/abc123efg456/v1/Users',
      cfe: 'https://identitybts.webex.com/identity/scim/abc123efg456/v1/Users',
      integration: 'https://identity.webex.com/identity/scim/abc123efg456/v1/Users',
      prod: 'https://identity.webex.com/identity/scim/abc123efg456/v1/Users',
    });
  });

  it('should return correct user reports url', function () {
    whenCalling('getUserReportsUrl', orgId).expectUrlToBe({
      dev: 'https://identity.webex.com/identity/config/abc123efg456/v1/UserReports',
      cfe: 'https://identitybts.webex.com/identity/config/abc123efg456/v1/UserReports',
      integration: 'https://identity.webex.com/identity/config/abc123efg456/v1/UserReports',
      prod: 'https://identity.webex.com/identity/config/abc123efg456/v1/UserReports',
    });
  });

  it('should return correct identity org service url', function () {
    whenCalling('getScomUrl', orgId).expectUrlToBe({
      dev: 'https://identity.webex.com/organization/scim/v1/Orgs',
      cfe: 'https://identitybts.webex.com/organization/scim/v1/Orgs',
      integration: 'https://identity.webex.com/organization/scim/v1/Orgs',
      prod: 'https://identity.webex.com/organization/scim/v1/Orgs',
    });
  });

  it('should return correct admin service url', function () {
    whenCalling('getAdminServiceUrl').expectUrlToBe({
      dev: 'https://atlas-intb.ciscospark.com/admin/api/v1/',
      cfe: 'https://atlas-loada.ciscospark.com/admin/api/v1/',
      integration: 'https://atlas-intb.ciscospark.com/admin/api/v1/',
      prod: 'https://atlas-a.wbx2.com/admin/api/v1/',
    });
  });

  it('should return correct csdm service url', function () {
    whenCalling('getCsdmServiceUrl').expectUrlToBe({
      dev: 'https://csdm-intb.ciscospark.com/csdm/api/v1',
      cfe: 'https://csdm-loada.ciscospark.com/csdm/api/v1',
      integration: 'https://csdm-intb.ciscospark.com/csdm/api/v1',
      prod: 'https://csdm-a.wbx2.com/csdm/api/v1',
    });
  });

  it('should always return locus integration service url', function () {
    whenCalling('getLocusServiceUrl').expectUrlToBe({
      dev: 'https://admin-portal-test-public.wbx2.com/locus',
      cfe: 'https://admin-portal-test-public.wbx2.com/locus',
      integration: 'https://admin-portal-test-public.wbx2.com/locus',
      prod: 'https://admin-portal-test-public.wbx2.com/locus',
    });
  });

  it('should return correct feature toggle service url', function () {
    whenCalling('getFeatureToggleUrl').expectUrlToBe({
      dev: 'https://locus-a.wbx2.com',
      cfe: 'https://locus-loada.ciscospark.com',
      integration: 'https://locus-a.wbx2.com',
      prod: 'https://locus-a.wbx2.com',
    });
  });

  it('should return correct athena service url', function () {
    whenCalling('getAthenaServiceUrl').expectUrlToBe({
      dev: 'https://athena-intb.ciscospark.com/athena/api/v1',
      cfe: 'https://athena-loada.ciscospark.com/athena/api/v1',
      integration: 'https://athena-intb.ciscospark.com/athena/api/v1',
      prod: 'https://athena-a.wbx2.com/athena/api/v1',
    });
  });

  it('should return correct messenger service url', function () {
    whenCalling('getMessengerServiceUrl').expectUrlToBe({
      dev: 'https://msgr-admin.webexconnect.com:443/admin-service/messenger/admin/api/v1',
      cfe: 'https://msgr-admin-bts.webexconnect.com:443/admin-service/messenger/admin/api/v1',
      integration: 'https://msgr-admin.webexconnect.com:443/admin-service/messenger/admin/api/v1',
      prod: 'https://msgr-admin.webexconnect.com:443/admin-service/messenger/admin/api/v1',
    });
  });

  it('should return correct domain mgmt url', function () {
    whenCalling('getDomainManagementUrl', 'foo').expectUrlToBe({
      dev: 'https://identity.webex.com/organization/foo/v1/',
      cfe: 'https://identitybts.webex.com/organization/foo/v1/',
      integration: 'https://identity.webex.com/organization/foo/v1/',
      prod: 'https://identity.webex.com/organization/foo/v1/',
    });
  });

  it('should return correct spark domain mgmt url', function () {
    whenCalling('getSparkDomainManagementUrl').expectUrlToBe({
      dev: 'https://atlas-intb.ciscospark.com/admin/api/v1/',
      cfe: 'https://atlas-loada.ciscospark.com/admin/api/v1/',
      integration: 'https://atlas-intb.ciscospark.com/admin/api/v1/',
      prod: 'https://atlas-a.wbx2.com/admin/api/v1/',
    });
  });

  it('should return correct spark domain check url', function () {
    whenCalling('getSparkDomainCheckUrl').expectUrlToBe({
      dev: '.wbx2.com',
      cfe: '.wbx2.com',
      integration: '.wbx2.com',
      prod: '.ciscospark.com',
    });
  });

  it('should return correct sso setup url', function () {
    whenCalling('getSSOSetupUrl').expectUrlToBe({
      dev: 'https://idbroker.webex.com/idb/idbconfig/',
      cfe: 'https://idbroker.webex.com/idb/idbconfig/',
      integration: 'https://idbroker.webex.com/idb/idbconfig/',
      prod: 'https://idbroker.webex.com/idb/idbconfig/',
    });
  });

  it('should return correct sso test url', function () {
    whenCalling('getSSOTestUrl').expectUrlToBe({
      dev: 'https://idbroker.webex.com/idb/saml2/jsp/spSSOInit.jsp',
      cfe: 'https://idbroker.webex.com/idb/saml2/jsp/spSSOInit.jsp',
      integration: 'https://idbroker.webex.com/idb/saml2/jsp/spSSOInit.jsp',
      prod: 'https://idbroker.webex.com/idb/saml2/jsp/spSSOInit.jsp',
    });
  });

  it('should return correct health check service url', function () {
    whenCalling('getHealthCheckServiceUrl').expectUrlToBe({
      dev: 'https://ciscospark.statuspage.io/index.json',
      cfe: 'https://ciscospark.statuspage.io/index.json',
      integration: 'https://ciscospark.statuspage.io/index.json',
      prod: 'https://ciscospark.statuspage.io/index.json',
    });
  });

  it('should return correct log metrics url', function () {
    whenCalling('getLogMetricsUrl').expectUrlToBe({
      dev: 'https://metrics-a.wbx2.com/metrics/api/v1/metrics',
      cfe: 'https://metrics-a.wbx2.com/metrics/api/v1/metrics',
      integration: 'https://metrics-a.wbx2.com/metrics/api/v1/metrics',
      prod: 'https://metrics-a.wbx2.com/metrics/api/v1/metrics',
    });
  });

  it('should return correct call flow service url', function () {
    whenCalling('getCallflowServiceUrl').expectUrlToBe({
      dev: 'https://admin-portal-test-public.wbx2.com/atlas-server/admin/api/v1/',
      cfe: 'https://admin-portal-test-public.wbx2.com/atlas-server/admin/api/v1/',
      integration: 'https://admin-portal-test-public.wbx2.com/atlas-server/admin/api/v1/',
      prod: 'https://admin-portal-test-public.wbx2.com/atlas-server/admin/api/v1/',
    });
  });

  it('should return correct status page url', function () {
    whenCalling('getStatusPageUrl').expectUrlToBe({
      dev: 'http://status.ciscospark.com/',
      cfe: 'http://status.ciscospark.com/',
      integration: 'http://status.ciscospark.com/',
      prod: 'http://status.ciscospark.com/',
    });
  });

  it('should return correct squared app url', function () {
    whenCalling('getSquaredAppUrl').expectUrlToBe({
      dev: 'squared://',
      cfe: 'squared://',
      integration: 'squared://',
      prod: 'squared://',
    });
  });

  it('should return correct itunes store url', function () {
    whenCalling('getItunesStoreUrl').expectUrlToBe({
      dev: 'http://cs.co/sqios',
      cfe: 'http://cs.co/sqios',
      integration: 'http://cs.co/sqios',
      prod: 'http://cs.co/sqios',
    });
  });

  it('should return correct android store url', function () {
    whenCalling('getAndroidStoreUrl').expectUrlToBe({
      dev: 'http://cs.co/sqandroid',
      cfe: 'http://cs.co/sqandroid',
      integration: 'http://cs.co/sqandroid',
      prod: 'http://cs.co/sqandroid',
    });
  });

  it('should return correct web client url', function () {
    whenCalling('getWebClientUrl').expectUrlToBe({
      dev: 'https://web.ciscospark.com/',
      cfe: 'https://web.ciscospark.com/',
      integration: 'https://web.ciscospark.com/',
      prod: 'https://web.ciscospark.com/',
    });
  });

  it('should return correct hercules url', function () {
    whenCalling('getHerculesUrl').expectUrlToBe({
      dev: 'https://hercules-intb.ciscospark.com/v1',
      cfe: 'https://hercules-loada.ciscospark.com/v1',
      integration: 'https://hercules-intb.ciscospark.com/v1',
      prod: 'https://hercules-a.wbx2.com/v1',
    });
  });

  it('should return correct hercules url v2', function () {
    whenCalling('getHerculesUrlV2').expectUrlToBe({
      dev: 'https://hercules-intb.ciscospark.com/hercules/api/v2',
      cfe: 'https://hercules-loada.ciscospark.com/hercules/api/v2',
      integration: 'https://hercules-intb.ciscospark.com/hercules/api/v2',
      prod: 'https://hercules-a.wbx2.com/hercules/api/v2',
    });
  });

  it('should return correct flag service url', function () {
    whenCalling('getFlagServiceUrl').expectUrlToBe({
      dev: 'https://hercules-intb.ciscospark.com/fls/api/v1',
      cfe: 'https://hercules-loada.ciscospark.com/fls/api/v1',
      integration: 'https://hercules-intb.ciscospark.com/fls/api/v1',
      prod: 'https://hercules-a.wbx2.com/fls/api/v1',
    });
  });

  it('should return correct cdr url', function () {
    whenCalling('getCdrUrl').expectUrlToBe({
      dev: 'https://hades.huron-int.com/api/v1/elasticsearch/',
      cfe: 'https://hades.huron-dev.com/api/v1/elasticsearch/',
      integration: 'https://hades.huron-int.com/api/v1/elasticsearch/',
      prod: 'https://hades.huron-dev.com/api/v1/elasticsearch/',
    });
  });

  it('should return correct USS url', function () {
    whenCalling('getUssUrl').expectUrlToBe({
      dev: 'https://uss-intb.ciscospark.com/',
      cfe: 'https://uss-loada.ciscospark.com/',
      integration: 'https://uss-intb.ciscospark.com/',
      prod: 'https://uss-a.wbx2.com/',
    });
  });

  it('should return correct calliope url', function () {
    whenCalling('getCalliopeUrl').expectUrlToBe({
      dev: 'https://calliope-intb.ciscospark.com/calliope/api/authorization/v1',
      cfe: 'https://calliope-loada.ciscospark.com/calliope/api/authorization/v1',
      integration: 'https://calliope-intb.ciscospark.com/calliope/api/authorization/v1',
      prod: 'https://calliope-a.wbx2.com/calliope/api/authorization/v1',
    });
  });

  it('should return correct certs url', function () {
    whenCalling('getCertsUrl').expectUrlToBe({
      dev: 'https://certs-intb.ciscospark.com/',
      cfe: 'https://certs-loada.ciscospark.com/',
      integration: 'https://certs-intb.ciscospark.com/',
      prod: 'https://certs-a.wbx2.com/',
    });
  });

  it('should return correct wdm url', function () {
    whenCalling('getFeatureUrl').expectUrlToBe({
      dev: 'https://feature-a.wbx2.com/feature/api/v1',
      cfe: 'https://feature-loada.ciscospark.com/feature/api/v1',
      integration: 'https://feature-a.wbx2.com/feature/api/v1',
      prod: 'https://feature-a.wbx2.com/feature/api/v1',
    });
  });

  it('should return correct utilization url', function () {
    whenCalling('getUtilizationServiceUrl').expectUrlToBe({
      dev: 'http://mf-meeting-service.mb-lab.huron.uno/admin/api/v1',
      cfe: 'https://mf-meeting-service.mb-lab.huron.uno/admin/api/v1',
      integration: 'https://mf-meeting-service.mb-lab.huron.uno/admin/api/v1',
      prod: 'https://mf-meeting-service.mb-lab.huron.uno/admin/api/v1',
    });
  });

  it('should return correct webex advanced home url', function () {
    whenCalling('getWebexAdvancedHomeUrl', siteURL).expectUrlToBe({
      dev: 'https://webex.com/dispatcher/AtlasIntegration.do?cmd=GoToSiteAdminHomePage',
      cfe: 'https://webex.com/dispatcher/AtlasIntegration.do?cmd=GoToSiteAdminHomePage',
      integration: 'https://webex.com/dispatcher/AtlasIntegration.do?cmd=GoToSiteAdminHomePage',
      prod: 'https://webex.com/dispatcher/AtlasIntegration.do?cmd=GoToSiteAdminHomePage',
    });
  });

  it('should return correct webex advanced edit url', function () {
    whenCalling('getWebexAdvancedEditUrl', siteURL).expectUrlToBe({
      dev: 'https://webex.com/dispatcher/AtlasIntegration.do?cmd=GoToSiteAdminEditUserPage',
      cfe: 'https://webex.com/dispatcher/AtlasIntegration.do?cmd=GoToSiteAdminEditUserPage',
      integration: 'https://webex.com/dispatcher/AtlasIntegration.do?cmd=GoToSiteAdminEditUserPage',
      prod: 'https://webex.com/dispatcher/AtlasIntegration.do?cmd=GoToSiteAdminEditUserPage',
    });
  });

  it('should return correct hydra url', function () {
    whenCalling('getHydraServiceUrl').expectUrlToBe({
      dev: 'https://api.ciscospark.com/v1',
      cfe: 'https://api.ciscospark.com/v1',
      integration: 'https://api.ciscospark.com/v1',
      prod: 'https://api.ciscospark.com/v1',
    });
  });

  it('should return correct Sunlight Config Service url', function () {
    whenCalling('getSunlightConfigServiceUrl').expectUrlToBe({
      dev: 'https://config.devus1.ciscoccservice.com/config/v1',
      cfe: 'https://config.appstaging.ciscoccservice.com/config/v1',
      integration: 'https://config.appstaging.ciscoccservice.com/config/v1',
      prod: 'https://config.produs1.ciscoccservice.com/config/v1',
    });
  });

  it('should return correct Sunlight UR Service url', function () {
    whenCalling('getSunlightURServiceUrl').expectUrlToBe({
      dev: 'https://pick.devus1.ciscoccservice.com/qnr/v1',
      cfe: 'https://pick.appstaging.ciscoccservice.com/qnr/v1',
      integration: 'https://pick.appstaging.ciscoccservice.com/qnr/v1',
      prod: 'https://pick.produs1.ciscoccservice.com/qnr/v1',
    });
  });

  it('should return correct Customer Virtual Assistant Service url', function () {
    whenCalling('getCvaServiceUrl').expectUrlToBe({
      dev: 'https://int-virtual-assistant.appstaging.ciscoccservice.com/virtual-assistant/v1/',
      cfe: 'https://int-virtual-assistant.appstaging.ciscoccservice.com/virtual-assistant/v1/',
      integration: 'https://int-virtual-assistant.appstaging.ciscoccservice.com/virtual-assistant/v1/',
      prod: 'https://virtual-assistant.produs1.ciscoccservice.com/virtual-assistant/v1/',
    });
  });

  it('should return correct Expert Virtual Assistant Service url', function () {
    whenCalling('getEvaServiceUrl').expectUrlToBe({
      dev: 'https://int-expert-assistant.appstaging.ciscoccservice.com/expert-assistant/v1/',
      cfe: 'https://int-expert-assistant.appstaging.ciscoccservice.com/expert-assistant/v1/',
      integration: 'https://int-expert-assistant.appstaging.ciscoccservice.com/expert-assistant/v1/',
      prod: 'https://expert-assistant.produs1.ciscoccservice.com/expert-assistant/v1/',
    });
  });

  it('should return correct sunlight chat bubble url', function () {
    whenCalling('getSunlightBubbleUrl').expectUrlToBe({
      dev: 'https://bubble.devus1.ciscoccservice.com',
      cfe: 'https://bubble.appstaging.ciscoccservice.com',
      integration: 'https://bubble.appstaging.ciscoccservice.com',
      prod: 'https://bubble.produs1.ciscoccservice.com',
    });
  });

  it('should return correct prod admin url', function () {
    whenCalling('getProdAdminServiceUrl').expectUrlToBe({
      dev: 'https://atlas-a.wbx2.com/admin/api/v1/',
      cfe: 'https://atlas-a.wbx2.com/admin/api/v1/',
      integration: 'https://atlas-a.wbx2.com/admin/api/v1/',
      prod: 'https://atlas-a.wbx2.com/admin/api/v1/',
    });
  });

  it('should return correct webexAdvancedEditUrl url', function () {
    whenCalling('getWebexAdvancedEditUrl', 'foo').expectUrlToBe({
      dev: 'https://foo/dispatcher/AtlasIntegration.do?cmd=GoToSiteAdminEditUserPage',
      cfe: 'https://foo/dispatcher/AtlasIntegration.do?cmd=GoToSiteAdminEditUserPage',
      integration: 'https://foo/dispatcher/AtlasIntegration.do?cmd=GoToSiteAdminEditUserPage',
      prod: 'https://foo/dispatcher/AtlasIntegration.do?cmd=GoToSiteAdminEditUserPage',
    });
  });

  it('should return correct webexAdvancedHomeUrl url', function () {
    whenCalling('getWebexAdvancedHomeUrl', 'foo').expectUrlToBe({
      dev: 'https://foo/dispatcher/AtlasIntegration.do?cmd=GoToSiteAdminHomePage',
      cfe: 'https://foo/dispatcher/AtlasIntegration.do?cmd=GoToSiteAdminHomePage',
      integration: 'https://foo/dispatcher/AtlasIntegration.do?cmd=GoToSiteAdminHomePage',
      prod: 'https://foo/dispatcher/AtlasIntegration.do?cmd=GoToSiteAdminHomePage',
    });
  });

  it('should return correct web client url', function () {
    whenCalling('getWebClientUrl', 'foo').expectUrlToBe({
      dev: 'https://web.ciscospark.com/',
      cfe: 'https://web.ciscospark.com/',
      integration: 'https://web.ciscospark.com/',
      prod: 'https://web.ciscospark.com/',
    });
  });

  it('should return correct ccfs urls', function () {
    whenCalling('getContextCcfsUrl', 'foo').expectUrlToBe({
      dev: 'https://ccfs.appstaging.ciscoccservice.com/v1',
      cfe: 'https://ccfs.appstaging.ciscoccservice.com/v1',
      integration: 'https://ccfs.appstaging.ciscoccservice.com/v1',
      prod: 'https://ccfs.produs1.ciscoccservice.com/v1',
    });
  });
});
