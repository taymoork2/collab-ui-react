'use strict';

describe('Config', function () {

  beforeEach(module('wx2AdminWebClientApp'));

  var win;
  beforeEach(function() {
    module(function ($provide) {
      win = {
        location: {
          href: ''
        }
      };
      $provide.value('$window', win);
    });
  });

  var Config;
  beforeEach(inject(function (_Config_) {
    Config = _Config_;
  }));

  var devHost = 'localhost'
  var prodHost = 'admin.projectsquared.com';
  var intHost = 'int-admin.projectsquared.com';

  var assertFnReturnsCorrectUrl = function(fn, env, expected) {
    win.location.hostname = 'wbx2.com/bla'
  };

  var whenCalling = function(fn, arg) {
    var hosts = {
      development: devHost,
      integration: intHost,
      production: prodHost
    };
    return {
      expectUrlToBe: function(obj) {
        _.each(obj, function(expected, env) {
          var host = hosts[env];
          if (!host) {
            throw new Error("Unknown environment " + env);
          }
          if (!Config[fn]) {
            throw new Error("Unknown method " + fn);
          }
          win.location.hostname = host;
          var actual = Config[fn](arg);

          if (expected != actual) {
            throw new Error("Expected " + fn + " in " + env + " to be '" + expected + "' but it was '" + actual + "'");
          }
        });
      }
    }
  };

  it('should detect dev environment', function () {
    win.location.hostname = 'wbx2.com/bla'
    expect(Config.isDev()).toBe(false);

    win.location.hostname = '127.0.0.1'
    expect(Config.isDev()).toBe(true);

    win.location.hostname = '0.0.0.0'
    expect(Config.isDev()).toBe(true);

    win.location.hostname = 'localhost'
    expect(Config.isDev()).toBe(true);

    win.location.hostname = '10.12.32.12'
    expect(Config.isDev()).toBe(false);
  });

  it('should detect integration environment', function () {
    win.location.hostname = intHost;
    expect(Config.isIntegration()).toBe(true);

    win.location.hostname = devHost;
    expect(Config.isIntegration()).toBe(false);
  });

  it('should detect production environment', function () {
    win.location.hostname = intHost;
    expect(Config.isProd()).toBe(false);

    win.location.hostname = prodHost;
    expect(Config.isProd()).toBe(true);
  });

  it('should return env', function () {
    win.location.hostname = intHost;
    expect(Config.getEnv()).toBe('integration');

    win.location.hostname = devHost;
    expect(Config.getEnv()).toBe('dev');

    win.location.hostname = prodHost;
    expect(Config.getEnv()).toBe('prod');

    win.location.hostname = 'random-host-is-prod';
    expect(Config.getEnv()).toBe('prod');
  });

  it('should return correct admin service url', function () {
    whenCalling('getAdminServiceUrl').expectUrlToBe({
      development: 'https://atlas-integration.wbx2.com/admin/api/v1/',
      integration: 'https://atlas-integration.wbx2.com/admin/api/v1/',
      production:  'https://atlas-a.wbx2.com/admin/api/v1/'
    });
  });

  it('should return correct locus service url', function () {
    whenCalling('getLocusServiceUrl').expectUrlToBe({
      development: 'https://admin-portal-test-public.wbx2.com/locus',
      integration: 'https://admin-portal-test-public.wbx2.com/locus',
      production:  'https://admin-portal-test-public.wbx2.com/locus'
    });
  });

  it('should return correct meeting service url', function () {
    whenCalling('getMeetingServiceUrl').expectUrlToBe({
      development: 'http://mf-meeting-service.mb-lab.huron.uno/admin/api/v1',
      integration: 'https://mf-meeting-service.mb-lab.huron.uno/admin/api/v1',
      production:  'https://mf-meeting-service.mb-lab.huron.uno/admin/api/v1'
    });
  });

  it('should return correct meeting service url', function () {
    whenCalling('getMeetinginfoserviceUrl').expectUrlToBe({
      development: 'http://mf-meeting-service.mb-lab.huron.uno/admin/api/v1',
      integration: 'https://mf-meeting-service.mb-lab.huron.uno/admin/api/v1',
      production:  'https://mf-meeting-service.mb-lab.huron.uno/admin/api/v1'
    });
  });

  it('should return correct oauth login url', function () {
    whenCalling('getOauthLoginUrl').expectUrlToBe({
      development: 'https://idbroker.webex.com/idb/oauth2/v1/authorize?response_type=code&client_id=C80fb9c7096bd8474627317ee1d7a817eff372ca9c9cee3ce43c3ea3e8d1511ec&scope=webexsquare%3Aadmin%20Identity%3ASCIM%20Identity%3AConfig%20Identity%3AOrganization&redirect_uri=http%3A%2F%2F127.0.0.1%3A8000&state=random-string&service=webex-squared',
      integration: 'https://idbroker.webex.com/idb/oauth2/v1/authorize?response_type=code&client_id=C80fb9c7096bd8474627317ee1d7a817eff372ca9c9cee3ce43c3ea3e8d1511ec&scope=webexsquare%3Aadmin%20Identity%3ASCIM%20Identity%3AConfig%20Identity%3AOrganization&redirect_uri=https%3A%2F%2Fint-admin.projectsquared.com%2F&state=random-string&service=webex-squared',
      production:  'https://idbroker.webex.com/idb/oauth2/v1/authorize?response_type=code&client_id=C80fb9c7096bd8474627317ee1d7a817eff372ca9c9cee3ce43c3ea3e8d1511ec&scope=webexsquare%3Aadmin%20Identity%3ASCIM%20Identity%3AConfig%20Identity%3AOrganization&redirect_uri=https%3A%2F%2Fadmin.projectsquared.com%2F&state=random-string&service=webex-squared'
    });
  });

  it('should return correct redir url', function () {
    whenCalling('getRedirectUrl').expectUrlToBe({
      development: 'redirect_uri=http%3A%2F%2F127.0.0.1%3A8000',
      integration: 'redirect_uri=https%3A%2F%2Fint-admin.projectsquared.com%2F',
      production:  'redirect_uri=https%3A%2F%2Fadmin.projectsquared.com%2F'
    });
  });


  it('should return correct oauth code url', function () {
    whenCalling('getOauthCodeUrl', 'foo').expectUrlToBe({
      development: 'grant_type=authorization_code&code=foo&scope=',
      integration: 'grant_type=authorization_code&code=foo&scope=',
      production:  'grant_type=authorization_code&code=foo&scope='
    });
  });

  it('should return correct access code url', function () {
    whenCalling('getOauthAccessCodeUrl', 'foo').expectUrlToBe({
      development: 'grant_type=refresh_token&refresh_token=foo&scope=',
      integration: 'grant_type=refresh_token&refresh_token=foo&scope=',
      production:  'grant_type=refresh_token&refresh_token=foo&scope='
    });
  });

  it('should return correct logout url', function () {
    whenCalling('getLogoutUrl').expectUrlToBe({
      development: 'https://idbroker.webex.com/idb/saml2/jsp/doSSO.jsp?type=logout&service=webex-squared&goto=http%3A%2F%2F127.0.0.1%3A8000',
      integration: 'https://idbroker.webex.com/idb/saml2/jsp/doSSO.jsp?type=logout&service=webex-squared&goto=https%3A%2F%2Fint-admin.projectsquared.com%2F',
      production:  'https://idbroker.webex.com/idb/saml2/jsp/doSSO.jsp?type=logout&service=webex-squared&goto=https%3A%2F%2Fadmin.projectsquared.com%2F'
    });
  });

  it('should return correct sso setup url', function () {
    whenCalling('getSSOSetupUrl').expectUrlToBe({
      development: 'https://idbroker.webex.com/idb/idbconfig/',
      integration: 'https://idbroker.webex.com/idb/idbconfig/',
      production:  'https://idbroker.webex.com/idb/idbconfig/'
    });
  });

  it('should return correct sso test url', function () {
    whenCalling('getSSOTestUrl').expectUrlToBe({
      development: 'https://idbroker.webex.com/idb/saml2/jsp/spSSOInit.jsp',
      integration: 'https://idbroker.webex.com/idb/saml2/jsp/spSSOInit.jsp',
      production:  'https://idbroker.webex.com/idb/saml2/jsp/spSSOInit.jsp'
    });
  });

  it('should return correct health check service url', function () {
    whenCalling('getHealthCheckUrlServiceUrl').expectUrlToBe({
      development: 'https://projectsquared.statuspage.io/index.json',
      integration: 'https://projectsquared.statuspage.io/index.json',
      production:  'https://projectsquared.statuspage.io/index.json'
    });
  });

  it('should return correct log metrics url', function () {
    whenCalling('getLogMetricsUrl').expectUrlToBe({
      development: 'https://metrics-a.wbx2.com/metrics/api/v1/metrics',
      integration: 'https://metrics-a.wbx2.com/metrics/api/v1/metrics',
      production:  'https://metrics-a.wbx2.com/metrics/api/v1/metrics'
    });
  });

  it('should return correct call flow service url', function () {
    whenCalling('getCallflowServiceUrl').expectUrlToBe({
      development: 'https://admin-portal-test-public.wbx2.com/atlas-server/admin/api/v1/',
      integration: 'https://admin-portal-test-public.wbx2.com/atlas-server/admin/api/v1/',
      production:  'https://admin-portal-test-public.wbx2.com/atlas-server/admin/api/v1/'
    });
  });

  it('should return correct status page url', function () {
    whenCalling('getStatusPageUrl').expectUrlToBe({
      development: 'http://status.projectsquared.com/',
      integration: 'http://status.projectsquared.com/',
      production:  'http://status.projectsquared.com/'
    });
  });

  it('should return correct squared app url', function () {
    whenCalling('getSquaredAppUrl').expectUrlToBe({
      development: 'squared://',
      integration: 'squared://',
      production:  'squared://'
    });
  });

  it('should return correct itunes store url', function () {
    whenCalling('getItunesStoreUrl').expectUrlToBe({
      development: 'https://itunes.apple.com/us/app/project-squared/id833967564?ls=1&mt=8',
      integration: 'https://itunes.apple.com/us/app/project-squared/id833967564?ls=1&mt=8',
      production:  'https://itunes.apple.com/us/app/project-squared/id833967564?ls=1&mt=8'
    });
  });

  it('should return correct android store url', function () {
    whenCalling('getAndroidStoreUrl').expectUrlToBe({
      development: 'https://play.google.com/store/apps/details?id=com.cisco.wx2.android',
      integration: 'https://play.google.com/store/apps/details?id=com.cisco.wx2.android',
      production:  'https://play.google.com/store/apps/details?id=com.cisco.wx2.android'
    });
  });

  it('should return correct android app intent url', function () {
    whenCalling('getAndroidAppIntent').expectUrlToBe({
      development: 'intent://view?id=123#Intent;package=com.cisco.wx2.android;scheme=squared;end;',
      integration: 'intent://view?id=123#Intent;package=com.cisco.wx2.android;scheme=squared;end;',
      production:  'intent://view?id=123#Intent;package=com.cisco.wx2.android;scheme=squared;end;'
    });
  });

  it('should return correct web client url', function () {
    whenCalling('getWebClientUrl').expectUrlToBe({
      development: 'https://web.projectsquared.com/',
      integration: 'https://web.projectsquared.com/',
      production:  'https://web.projectsquared.com/'
    });
  });

  it('should return correct hercules url', function () {
    whenCalling('getHerculesUrl').expectUrlToBe({
      development: 'https://hercules-integration.wbx2.com/',
      integration: 'https://hercules-integration.wbx2.com/',
      production:  'https://hercules-a.wbx2.com/'
    });
  });

});
