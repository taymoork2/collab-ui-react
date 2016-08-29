(function () {
  'use strict';

  module.exports = angular
    .module('core.auth', [
      'pascalprecht.translate',
      'ui.router',
      require('modules/core/auth/token.service'),
      require('modules/core/config/config'),
      require('modules/core/config/oauthConfig'),
      require('modules/core/config/urlConfig'),
      require('modules/core/scripts/services/authinfo'),
      require('modules/core/scripts/services/log'),
      require('modules/core/scripts/services/sessionstorage'),
      require('modules/core/scripts/services/storage'),
      require('modules/core/scripts/services/utils'),
      require('modules/core/windowLocation/windowLocation'),
    ])
    .factory('Auth', Auth)
    .name;

  /* @ngInject */
  function Auth($http, $injector, $q, $sanitize, $translate, Authinfo, Log, OAuthConfig, SessionStorage, TokenService, UrlConfig, Utils, WindowLocation) {

    var service = {
      logout: logout,
      logoutAndRedirectTo: logoutAndRedirectTo,
      authorize: authorize,
      getCustomerAccount: getCustomerAccount,
      isLoggedIn: isLoggedIn,
      setAccessToken: setAccessToken,
      redirectToLogin: redirectToLogin,
      getNewAccessToken: getNewAccessToken,
      refreshAccessToken: refreshAccessToken,
      refreshAccessTokenAndResendRequest: refreshAccessTokenAndResendRequest,
      verifyOauthState: verifyOauthState,
      getAuthorizationUrl: getAuthorizationUrl,
      getAuthorizationUrlList: getAuthorizationUrlList
    };

    return service;

    var deferred;

    function authorize() {
      if (deferred) return deferred;

      deferred = httpGET(getAuthorizationUrl())
        .then(replaceOrTweakServices)
        .then(injectMessengerService)
        .then(initializeAuthinfo)
        .catch(handleErrorAndResetAuthinfo);

      return deferred;
    }

    function getCustomerAccount(orgId) {
      if (!orgId || orgId === '') {
        return $q.reject('An Organization Id must be passed');
      }
      var url = UrlConfig.getAdminServiceUrl() + 'customers?orgId=' + orgId;
      return $http.get(url);
    }

    function getNewAccessToken(params) {
      var url = OAuthConfig.getAccessTokenUrl();
      var data = OAuthConfig.getNewAccessTokenPostData(params.code);
      var token = OAuthConfig.getOAuthClientRegistrationCredentials();

      // Security: verify authentication request came from our site
      if (service.verifyOauthState(params.state)) {
        return httpPOST(url, data, token)
          .then(updateOauthTokens)
          .catch(handleError('Failed to obtain new oauth access_token.'));
      } else {
        TokenService.clearStorage();
        return $q.reject();
      }
    }

    function refreshAccessToken() {
      var redirectUrl = OAuthConfig.getLogoutUrl();
      var refreshToken = TokenService.getRefreshToken();
      var url = OAuthConfig.getAccessTokenUrl();
      var data = OAuthConfig.getOauthAccessCodeUrl(refreshToken);
      var token = OAuthConfig.getOAuthClientRegistrationCredentials();

      if (refreshToken) {
        return httpPOST(url, data, token)
        .then(updateOauthTokens)
        .catch(function () {
          handleError('Failed to refresh access token');
          TokenService.completeLogout(redirectUrl);
        });
      } else {
        return $q.reject('refreshtoken not found');
      }
    }

    function refreshAccessTokenAndResendRequest(response) {
      var redirectUrl = OAuthConfig.getLogoutUrl();

      return refreshAccessToken()
        .then(function () {
          var $http = $injector.get('$http');
          return $http(response.config);
        })
        .catch(function () {
          TokenService.completeLogout(redirectUrl);
        });
    }

    function setAccessToken() {
      var url = OAuthConfig.getAccessTokenUrl();
      var data = OAuthConfig.getAccessTokenPostData();
      var token = OAuthConfig.getOAuthClientRegistrationCredentials();

      return httpPOST(url, data, token)
        .then(updateOauthTokens)
        .catch(handleError('Failed to obtain oauth access_token'));
    }

    function logout() {
      var redirectUrl = OAuthConfig.getLogoutUrl();
      TokenService.triggerGlobalLogout();
      return service.logoutAndRedirectTo(redirectUrl);
    }

    function logoutAndRedirectTo(redirectUrl) {
      var listTokensUrl = OAuthConfig.getOauthListTokenUrl();
      return httpGET(listTokensUrl)
        .then(function (response) {
          var promises = [];
          var clientTokens = _.filter(response.data.data, {
            client_id: OAuthConfig.getClientId()
          });

          _.each(clientTokens, function (tokenData) {
            var refreshTokenId = tokenData.token_id;
            var revoke = revokeAuthTokens(refreshTokenId, redirectUrl);
            promises.push(revoke);
          });

          $q.all(promises).catch(function () {
            handleError('Failed to revoke the refresh tokens');
          })
          .finally(function () {
            TokenService.completeLogout(redirectUrl);
          });
        })
        .catch(function () {
          handleError('Failed to retrieve token_id');
          TokenService.completeLogout(redirectUrl);
        });
    }

    function revokeAuthTokens(tokenId) {
      var revokeUrl = OAuthConfig.getOauthDeleteRefreshTokenUrl() + $sanitize(tokenId);
      return $http.delete(revokeUrl)
        .catch(handleError('Failed to delete the oAuth token'));
    }

    function isLoggedIn() {
      return !!TokenService.getAccessToken();
    }

    function redirectToLogin(email, sso) {
      if (email) {
        WindowLocation.set(OAuthConfig.getOauthLoginUrl(email, getOauthState()));
      } else if (sso) {
        WindowLocation.set(OAuthConfig.getOauthLoginUrl(null, getOauthState()));
      } else {
        var $state = $injector.get('$state');
        $state.go('login');
      }
    }

    // authorize helpers

    function getAuthorizationUrl(org) {
      var url = UrlConfig.getAdminServiceUrl();

      if (org) {
        return url + 'organization/' + org + '/userauthinfo';
      }

      var customerOrgId = SessionStorage.get('customerOrgId');
      if (customerOrgId) {
        return url + 'organization/' + customerOrgId + '/userauthinfo';
      }

      var partnerOrgId = SessionStorage.get('partnerOrgId');
      if (partnerOrgId) {
        return url + 'organization/' + partnerOrgId + '/userauthinfo?launchpartnerorg=true';
      }

      return url + 'userauthinfo';
    }

    function getAuthorizationUrlList() {
      var authUrl = getAuthorizationUrl();
      return httpGET(authUrl);
    }

    function injectMessengerService(authData) {
      var url = UrlConfig.getMessengerServiceUrl() + '/orgs/' + authData.orgId + '/cisync/';
      return httpGET(url)
        .then(function (res) {
          var isMessengerOrg = _.has(res, 'data.orgName') && _.has(res, 'data.orgID');
          var isAdminForMsgr = _.intersection(['Full_Admin', 'Readonly_Admin'], authData.roles).length;
          var isPartnerAdmin = _.intersection(['PARTNER_ADMIN', 'PARTNER_READ_ONLY_ADMIN', 'PARTNER_USER'], authData.roles).length;
          if (isMessengerOrg && (isAdminForMsgr || !isPartnerAdmin)) {
            Log.debug('This Org is migrated from Messenger, add webex-messenger service to Auth data');
            authData.services.push({
              serviceId: 'jabberMessenger',
              displayName: 'Messenger',
              ciName: 'webex-messenger',
              type: 'PAID',
              isBeta: false,
              isConfigurable: false,
              isIgnored: true
            });
          }
          return authData;
        }).catch(function () {
          return authData;
        });
    }

    function replaceServices(authData) {
      var servicesUrl = UrlConfig.getAdminServiceUrl() + 'organizations/' + authData.orgId + '/services';
      return httpGET(servicesUrl).then(function (res) {
        authData.services = res.data.entitlements;
        return authData;
      });
    }

    function tweakServices(authData) {
      authData.services = _.map(authData.services, function (service) {
        return _.assign(service, {
          ciName: service.ciService || service.ciName,
          serviceId: service.sqService || service.serviceId,
          ciService: undefined,
          sqService: undefined
        });
      });
      return authData;
    }

    function initializeAuthinfo(authData) {
      Authinfo.initialize(authData);
      if (Authinfo.isAdmin() || Authinfo.isReadOnlyAdmin()) {
        return getCustomerAccount(Authinfo.getOrgId())
          .then(function (res) {
            Authinfo.updateAccountInfo(res.data);
          });
      } else {
        return authData;
      }
    }

    function replaceOrTweakServices(res) {
      var authData = res.data;
      var isAdmin = _.intersection(['Full_Admin', 'PARTNER_ADMIN', 'Readonly_Admin', 'PARTNER_READ_ONLY_ADMIN'], authData.roles).length;
      if (isAdmin) {
        return replaceServices(authData);
      } else {
        return tweakServices(authData);
      }
    }

    function handleErrorAndResetAuthinfo(res) {
      Authinfo.clear();
      if (res && res.status == 401) {
        return $q.reject($translate.instant('errors.status401'));
      }
      if (res && res.status == 403) {
        return $q.reject($translate.instant('errors.status403'));
      }
      return $q.reject($translate.instant('errors.serverDown'));
    }

    // helpers

    function httpGET(url) {
      var $http = $injector.get('$http');
      return $http.get(url);
    }

    function httpPOST(url, data, token) {
      var $http = $injector.get('$http');
      return $http({
        method: 'POST',
        url: url,
        data: data,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + token
        }
      });
    }

    function updateOauthTokens(response) {
      var accessToken = _.get(response, 'data.access_token', '');

      if (_.has(response, 'data.refresh_token')) {
        var refreshToken = _.get(response, 'data.refresh_token');
        TokenService.setRefreshToken(refreshToken);
      }

      Log.info('Update Access Token');
      TokenService.setAccessToken(accessToken);
      TokenService.setAuthorizationHeader(accessToken);

      return accessToken;
    }

    function getOauthState() {
      var state = SessionStorage.get('oauthState') || generateOauthState();
      return state;
    }

    function generateOauthState() {
      var state = Utils.getUUID();
      SessionStorage.put('oauthState', state);
      return state;
    }

    function verifyOauthState(testState) {
      return _.isEqual(testState, getOauthState());
    }

    function handleError(message) {
      return function (res) {
        Log.error(message, res && (res.data || res.text));
        return $q.reject(res);
      };
    }
  }
})();
