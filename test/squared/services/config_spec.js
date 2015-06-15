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
  var prodHost = 'admin.ciscospark.com';
  var intHost = 'int-admin.ciscospark.com';
  var cfeHost = 'cfe-admin.ciscospark.com';

  var whenCalling = function (fn, arg) {
    var hosts = {
      development: devHost,
      integration: intHost,
      production: prodHost,
      cfe: cfeHost
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

        Config.getEnv = function () {
          return 'foo-' + new Date().getTime().toString(16);
        };
        var conf = Config[fn](arg);
        if (!conf) {
          throw new Error("Expected " + fn + " to have a sensible default for unknown envs");
        }
        if (conf.indexOf('undefined') != -1) {
          throw new Error("Expected " + fn + " to not have undefined parts for unknown envs. Got: " + conf);
        }
      }
    };
  };

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

  it('should detect integration environment', function () {
    $location.host.and.returnValue(intHost);
    expect(Config.isIntegration()).toBe(true);

    $location.host.and.returnValue(devHost);
    expect(Config.isIntegration()).toBe(false);
  });

  it('should detect production environment', function () {
    $location.host.and.returnValue(intHost);
    expect(Config.isProd()).toBe(false);

    $location.host.and.returnValue(prodHost);
    expect(Config.isProd()).toBe(true);
  });

  it('should return env', function () {
    $location.host.and.returnValue(intHost);
    expect(Config.getEnv()).toBe('integration');

    $location.host.and.returnValue(devHost);
    expect(Config.getEnv()).toBe('dev');

    $location.host.and.returnValue(prodHost);
    expect(Config.getEnv()).toBe('prod');

    $location.host.and.returnValue('random-host-is-prod');
    expect(Config.getEnv()).toBe('prod');
  });

  it('should return the correct oauth credentials', function () {
    var creds = Config.getOAuthClientRegistrationCredentials();
    expect(creds).toBe('QzgwZmI5YzcwOTZiZDg0NzQ2MjczMTdlZTFkN2E4MTdlZmYzNzJjYTljOWNlZTNjZTQzYzNlYTNlOGQxNTExZWM6YzEwYzM3MWI0NjQxMDEwYTc1MDA3M2IzYzhlNjVhN2ZmZjA1Njc0MDBkMzE2MDU1ODI4ZDNjNzQ5MjViMDg1Nw==');
  });

  it('should return correct admin service url', function () {
    whenCalling('getAdminServiceUrl').expectUrlToBe({
      development: 'https://atlas-integration.wbx2.com/admin/api/v1/',
      integration: 'https://atlas-integration.wbx2.com/admin/api/v1/',
      production: 'https://atlas-a.wbx2.com/admin/api/v1/',
    });
  });

  it('should return correct locus service url', function () {
    whenCalling('getLocusServiceUrl').expectUrlToBe({
      development: 'https://admin-portal-test-public.wbx2.com/locus',
      integration: 'https://admin-portal-test-public.wbx2.com/locus',
      production: 'https://admin-portal-test-public.wbx2.com/locus'
    });
  });

  it('should return correct meeting service url', function () {
    whenCalling('getMeetingServiceUrl').expectUrlToBe({
      development: 'http://mf-meeting-service.mb-lab.huron.uno/admin/api/v1',
      integration: 'https://mf-meeting-service.mb-lab.huron.uno/admin/api/v1',
      production: 'https://mf-meeting-service.mb-lab.huron.uno/admin/api/v1'
    });
  });

  it('should return correct meeting service url', function () {
    whenCalling('getMeetinginfoserviceUrl').expectUrlToBe({
      development: 'http://mf-meeting-service.mb-lab.huron.uno/admin/api/v1',
      integration: 'https://mf-meeting-service.mb-lab.huron.uno/admin/api/v1',
      production: 'https://mf-meeting-service.mb-lab.huron.uno/admin/api/v1'
    });
  });

  it('should return correct oauth login url', function () {
    whenCalling('getOauthLoginUrl').expectUrlToBe({
      development: 'https://idbroker.webex.com/idb/oauth2/v1/authorize?response_type=code&client_id=C80fb9c7096bd8474627317ee1d7a817eff372ca9c9cee3ce43c3ea3e8d1511ec&scope=webexsquare%3Aadmin%20ciscouc%3Aadmin%20Identity%3ASCIM%20Identity%3AConfig%20Identity%3AOrganization%20cloudMeetings%3Alogin&redirect_uri=http%3A%2F%2F127.0.0.1%3A8000&state=random-string&service=spark',
      integration: 'https://idbroker.webex.com/idb/oauth2/v1/authorize?response_type=code&client_id=C80fb9c7096bd8474627317ee1d7a817eff372ca9c9cee3ce43c3ea3e8d1511ec&scope=webexsquare%3Aadmin%20ciscouc%3Aadmin%20Identity%3ASCIM%20Identity%3AConfig%20Identity%3AOrganization%20cloudMeetings%3Alogin&redirect_uri=https%3A%2F%2Fint-admin.ciscospark.com%2F&state=random-string&service=spark',
      production: 'https://idbroker.webex.com/idb/oauth2/v1/authorize?response_type=code&client_id=C80fb9c7096bd8474627317ee1d7a817eff372ca9c9cee3ce43c3ea3e8d1511ec&scope=webexsquare%3Aadmin%20ciscouc%3Aadmin%20Identity%3ASCIM%20Identity%3AConfig%20Identity%3AOrganization%20cloudMeetings%3Alogin&redirect_uri=https%3A%2F%2Fadmin.ciscospark.com%2F&state=random-string&service=spark'
    });
  });

  it('should return correct redir url', function () {
    whenCalling('getRedirectUrl').expectUrlToBe({
      development: 'redirect_uri=http%3A%2F%2F127.0.0.1%3A8000',
      integration: 'redirect_uri=https%3A%2F%2Fint-admin.ciscospark.com%2F',
      production: 'redirect_uri=https%3A%2F%2Fadmin.ciscospark.com%2F'
    });
  });

  it('should return correct oauth code url', function () {
    whenCalling('getOauthCodeUrl', 'foo').expectUrlToBe({
      development: 'grant_type=authorization_code&code=foo&scope=',
      integration: 'grant_type=authorization_code&code=foo&scope=',
      production: 'grant_type=authorization_code&code=foo&scope='
    });
  });

  it('should return correct access code url', function () {
    var scope = 'webexsquare%3Aadmin%20ciscouc%3Aadmin%20Identity%3ASCIM%20Identity%3AConfig%20Identity%3AOrganization%20cloudMeetings%3Alogin';
    whenCalling('getOauthAccessCodeUrl', 'foo').expectUrlToBe({
      development: 'grant_type=refresh_token&refresh_token=foo&scope=' + scope,
      integration: 'grant_type=refresh_token&refresh_token=foo&scope=' + scope,
      production: 'grant_type=refresh_token&refresh_token=foo&scope=' + scope
    });
  });

  it('should return correct logout url', function () {
    whenCalling('getLogoutUrl').expectUrlToBe({
      development: 'https://idbroker.webex.com/idb/saml2/jsp/doSSO.jsp?type=logout&service=webex-squared&goto=http%3A%2F%2F127.0.0.1%3A8000',
      integration: 'https://idbroker.webex.com/idb/saml2/jsp/doSSO.jsp?type=logout&service=webex-squared&goto=https%3A%2F%2Fint-admin.ciscospark.com%2F',
      production: 'https://idbroker.webex.com/idb/saml2/jsp/doSSO.jsp?type=logout&service=webex-squared&goto=https%3A%2F%2Fadmin.ciscospark.com%2F'
    });
  });

  it('should return correct sso setup url', function () {
    whenCalling('getSSOSetupUrl').expectUrlToBe({
      development: 'https://idbroker.webex.com/idb/idbconfig/',
      integration: 'https://idbroker.webex.com/idb/idbconfig/',
      production: 'https://idbroker.webex.com/idb/idbconfig/'
    });
  });

  it('should return correct sso test url', function () {
    whenCalling('getSSOTestUrl').expectUrlToBe({
      development: 'https://idbroker.webex.com/idb/saml2/jsp/spSSOInit.jsp',
      integration: 'https://idbroker.webex.com/idb/saml2/jsp/spSSOInit.jsp',
      production: 'https://idbroker.webex.com/idb/saml2/jsp/spSSOInit.jsp'
    });
  });

  it('should return correct health check service url', function () {
    whenCalling('getHealthCheckUrlServiceUrl').expectUrlToBe({
      development: 'https://ciscospark.statuspage.io/index.json',
      integration: 'https://ciscospark.statuspage.io/index.json',
      production: 'https://ciscospark.statuspage.io/index.json'
    });
  });

  it('should return correct log metrics url', function () {
    whenCalling('getLogMetricsUrl').expectUrlToBe({
      development: 'https://metrics-a.wbx2.com/metrics/api/v1/metrics',
      integration: 'https://metrics-a.wbx2.com/metrics/api/v1/metrics',
      production: 'https://metrics-a.wbx2.com/metrics/api/v1/metrics'
    });
  });

  it('should return correct call flow service url', function () {
    whenCalling('getCallflowServiceUrl').expectUrlToBe({
      development: 'https://admin-portal-test-public.wbx2.com/atlas-server/admin/api/v1/',
      integration: 'https://admin-portal-test-public.wbx2.com/atlas-server/admin/api/v1/',
      production: 'https://admin-portal-test-public.wbx2.com/atlas-server/admin/api/v1/'
    });
  });

  it('should return correct status page url', function () {
    whenCalling('getStatusPageUrl').expectUrlToBe({
      development: 'http://status.ciscospark.com/',
      integration: 'http://status.ciscospark.com/',
      production: 'http://status.ciscospark.com/'
    });
  });

  it('should return correct squared app url', function () {
    whenCalling('getSquaredAppUrl').expectUrlToBe({
      development: 'squared://',
      integration: 'squared://',
      production: 'squared://'
    });
  });

  it('should return correct itunes store url', function () {
    whenCalling('getItunesStoreUrl').expectUrlToBe({
      development: 'http://cs.co/sqios',
      integration: 'http://cs.co/sqios',
      production: 'http://cs.co/sqios'
    });
  });

  it('should return correct android store url', function () {
    whenCalling('getAndroidStoreUrl').expectUrlToBe({
      development: 'http://cs.co/sqandroid',
      integration: 'http://cs.co/sqandroid',
      production: 'http://cs.co/sqandroid'
    });
  });

  it('should return correct android app intent url', function () {
    whenCalling('getAndroidAppIntent').expectUrlToBe({
      development: 'intent://view?id=123#Intent;package=com.cisco.wx2.android;scheme=squared;end;',
      integration: 'intent://view?id=123#Intent;package=com.cisco.wx2.android;scheme=squared;end;',
      production: 'intent://view?id=123#Intent;package=com.cisco.wx2.android;scheme=squared;end;'
    });
  });

  it('should return correct web client url', function () {
    whenCalling('getWebClientUrl').expectUrlToBe({
      development: 'https://web.ciscospark.com/',
      integration: 'https://web.ciscospark.com/',
      production: 'https://web.ciscospark.com/'
    });
  });

  it('should return correct hercules url', function () {
    whenCalling('getHerculesUrl').expectUrlToBe({
      development: 'https://hercules-integration.wbx2.com/',
      integration: 'https://hercules-integration.wbx2.com/',
      production: 'https://hercules-a.wbx2.com/'
    });
  });

  it('should return correct USS url', function () {
    whenCalling('getUssUrl').expectUrlToBe({
      development: 'https://uss-integration.wbx2.com/',
      integration: 'https://uss-integration.wbx2.com/',
      production: 'https://uss-a.wbx2.com/'
    });
  });

});
