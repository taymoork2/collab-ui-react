'use strict';

describe('Config', function () {

  beforeEach(module('wx2AdminWebClientApp'));

  var Config, $location;
  beforeEach(inject(function (_$location_, _Config_) {
    Config = _Config_;
    $location = _$location_;
    spyOn($location, 'host');
  }));

  var devHost = 'localhost';
  var cfeHost = 'cfe-admin.ciscospark.com';
  var intHost = 'int-admin.ciscospark.com';
  var prodHost = 'admin.ciscospark.com';

  var scope = encodeURIComponent('webexsquare:admin ciscouc:admin Identity:SCIM Identity:Config Identity:Organization cloudMeetings:login webex-messenger:get_webextoken ccc_config:admin');
  var orgId = 'abc123efg456';
  var siteURL = 'webex.com';

  var whenCalling = function (fn, arg) {
    var hosts = {
      'dev': devHost,
      'cfe': cfeHost,
      'integration': intHost,
      'prod': prodHost
    };
    return {
      expectUrlToBe: function (obj) {
        _.each(obj, function (expected, env) {
          var host = hosts[env];
          if (!host) {
            throw new Error("Unknown environment " + env);
          }
          if (!Config[fn]) {
            throw new Error("Unknown method " + fn);
          }
          $location.host.and.returnValue(host);
          var actual = Config[fn](arg);

          if (expected != actual) {
            throw new Error("Expected " + fn + " in " + env + " to be '" + expected + "' but it was '" + actual + "'");
          }
        });
      }
    };
  };

  it('should exist', function () {
    expect(Config).toBeDefined();
  });

  it('should have tabs', function () {
    expect(Config.tabs).toBeDefined();
  });

  it('should have roleStates', function () {
    expect(Config.roleStates).toBeDefined();
  });

  it('partner_sales_admin should have correct roleStates', function () {
    expect(Config.roleStates.PARTNER_SALES_ADMIN).toContain('partneroverview');
    expect(Config.roleStates.PARTNER_SALES_ADMIN).toContain('customer-overview');
    expect(Config.roleStates.PARTNER_SALES_ADMIN).toContain('partnercustomers');
    expect(Config.roleStates.PARTNER_SALES_ADMIN).toContain('partnerreports');
    expect(Config.roleStates.PARTNER_SALES_ADMIN).toContain('trialAdd');
    expect(Config.roleStates.PARTNER_SALES_ADMIN).toContain('trialEdit');
    expect(Config.roleStates.PARTNER_SALES_ADMIN).toContain('pstnSetup');
  });

  it('should not have development states assigned to Full_Admin role', function () {
    function getDevelopmentStates() {
      var devStates = [];
      for (var i = 0; i < Config.tabs.length; i++) {
        var tab = Config.tabs[i];
        if (tab && tab.tab === 'developmentTab') {
          var subPages = tab.subPages;
          for (var j = 0; j < subPages.length; j++) {
            var devTab = subPages[j];
            if (devTab && devTab.state) {
              devStates.push(devTab.state);
            }
          }
        }
      }
      return devStates;
    }
    var adminStates = Config.roleStates.Full_Admin || [];
    var developmentStates = getDevelopmentStates();
    for (var i = 0; i < adminStates.length; i++) {
      expect(developmentStates).not.toContain(adminStates[i]);
    }
  });

  it('should detect dev environment', function () {
    $location.host.and.returnValue('wbx2.com/bla');
    expect(Config.isDev()).toBe(false);

    $location.host.and.returnValue('127.0.0.1');
    expect(Config.isDev()).toBe(true);

    $location.host.and.returnValue('0.0.0.0');
    expect(Config.isDev()).toBe(true);

    $location.host.and.returnValue('localhost');
    expect(Config.isDev()).toBe(true);

    $location.host.and.returnValue('10.12.32.12');
    expect(Config.isDev()).toBe(false);
  });

  it('should detect load test environment', function () {
    $location.host.and.returnValue(cfeHost);
    expect(Config.isCfe()).toBe(true);

    $location.host.and.returnValue(prodHost);
    expect(Config.isCfe()).toBe(false);
  });

  it('should detect integration environment', function () {
    $location.host.and.returnValue(intHost);
    expect(Config.isIntegration()).toBe(true);

    $location.host.and.returnValue(devHost);
    expect(Config.isIntegration()).toBe(false);
  });

  it('should detect prod environment', function () {
    $location.host.and.returnValue(intHost);
    expect(Config.isProd()).toBe(false);

    $location.host.and.returnValue(prodHost);
    expect(Config.isProd()).toBe(true);
  });

  it('should return env', function () {
    $location.host.and.returnValue(devHost);
    expect(Config.getEnv()).toBe('dev');

    $location.host.and.returnValue(cfeHost);
    expect(Config.getEnv()).toBe('cfe');

    $location.host.and.returnValue(intHost);
    expect(Config.getEnv()).toBe('integration');

    $location.host.and.returnValue(prodHost);
    expect(Config.getEnv()).toBe('prod');

    $location.host.and.returnValue('random-host-is-prod');
    expect(Config.getEnv()).toBe('prod');
  });

  it('should return the correct oauth credentials', function () {
    var creds = Config.getOAuthClientRegistrationCredentials();
    expect(creds).toBe('QzgwZmI5YzcwOTZiZDg0NzQ2MjczMTdlZTFkN2E4MTdlZmYzNzJjYTljOWNlZTNjZTQzYzNlYTNlOGQxNTExZWM6YzEwYzM3MWI0NjQxMDEwYTc1MDA3M2IzYzhlNjVhN2ZmZjA1Njc0MDBkMzE2MDU1ODI4ZDNjNzQ5MjViMDg1Nw==');
  });

  it('should return correct identity user service url', function () {
    whenCalling('getScimUrl', orgId).expectUrlToBe({
      dev: 'https://identity.webex.com/identity/scim/abc123efg456/v1/Users',
      cfe: 'https://identitybts.webex.com/identity/scim/abc123efg456/v1/Users',
      integration: 'https://identity.webex.com/identity/scim/abc123efg456/v1/Users',
      prod: 'https://identity.webex.com/identity/scim/abc123efg456/v1/Users'
    });
  });

  it('should return correct user reports url', function () {
    whenCalling('getUserReportsUrl', orgId).expectUrlToBe({
      dev: 'https://identity.webex.com/identity/config/abc123efg456/v1/UserReports',
      cfe: 'https://identitybts.webex.com/identity/config/abc123efg456/v1/UserReports',
      integration: 'https://identity.webex.com/identity/config/abc123efg456/v1/UserReports',
      prod: 'https://identity.webex.com/identity/config/abc123efg456/v1/UserReports'
    });
  });

  it('should return correct identity org service url', function () {
    whenCalling('getScomUrl', orgId).expectUrlToBe({
      dev: 'https://identity.webex.com/organization/scim/v1/Orgs',
      cfe: 'https://identitybts.webex.com/organization/scim/v1/Orgs',
      integration: 'https://identity.webex.com/organization/scim/v1/Orgs',
      prod: 'https://identity.webex.com/organization/scim/v1/Orgs'
    });
  });

  it('should return correct admin service url', function () {
    whenCalling('getAdminServiceUrl').expectUrlToBe({
      dev: 'https://atlas-integration.wbx2.com/admin/api/v1/',
      cfe: 'https://atlas-e.wbx2.com/admin/api/v1/',
      integration: 'https://atlas-integration.wbx2.com/admin/api/v1/',
      prod: 'https://atlas-a.wbx2.com/admin/api/v1/',
    });
  });

  it('should return correct csdm service url', function () {
    whenCalling('getCsdmServiceUrl').expectUrlToBe({
      dev: 'https://csdm-integration.wbx2.com/csdm/api/v1',
      cfe: 'https://csdm-e.wbx2.com/csdm/api/v1',
      integration: 'https://csdm-integration.wbx2.com/csdm/api/v1',
      prod: 'https://csdm-a.wbx2.com/csdm/api/v1'
    });
  });

  it('should always return locus integration service url', function () {
    whenCalling('getLocusServiceUrl').expectUrlToBe({
      dev: 'https://admin-portal-test-public.wbx2.com/locus',
      cfe: 'https://admin-portal-test-public.wbx2.com/locus',
      integration: 'https://admin-portal-test-public.wbx2.com/locus',
      prod: 'https://admin-portal-test-public.wbx2.com/locus'
    });
  });

  it('should return correct feature toggle service url', function () {
    whenCalling('getFeatureToggleUrl').expectUrlToBe({
      dev: 'https://locus-a.wbx2.com',
      cfe: 'https://locus-e.wbx2.com',
      integration: 'https://locus-a.wbx2.com',
      prod: 'https://locus-a.wbx2.com'
    });
  });

  it('should return correct meeting service url', function () {
    whenCalling('getMeetingServiceUrl').expectUrlToBe({
      dev: 'http://mf-meeting-service.mb-lab.huron.uno/admin/api/v1',
      cfe: 'https://mf-meeting-service.mb-lab.huron.uno/admin/api/v1',
      integration: 'https://mf-meeting-service.mb-lab.huron.uno/admin/api/v1',
      prod: 'https://mf-meeting-service.mb-lab.huron.uno/admin/api/v1'
    });
  });

  it('should return correct meeting service url', function () {
    whenCalling('getMeetingInfoServiceUrl').expectUrlToBe({
      dev: 'http://mf-meeting-service.mb-lab.huron.uno/admin/api/v1',
      cfe: 'https://mf-meeting-service.mb-lab.huron.uno/admin/api/v1',
      integration: 'https://mf-meeting-service.mb-lab.huron.uno/admin/api/v1',
      prod: 'https://mf-meeting-service.mb-lab.huron.uno/admin/api/v1'
    });
  });

  it('should return correct oauth login url', function () {
    whenCalling('getOauthLoginUrl').expectUrlToBe({
      dev: 'https://idbroker.webex.com/idb/oauth2/v1/authorize?response_type=code&client_id=C80fb9c7096bd8474627317ee1d7a817eff372ca9c9cee3ce43c3ea3e8d1511ec&scope=' + scope + '&redirect_uri=http%3A%2F%2F127.0.0.1%3A8000&state=random-string&service=spark',
      cfe: 'https://idbrokerbts.webex.com/idb/oauth2/v1/authorize?response_type=code&client_id=C5469b72a6de8f8f0c5a23e50b073063ea872969fc74bb461d0ea0438feab9c03&scope=' + scope + '&redirect_uri=https%3A%2F%2Fcfe-admin.ciscospark.com&state=random-string&service=spark',
      integration: 'https://idbroker.webex.com/idb/oauth2/v1/authorize?response_type=code&client_id=C80fb9c7096bd8474627317ee1d7a817eff372ca9c9cee3ce43c3ea3e8d1511ec&scope=' + scope + '&redirect_uri=https%3A%2F%2Fint-admin.ciscospark.com%2F&state=random-string&service=spark',
      prod: 'https://idbroker.webex.com/idb/oauth2/v1/authorize?response_type=code&client_id=C80fb9c7096bd8474627317ee1d7a817eff372ca9c9cee3ce43c3ea3e8d1511ec&scope=' + scope + '&redirect_uri=https%3A%2F%2Fadmin.ciscospark.com%2F&state=random-string&service=spark'
    });
  });

  it('should return correct redir url', function () {
    whenCalling('getRedirectUrl').expectUrlToBe({
      dev: 'redirect_uri=http%3A%2F%2F127.0.0.1%3A8000',
      cfe: 'redirect_uri=https%3A%2F%2Fcfe-admin.ciscospark.com',
      integration: 'redirect_uri=https%3A%2F%2Fint-admin.ciscospark.com%2F',
      prod: 'redirect_uri=https%3A%2F%2Fadmin.ciscospark.com%2F'
    });
  });

  it('should return correct oauth code url', function () {
    whenCalling('getOauthCodeUrl', 'foo').expectUrlToBe({
      dev: 'grant_type=authorization_code&code=foo&scope=',
      cfe: 'grant_type=authorization_code&code=foo&scope=',
      integration: 'grant_type=authorization_code&code=foo&scope=',
      prod: 'grant_type=authorization_code&code=foo&scope='
    });
  });

  it('should return correct access code url', function () {
    whenCalling('getOauthAccessCodeUrl', 'foo').expectUrlToBe({
      dev: 'grant_type=refresh_token&refresh_token=foo&scope=' + scope,
      cfe: 'grant_type=refresh_token&refresh_token=foo&scope=' + scope,
      integration: 'grant_type=refresh_token&refresh_token=foo&scope=' + scope,
      prod: 'grant_type=refresh_token&refresh_token=foo&scope=' + scope
    });
  });

  it('should return correct logout url', function () {
    whenCalling('getLogoutUrl').expectUrlToBe({
      dev: 'https://idbroker.webex.com/idb/saml2/jsp/doSSO.jsp?type=logout&service=webex-squared&goto=http%3A%2F%2F127.0.0.1%3A8000',
      cfe: 'https://idbroker.webex.com/idb/saml2/jsp/doSSO.jsp?type=logout&service=webex-squared&goto=https%3A%2F%2Fcfe-admin.ciscospark.com',
      integration: 'https://idbroker.webex.com/idb/saml2/jsp/doSSO.jsp?type=logout&service=webex-squared&goto=https%3A%2F%2Fint-admin.ciscospark.com%2F',
      prod: 'https://idbroker.webex.com/idb/saml2/jsp/doSSO.jsp?type=logout&service=webex-squared&goto=https%3A%2F%2Fadmin.ciscospark.com%2F'
    });
  });

  it('should return correct sso setup url', function () {
    whenCalling('getSSOSetupUrl').expectUrlToBe({
      dev: 'https://idbroker.webex.com/idb/idbconfig/',
      cfe: 'https://idbroker.webex.com/idb/idbconfig/',
      integration: 'https://idbroker.webex.com/idb/idbconfig/',
      prod: 'https://idbroker.webex.com/idb/idbconfig/'
    });
  });

  it('should return correct sso test url', function () {
    whenCalling('getSSOTestUrl').expectUrlToBe({
      dev: 'https://idbroker.webex.com/idb/saml2/jsp/spSSOInit.jsp',
      cfe: 'https://idbroker.webex.com/idb/saml2/jsp/spSSOInit.jsp',
      integration: 'https://idbroker.webex.com/idb/saml2/jsp/spSSOInit.jsp',
      prod: 'https://idbroker.webex.com/idb/saml2/jsp/spSSOInit.jsp'
    });
  });

  it('should return correct health check service url', function () {
    whenCalling('getHealthCheckUrlServiceUrl').expectUrlToBe({
      dev: 'https://ciscospark.statuspage.io/index.json',
      cfe: 'https://ciscospark.statuspage.io/index.json',
      integration: 'https://ciscospark.statuspage.io/index.json',
      prod: 'https://ciscospark.statuspage.io/index.json'
    });
  });

  it('should return correct log metrics url', function () {
    whenCalling('getLogMetricsUrl').expectUrlToBe({
      dev: 'https://metrics-a.wbx2.com/metrics/api/v1/metrics',
      cfe: 'https://metrics-a.wbx2.com/metrics/api/v1/metrics',
      integration: 'https://metrics-a.wbx2.com/metrics/api/v1/metrics',
      prod: 'https://metrics-a.wbx2.com/metrics/api/v1/metrics'
    });
  });

  it('should return correct call flow service url', function () {
    whenCalling('getCallflowServiceUrl').expectUrlToBe({
      dev: 'https://admin-portal-test-public.wbx2.com/atlas-server/admin/api/v1/',
      cfe: 'https://admin-portal-test-public.wbx2.com/atlas-server/admin/api/v1/',
      integration: 'https://admin-portal-test-public.wbx2.com/atlas-server/admin/api/v1/',
      prod: 'https://admin-portal-test-public.wbx2.com/atlas-server/admin/api/v1/'
    });
  });

  it('should return correct status page url', function () {
    whenCalling('getStatusPageUrl').expectUrlToBe({
      dev: 'http://status.ciscospark.com/',
      cfe: 'http://status.ciscospark.com/',
      integration: 'http://status.ciscospark.com/',
      prod: 'http://status.ciscospark.com/'
    });
  });

  it('should return correct squared app url', function () {
    whenCalling('getSquaredAppUrl').expectUrlToBe({
      dev: 'squared://',
      cfe: 'squared://',
      integration: 'squared://',
      prod: 'squared://'
    });
  });

  it('should return correct itunes store url', function () {
    whenCalling('getItunesStoreUrl').expectUrlToBe({
      dev: 'http://cs.co/sqios',
      cfe: 'http://cs.co/sqios',
      integration: 'http://cs.co/sqios',
      prod: 'http://cs.co/sqios'
    });
  });

  it('should return correct android store url', function () {
    whenCalling('getAndroidStoreUrl').expectUrlToBe({
      dev: 'http://cs.co/sqandroid',
      cfe: 'http://cs.co/sqandroid',
      integration: 'http://cs.co/sqandroid',
      prod: 'http://cs.co/sqandroid'
    });
  });

  it('should return correct android app intent url', function () {
    whenCalling('getAndroidAppIntent').expectUrlToBe({
      dev: 'intent://view?id=123#Intent;package=com.cisco.wx2.android;scheme=squared;end;',
      cfe: 'intent://view?id=123#Intent;package=com.cisco.wx2.android;scheme=squared;end;',
      integration: 'intent://view?id=123#Intent;package=com.cisco.wx2.android;scheme=squared;end;',
      prod: 'intent://view?id=123#Intent;package=com.cisco.wx2.android;scheme=squared;end;'
    });
  });

  it('should return correct web client url', function () {
    whenCalling('getWebClientUrl').expectUrlToBe({
      dev: 'https://web.ciscospark.com/',
      cfe: 'https://web.ciscospark.com/',
      integration: 'https://web.ciscospark.com/',
      prod: 'https://web.ciscospark.com/'
    });
  });

  it('should return correct hercules url', function () {
    whenCalling('getHerculesUrl').expectUrlToBe({
      dev: 'https://hercules-integration.wbx2.com/v1',
      cfe: 'https://hercules-e.wbx2.com/v1',
      integration: 'https://hercules-integration.wbx2.com/v1',
      prod: 'https://hercules-a.wbx2.com/v1'
    });
  });

  it('should return correct USS url', function () {
    whenCalling('getUssUrl').expectUrlToBe({
      dev: 'https://uss-integration.wbx2.com/',
      cfe: 'https://uss-e.wbx2.com/',
      integration: 'https://uss-integration.wbx2.com/',
      prod: 'https://uss-a.wbx2.com/'
    });
  });

  it('should return correct calliope url', function () {
    whenCalling('getCalliopeUrl').expectUrlToBe({
      dev: 'https://calliope-integration.wbx2.com/calliope/api/authorization/v1',
      cfe: 'https://calliope-e.wbx2.com/calliope/api/authorization/v1',
      integration: 'https://calliope-integration.wbx2.com/calliope/api/authorization/v1',
      prod: 'https://calliope-a.wbx2.com/calliope/api/authorization/v1'
    });
  });

  it('should return correct certs url', function () {
    whenCalling('getCertsUrl').expectUrlToBe({
      dev: 'https://certs-integration.wbx2.com/',
      cfe: 'https://certs-e.wbx2.com/',
      integration: 'https://certs-integration.wbx2.com/',
      prod: 'https://certs-a.wbx2.com/'
    });
  });

  it('should return correct wdm url', function () {
    whenCalling('getWdmUrl').expectUrlToBe({
      dev: 'https://wdm-a.wbx2.com/wdm/api/v1',
      cfe: 'http://wdm.cfe.wbx2.com/wdm/api/v1',
      integration: 'https://wdm-a.wbx2.com/wdm/api/v1',
      prod: 'https://wdm-a.wbx2.com/wdm/api/v1'
    });
  });

  it('should return correct utilization url', function () {
    whenCalling('getUtilizationServiceUrl').expectUrlToBe({
      dev: 'http://mf-meeting-service.mb-lab.huron.uno/admin/api/v1',
      cfe: 'https://mf-meeting-service.mb-lab.huron.uno/admin/api/v1',
      integration: 'https://mf-meeting-service.mb-lab.huron.uno/admin/api/v1',
      prod: 'https://mf-meeting-service.mb-lab.huron.uno/admin/api/v1'
    });
  });

  it('should return correct webex advanced home url', function () {
    whenCalling('getWebexAdvancedHomeUrl', siteURL).expectUrlToBe({
      dev: 'https://webex.com/dispatcher/AtlasIntegration.do?cmd=GoToSiteAdminHomePage',
      cfe: 'https://webex.com/dispatcher/AtlasIntegration.do?cmd=GoToSiteAdminHomePage',
      integration: 'https://webex.com/dispatcher/AtlasIntegration.do?cmd=GoToSiteAdminHomePage',
      prod: 'https://webex.com/dispatcher/AtlasIntegration.do?cmd=GoToSiteAdminHomePage'
    });
  });

  it('should return correct webex advanced edit url', function () {
    whenCalling('getWebexAdvancedEditUrl', siteURL).expectUrlToBe({
      dev: 'https://webex.com/dispatcher/AtlasIntegration.do?cmd=GoToSiteAdminEditUserPage',
      cfe: 'https://webex.com/dispatcher/AtlasIntegration.do?cmd=GoToSiteAdminEditUserPage',
      integration: 'https://webex.com/dispatcher/AtlasIntegration.do?cmd=GoToSiteAdminEditUserPage',
      prod: 'https://webex.com/dispatcher/AtlasIntegration.do?cmd=GoToSiteAdminEditUserPage'
    });
  });

  it('should return correct customer care url', function () {
    whenCalling('getSunlightConfigServiceUrl').expectUrlToBe({
      dev: 'https://config.rciad.ciscoccservice.com/config/v1',
      cfe: 'https://config.rciad.ciscoccservice.com/config/v1',
      integration: 'https://config.rciad.ciscoccservice.com/config/v1',
      prod: 'https://config.rciad.ciscoccservice.com/config/v1'
    });
  });

  describe('service states', function () {

    it('squared-fusion-mgmt should contain fusion states', function () {
      // Preliminary removed until new fusion menues are in place in both integration and production
      //expect(Config.serviceStates['squared-fusion-mgmt'][1]).toBe('cluster-details');
    });

    it('spark-room-system should contain devices state', function () {
      expect(Config.serviceStates['spark-room-system'][0]).toBe('devices');
    });
  });
});
