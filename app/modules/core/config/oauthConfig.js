(function () {
  'use strict';

  var hostnameConfig = require('config/hostname.config');

  module.exports = angular
    .module('core.oauthconfig', [
      require('modules/core/config/config').default,
      require('modules/core/scripts/services/utils'),
    ])
    .factory('OAuthConfig', OAuthConfig)
    .name;

  function OAuthConfig(Utils, Config) {
    var scopes = [
      'webexsquare:admin',
      'webexsquare:billing',
      'ciscouc:admin',
      'Identity:SCIM',
      'Identity:Config',
      'Identity:Organization',
      'Identity:OAuthToken',
      'cloudMeetings:login',
      'webex-messenger:get_webextoken',
      'cloud-contact-center:admin',
      'spark-compliance:rooms_read',
      'compliance:spark_conversations_read',
      'contact-center-context:pod_read',
      'contact-center-context:pod_write',
      'spark-admin:people_read',
      'spark-admin:people_write',
      'spark-admin:customers_read',
      'spark-admin:customers_write',
      'spark-admin:organizations_read',
      'spark-admin:licenses_read',
      'spark-admin:logs_read',
      'spark:kms',
      // to onboard bot account
      'spark:applications_write',
      'spark:applications_read',
      // for Care Virtual Assistant
      'spark:messages_read',
      'spark:memberships_read',
      'spark:memberships_write',
      'spark:rooms_read',
    ];

    var oauth2Scope = encodeURIComponent(scopes.join(' '));

    var config = {
      oauthClientRegistration: {
        atlas: {
          id: 'C80fb9c7096bd8474627317ee1d7a817eff372ca9c9cee3ce43c3ea3e8d1511ec',
          secret: 'c10c371b4641010a750073b3c8e65a7fff0567400d316055828d3c74925b0857',
        },
        cfe: {
          id: 'C5469b72a6de8f8f0c5a23e50b073063ea872969fc74bb461d0ea0438feab9c03',
          secret: 'b485aae87723fc2c355547dce67bbe2635ff8052232ad812a689f2f9b9efa048',
        },
      },
      oauthUrl: {
        ciRedirectUrl: 'redirect_uri=%s',
        oauth2UrlAtlas: 'https://idbroker.webex.com/idb/oauth2/v1/',
        oauth2UrlCfe: 'https://idbrokerbts.webex.com/idb/oauth2/v1/',
        oauth2LoginUrlPattern: '%sauthorize?response_type=code&client_id=%s&scope=%s&redirect_uri=%s&state=%s&cisService=%s',
        oauth2ClientUrlPattern: 'grant_type=client_credentials&scope=',
        oauth2CodeUrlPattern: 'grant_type=authorization_code&code=%s&scope=',
        oauth2AccessCodeUrlPattern: 'grant_type=refresh_token&refresh_token=%s',
        userInfo: 'user_info=%s',
      },
      logoutUrl: 'https://idbroker.webex.com/idb/saml2/jsp/doSSO.jsp?type=logout&cisService=spark&goto=',
    };

    return {
      getAdminPortalUrl: getAdminPortalUrl,
      getLogoutUrl: getLogoutUrl,
      getClientId: getClientId,
      getOauthLoginUrl: getOauthLoginUrl,
      getOauthListTokenUrl: getOauthListTokenUrl,
      getAccessTokenUrl: getAccessTokenUrl,
      getOauthAccessCodeUrl: getOauthAccessCodeUrl,
      getOauthDeleteRefreshTokenUrl: getOauthDeleteRefreshTokenUrl,
      getAccessTokenPostData: getAccessTokenPostData,
      getNewAccessTokenPostData: getNewAccessTokenPostData,
      getOAuthClientRegistrationCredentials: getOAuthClientRegistrationCredentials,
      getOAuthRevokeUserTokenUrl: getOAuthRevokeUserTokenUrl,
    };

    // public

    function getLogoutUrl() {
      var acu = getAdminPortalUrl();
      return config.logoutUrl + encodeURIComponent(acu);
    }

    function getAccessTokenUrl() {
      return getOauth2Url() + 'access_token';
    }

    function getOauthDeleteRefreshTokenUrl() {
      return 'https://idbroker.webex.com/idb/oauth2/v1/tokens/user?refreshtokens=';
    }

    function getOAuthRevokeUserTokenUrl() {
      return getOauth2Url() + 'tokens?username=';
    }

    function getOAuthClientRegistrationCredentials() {
      return Utils.Base64.encode(getClientId() + ':' + getClientSecret());
    }

    function getOauthLoginUrl(email, oauthState) {
      var redirectUrl = getAdminPortalUrl();
      var pattern = config.oauthUrl.oauth2LoginUrlPattern;
      var params = [
        getOauth2Url(),
        getClientId(),
        oauth2Scope,
        encodeURIComponent(redirectUrl),
        oauthState,
        getOauthServiceType(),
      ];

      if (email) {
        params.push(encodeURIComponent(email));
        pattern = pattern + '&email=%s';
      }

      return Utils.sprintf(pattern, params);
    }

    function getOauthListTokenUrl() {
      return 'https://idbroker.webex.com/idb/oauth2/v1/tokens/user/';
    }

    function getOauthAccessCodeUrl(refresh_token) {
      var params = [
        refresh_token,
      ];
      return Utils.sprintf(config.oauthUrl.oauth2AccessCodeUrlPattern, params);
    }

    function getNewAccessTokenPostData(code, sessionId) {
      var oauthCodeUrl = Utils.sprintf(config.oauthUrl.oauth2CodeUrlPattern, [code]);
      return oauthCodeUrl + oauth2Scope + '&' + getRedirectUrl() + '&' + buildUserInfo(sessionId);
    }

    function getAccessTokenPostData() {
      return config.oauthUrl.oauth2ClientUrlPattern + oauth2Scope;
    }

    function getClientId() {
      var clientId = {
        cfe: config.oauthClientRegistration.cfe.id,
        dev: config.oauthClientRegistration.atlas.id,
        prod: config.oauthClientRegistration.atlas.id,
        integration: config.oauthClientRegistration.atlas.id,
      };
      return clientId[Config.getEnv()];
    }

    // private

    function getRedirectUrl() {
      var acu = getAdminPortalUrl();
      var params = [encodeURIComponent(acu)];
      return Utils.sprintf(config.oauthUrl.ciRedirectUrl, params);
    }

    function buildUserInfo(sessionId) {
      var clientInfo = { client_session_id: sessionId };
      var params = [JSON.stringify(clientInfo)];
      return Utils.sprintf(config.oauthUrl.userInfo, params);
    }

    function getAbsUrlForDev() {
      var urlAtRootContext = Config.getAbsUrlAtRootContext();
      var isOkayForRedir = Config.canUseAbsUrlForDevLogin(urlAtRootContext);
      return (isOkayForRedir) ? urlAtRootContext : 'http://127.0.0.1:8000';
    }

    function getAdminPortalUrl() {
      var adminPortalUrl = {
        dev: getAbsUrlForDev(),
        cfe: 'https://' + hostnameConfig.CFE,
        integration: 'https://' + hostnameConfig.INTEGRATION + '/',
        prod: 'https://' + hostnameConfig.PRODUCTION + '/',
      };
      var env = Config.isE2E() ? 'dev' : Config.getEnv();
      return adminPortalUrl[env];
    }

    function getClientSecret() {
      var clientSecret = {
        cfe: config.oauthClientRegistration.cfe.secret,
        dev: config.oauthClientRegistration.atlas.secret,
        prod: config.oauthClientRegistration.atlas.secret,
        integration: config.oauthClientRegistration.atlas.secret,
      };
      return clientSecret[Config.getEnv()];
    }

    function getOauth2Url() {
      var oAuth2Url = {
        dev: config.oauthUrl.oauth2UrlAtlas,
        cfe: config.oauthUrl.oauth2UrlCfe,
        integration: config.oauthUrl.oauth2UrlAtlas,
        prod: config.oauthUrl.oauth2UrlAtlas,
      };
      return oAuth2Url[Config.getEnv()];
    }

    function getOauthServiceType() {
      return 'spark';
    }
  }
}());
