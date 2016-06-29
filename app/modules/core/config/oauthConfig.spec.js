'use strict';

describe('OAuthConfig', function () {
  beforeEach(angular.mock.module('Core'));

  var OAuthConfig, $location, Config;

  beforeEach(inject(function (_$location_, _OAuthConfig_, _Config_) {
    Config = _Config_;
    OAuthConfig = _OAuthConfig_;
    $location = _$location_;
    spyOn($location, 'host');
  }));

  var devHost = 'localhost';
  var prodHost = 'admin.ciscospark.com';
  var cfeHost = 'cfe-admin.ciscospark.com';
  var intHost = 'int-admin.ciscospark.com';
  var scope = 'webexsquare%3Aadmin%20webexsquare%3Abilling%20ciscouc%3Aadmin%20Identity%3ASCIM%20Identity%3AConfig%20Identity%3AOrganization%20cloudMeetings%3Alogin%20webex-messenger%3Aget_webextoken%20ccc_config%3Aadmin%20compliance%3Aspark_conversations_read%20contact-center-context%3Apod_read%20contact-center-context%3Apod_write';

  var whenCalling = function (fn, arg1, arg2) {
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
          if (!OAuthConfig[fn]) {
            throw new Error("Unknown method " + fn);
          }
          $location.host.and.returnValue(host);
          var actual = OAuthConfig[fn](arg1, arg2);

          if (expected != actual) {
            throw new Error("Expected " + fn + " in " + env + " to be '" + expected + "' but it was '" + actual + "'");
          }
        });
      }
    };
  };

  it('should return correct access code url', function () {
    whenCalling('getOauthAccessCodeUrl', 'foo').expectUrlToBe({
      dev: 'grant_type=refresh_token&refresh_token=foo&scope=' + scope,
      cfe: 'grant_type=refresh_token&refresh_token=foo&scope=' + scope,
      integration: 'grant_type=refresh_token&refresh_token=foo&scope=' + scope,
      prod: 'grant_type=refresh_token&refresh_token=foo&scope=' + scope
    });
  });

  it('should return correct oauth login url', function () {
    whenCalling('getOauthLoginUrl', 'a@a.com', 'random-string').expectUrlToBe({
      dev: 'https://idbroker.webex.com/idb/oauth2/v1/authorize?response_type=code&client_id=C80fb9c7096bd8474627317ee1d7a817eff372ca9c9cee3ce43c3ea3e8d1511ec&scope=' + scope + '&redirect_uri=http%3A%2F%2F127.0.0.1%3A8000&state=random-string&service=spark&email=a%40a.com',
      cfe: 'https://idbrokerbts.webex.com/idb/oauth2/v1/authorize?response_type=code&client_id=C5469b72a6de8f8f0c5a23e50b073063ea872969fc74bb461d0ea0438feab9c03&scope=' + scope + '&redirect_uri=https%3A%2F%2Fcfe-admin.ciscospark.com&state=random-string&service=spark&email=a%40a.com',
      integration: 'https://idbroker.webex.com/idb/oauth2/v1/authorize?response_type=code&client_id=C80fb9c7096bd8474627317ee1d7a817eff372ca9c9cee3ce43c3ea3e8d1511ec&scope=' + scope + '&redirect_uri=https%3A%2F%2Fint-admin.ciscospark.com%2F&state=random-string&service=spark&email=a%40a.com',
      prod: 'https://idbroker.webex.com/idb/oauth2/v1/authorize?response_type=code&client_id=C80fb9c7096bd8474627317ee1d7a817eff372ca9c9cee3ce43c3ea3e8d1511ec&scope=' + scope + '&redirect_uri=https%3A%2F%2Fadmin.ciscospark.com%2F&state=random-string&service=spark&email=a%40a.com'
    });
  });

  it('should return the correct oauth credentials', function () {
    var creds = OAuthConfig.getOAuthClientRegistrationCredentials();
    expect(creds).toBe('QzgwZmI5YzcwOTZiZDg0NzQ2MjczMTdlZTFkN2E4MTdlZmYzNzJjYTljOWNlZTNjZTQzYzNlYTNlOGQxNTExZWM6YzEwYzM3MWI0NjQxMDEwYTc1MDA3M2IzYzhlNjVhN2ZmZjA1Njc0MDBkMzE2MDU1ODI4ZDNjNzQ5MjViMDg1Nw==');
  });

  it('should return correct logout url', function () {
    var url = OAuthConfig.getLogoutUrl();
    expect(url).toBe('https://idbroker.webex.com/idb/saml2/jsp/doSSO.jsp?type=logout&service=webex-squared&goto=https%3A%2F%2Fadmin.ciscospark.com%2F');
  });
});
