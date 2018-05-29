'use strict';

var testModule = require('./oauthConfig');

describe('OAuthConfig', function () {
  var Config, OAuthConfig, $location;
  beforeEach(angular.mock.module(testModule));

  beforeEach(inject(function (_$location_, _Config_, _OAuthConfig_) {
    Config = _Config_;
    OAuthConfig = _OAuthConfig_;
    $location = _$location_;
    spyOn($location, 'host');
  }));

  afterEach(function () {
    Config = OAuthConfig = $location = undefined;
  });
  var devHost = 'localhost';
  var prodHost = 'admin.webex.com';
  var cfeHost = 'cfe-admin.webex.com';
  var intHost = 'int-admin.webex.com';
  var scope = encodeURIComponent('webexsquare:admin webexsquare:billing ciscouc:admin Identity:SCIM Identity:Config Identity:Organization Identity:OAuthToken cloudMeetings:login webex-messenger:get_webextoken cloud-contact-center:admin spark-compliance:rooms_read spark-compliance:people_read spark-compliance:organizations_read compliance:spark_conversations_read contact-center-context:pod_read contact-center-context:pod_write spark-admin:people_read spark-admin:people_write spark-admin:customers_read spark-admin:customers_write spark-admin:organizations_read spark-admin:licenses_read spark-admin:logs_read spark:kms spark:applications_write spark:applications_read spark:messages_read spark:memberships_read spark:memberships_write spark:rooms_read ucmgmt-uaas:admin ucmgmt-laas:admin');

  var whenCalling = function (fn, arg1, arg2) {
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

          if (!OAuthConfig[fn]) {
            throw new Error('Unknown method ' + fn);
          }
          $location.host.and.returnValue(host);
          var actual = OAuthConfig[fn](arg1, arg2);

          if (expected !== actual) {
            throw new Error('Expected ' + fn + ' in ' + env + " to be '" + expected + "' but it was '" + actual + "'");
          }
        });
      },
    };
  };

  afterAll(function () {
    devHost = prodHost = cfeHost = intHost = scope = whenCalling = undefined;
  });

  it('should return correct access code url', function () {
    whenCalling('getOauthAccessCodeUrl', 'foo').expectUrlToBe({
      dev: 'grant_type=refresh_token&refresh_token=foo',
      cfe: 'grant_type=refresh_token&refresh_token=foo',
      integration: 'grant_type=refresh_token&refresh_token=foo',
      prod: 'grant_type=refresh_token&refresh_token=foo',
    });
  });

  it('should return correct oauth login url', function () {
    whenCalling('getOauthLoginUrl', 'a@a.com', 'random-string').expectUrlToBe({
      dev: 'https://idbroker.webex.com/idb/oauth2/v1/authorize?response_type=code&client_id=C80fb9c7096bd8474627317ee1d7a817eff372ca9c9cee3ce43c3ea3e8d1511ec&scope=' + scope + '&redirect_uri=http%3A%2F%2F127.0.0.1%3A8000%2F&state=random-string&cisService=common&email=a%40a.com',
      cfe: 'https://idbrokerbts.webex.com/idb/oauth2/v1/authorize?response_type=code&client_id=C5469b72a6de8f8f0c5a23e50b073063ea872969fc74bb461d0ea0438feab9c03&scope=' + scope + '&redirect_uri=https%3A%2F%2Fcfe-admin.webex.com%2F&state=random-string&cisService=common&email=a%40a.com',
      integration: 'https://idbroker.webex.com/idb/oauth2/v1/authorize?response_type=code&client_id=C80fb9c7096bd8474627317ee1d7a817eff372ca9c9cee3ce43c3ea3e8d1511ec&scope=' + scope + '&redirect_uri=https%3A%2F%2Fint-admin.webex.com%2F&state=random-string&cisService=common&email=a%40a.com',
      prod: 'https://idbroker.webex.com/idb/oauth2/v1/authorize?response_type=code&client_id=C80fb9c7096bd8474627317ee1d7a817eff372ca9c9cee3ce43c3ea3e8d1511ec&scope=' + scope + '&redirect_uri=https%3A%2F%2Fadmin.webex.com%2F&state=random-string&cisService=common&email=a%40a.com',
    });
  });

  it('should return the correct oauth credentials', function () {
    var creds = OAuthConfig.getOAuthClientRegistrationCredentials();
    expect(creds).toBe('QzgwZmI5YzcwOTZiZDg0NzQ2MjczMTdlZTFkN2E4MTdlZmYzNzJjYTljOWNlZTNjZTQzYzNlYTNlOGQxNTExZWM6YzEwYzM3MWI0NjQxMDEwYTc1MDA3M2IzYzhlNjVhN2ZmZjA1Njc0MDBkMzE2MDU1ODI4ZDNjNzQ5MjViMDg1Nw==');
  });

  it('should return correct logout url', function () {
    $location.host.and.returnValue('fake-domain');
    var url = OAuthConfig.getLogoutUrl();
    expect(url).toBe('https://idbroker.webex.com/idb/saml2/jsp/doSSO.jsp?type=logout&cisService=common&goto=https%3A%2F%2Ffake-domain%2F');
  });

  it('should return correct revoke access token url', function () {
    whenCalling('getOAuthRevokeUserTokenUrl', 'random-string', 'random-string').expectUrlToBe({
      dev: 'https://idbroker.webex.com/idb/oauth2/v1/tokens?username=',
      cfe: 'https://idbrokerbts.webex.com/idb/oauth2/v1/tokens?username=',
      integration: 'https://idbroker.webex.com/idb/oauth2/v1/tokens?username=',
      prod: 'https://idbroker.webex.com/idb/oauth2/v1/tokens?username=',
    });
  });

  it('should return getNewOauthAccessCodeUrl', function () {
    var state = OAuthConfig.getOauthState();
    var redirectUri = '=urn%3Aietf%3Awg%3Aoauth%3A2.0%3Aoob';
    whenCalling('getNewOauthAccessCodeUrl').expectUrlToBe({
      dev: 'https://idbroker.webex.com/idb/oauth2/v1/authorize?response_type=code&client_id=C80fb9c7096bd8474627317ee1d7a817eff372ca9c9cee3ce43c3ea3e8d1511ec&scope=' + scope + '&redirect_uri' + redirectUri + '&state=' + state,
      cfe: 'https://idbrokerbts.webex.com/idb/oauth2/v1/authorize?response_type=code&client_id=C5469b72a6de8f8f0c5a23e50b073063ea872969fc74bb461d0ea0438feab9c03&scope=' + scope + '&redirect_uri' + redirectUri + '&state=' + state,
      integration: 'https://idbroker.webex.com/idb/oauth2/v1/authorize?response_type=code&client_id=C80fb9c7096bd8474627317ee1d7a817eff372ca9c9cee3ce43c3ea3e8d1511ec&scope=' + scope + '&redirect_uri' + redirectUri + '&state=' + state,
      prod: 'https://idbroker.webex.com/idb/oauth2/v1/authorize?response_type=code&client_id=C80fb9c7096bd8474627317ee1d7a817eff372ca9c9cee3ce43c3ea3e8d1511ec&scope=' + scope + '&redirect_uri' + redirectUri + '&state=' + state,
    });
  });

  describe('getAdminPortalUrl():', function () {
    function initSpies(spies) {
      spyOn(Config, 'isE2E').and.returnValue(spies.isE2E === undefined ? false : spies.isE2E);
      spyOn(Config, 'isDev').and.returnValue(spies.isDev === undefined ? false : spies.isDev);
      spyOn(Config, 'getAbsUrlForDev').and.returnValue('fake-absolute-local-url');
      $location.host.and.returnValue(spies.host === undefined ? '' : spies.host);
    }
    it('should return loopback address if is E2E', function () {
      initSpies({
        isE2E: true,
      });
      var url = OAuthConfig.getAdminPortalUrl();
      expect(url).toBe('fake-absolute-local-url');
    });

    it('should return loopback address if is dev', function () {
      initSpies({
        isDev: true,
      });
      var url = OAuthConfig.getAdminPortalUrl();
      expect(url).toBe('fake-absolute-local-url');
    });

    it('should return $location.host() https address with a trailing slash otherwise', function () {
      initSpies({
        host: 'fake-location-host',
      });
      var url = OAuthConfig.getAdminPortalUrl();
      expect(url).toBe('https://fake-location-host/');
    });
  });
});
