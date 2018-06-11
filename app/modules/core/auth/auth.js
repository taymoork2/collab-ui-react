(function () {
  'use strict';

  module.exports = angular
    .module('core.auth.auth', [
      require('angular-translate'),
      require('angular-ui-router'),
      require('angular-sanitize'),
      require('modules/core/account').default,
      require('modules/core/auth/token.service'),
      require('modules/core/config/oauthConfig'),
      require('modules/core/config/urlConfig'),
      require('modules/core/scripts/services/authinfo'),
      require('modules/core/scripts/services/log'),
      require('modules/core/scripts/services/utils'),
      require('modules/core/storage').default,
      require('modules/huron/compass').default,
    ])
    .factory('Auth', Auth)
    .name;

  /* @ngInject */
  function Auth($http, $injector, $q, $sanitize, $window, AccountService, Authinfo, HuronCompassService, Log, OAuthConfig, SessionStorage, TokenService, UrlConfig, WindowLocation) {
    var service = {
      logout: logout,
      logoutAndRedirectTo: logoutAndRedirectTo,
      authorize: authorize,
      getCustomerAccount: getCustomerAccount,
      isLoggedIn: isLoggedIn,
      setAccessToken: setAccessToken,
      getClientAccessToken: getClientAccessToken,
      redirectToLogin: redirectToLogin,
      getNewAccessToken: getNewAccessToken,
      refreshAccessToken: refreshAccessToken,
      refreshAccessTokenAndResendRequest: refreshAccessTokenAndResendRequest,
      verifyOauthState: verifyOauthState,
      getAuthorizationUrl: getAuthorizationUrl,
      getAuthorizationUrlList: getAuthorizationUrlList,
      revokeUserAuthTokens: revokeUserAuthTokens,
      getAccessTokenWithNewScope: getAccessTokenWithNewScope,

    };

    var REFRESH_ACCESS_TOKEN_DEBOUNCE_MS = 1000;
    var debouncedRefreshAccessToken = _.debounce(
      refreshAccessToken,
      REFRESH_ACCESS_TOKEN_DEBOUNCE_MS,
      {
        leading: true,
        trailing: false,
      }
    );

    return service;

    var deferredAll;

    function authorize(options) {
      var reauthorize = _.get(options, 'reauthorize');
      if (deferredAll && !reauthorize) {
        return deferredAll;
      }

      deferredAll = httpGET(getAuthorizationUrl())
        .then(function (res) {
          return $q.all([
            deferredAuth(res),
            getHuronDomain(res),
          ]);
        })
        .then(function (responseArray) {
          return _.get(responseArray, '[0]');
        })
        .catch(resetAuthinfoAndRejectResponse);

      return deferredAll;
    }

    function deferredAuth(res) {
      return $q.resolve(res)
        .then(replaceOrTweakServices)
        .then(injectMessengerService)
        .then(initializeAuthinfo);
    }

    // TODO: remove this function and refactor others to use cached AccountService
    function getCustomerAccount(orgId) {
      if (!orgId || orgId === '') {
        return $q.reject('An Organization Id must be passed');
      }
      var url = UrlConfig.getAdminServiceUrl() + 'customers?orgId=' + orgId;
      return $http.get(url);
    }

    function getNewAccessToken(params) {
      var clientSessionId = TokenService.getOrGenerateClientSessionId();
      var url = OAuthConfig.getAccessTokenUrl();
      var data = OAuthConfig.getNewAccessTokenPostData(params.code, clientSessionId);
      var token = OAuthConfig.getOAuthClientRegistrationCredentials();

      // Security: verify authentication request came from our site
      if (service.verifyOauthState(params.state)) {
        return httpPOST(url, data, token)
          .then(updateOauthTokens)
          .catch(logErrorAndReject('Failed to obtain new oauth access token.'));
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

      var refreshPromise = refreshToken ? httpPOST(url, data, token) : $q.reject('refreshtoken not found');
      return refreshPromise
        .then(updateOauthTokens)
        .catch(function (response) {
          TokenService.completeLogout(redirectUrl);
          return logErrorAndReject('Failed to refresh access token')(response);
        });
    }

    function refreshAccessTokenAndResendRequest(response) {
      return debouncedRefreshAccessToken()
        .then(function () {
          var $http = $injector.get('$http');
          // replace the retried request with the new Authorization header
          _.set(response, 'config.headers.Authorization', _.get($http, 'defaults.headers.common.Authorization'));
          return $http(response.config);
        });
    }

    function setAccessToken() {
      return getClientAccessToken()
        .then(function (clientAccessToken) {
          return updateOauthTokens({ data: { access_token: clientAccessToken } });
        })
        .catch(logErrorAndReject('Failed to obtain oauth access token'));
    }

    function getClientAccessToken() {
      var url = OAuthConfig.getAccessTokenUrl();
      var data = OAuthConfig.getAccessTokenPostData();
      var token = OAuthConfig.getOAuthClientRegistrationCredentials();

      return httpPOST(url, data, token)
        .then(function (response) { return response.data.access_token; })
        .catch(logErrorAndReject('Failed to obtain oauth access token'));
    }

    function logout(loginMessage) {
      var redirectUrl = OAuthConfig.getLogoutUrl();
      return service.logoutAndRedirectTo(redirectUrl)
        .finally(function () {
          return TokenService.triggerGlobalLogout(loginMessage);
        });
    }

    function logoutAndRedirectTo(redirectUrl) {
      var listTokensUrl = OAuthConfig.getOauthListTokenUrl();
      return httpGET(listTokensUrl)
        .then(function (response) {
          var promises = [];
          var clientTokens = _.filter(response.data.data, {
            client_id: OAuthConfig.getClientId(),
            user_info: {
              client_session_id: TokenService.getClientSessionId(),
            },
          });

          _.each(clientTokens, function (tokenData) {
            var refreshTokenId = tokenData.token_id;
            var revoke = revokeAuthTokens(refreshTokenId, redirectUrl);
            promises.push(revoke);
          });

          return $q.all(promises)
            .catch(logErrorAndReject('Failed to revoke refresh tokens'));
        })
        .catch(logErrorAndReject('Failed to get and revoke refresh tokens'))
        .finally(function () {
          return TokenService.completeLogout(redirectUrl);
        });
    }

    function revokeAuthTokens(tokenId) {
      var revokeUrl = OAuthConfig.getOauthDeleteRefreshTokenUrl() + $sanitize(tokenId);
      return $http.delete(revokeUrl)
        .catch(logErrorAndReject('Failed to delete the oAuth token'));
    }

    function revokeUserAuthTokens(userName, orgId) {
      if (!_.isString(userName) || !_.isString(orgId)) {
        return $q.reject('Invalid parameters passed');
      }
      var revokeUrl = OAuthConfig.getOAuthRevokeUserTokenUrl() + $window.encodeURIComponent(userName) + '&orgid=' + orgId;
      return $http.delete(revokeUrl);
    }

    function isLoggedIn() {
      return !!TokenService.getAccessToken();
    }

    function redirectToLogin(email, sso) {
      if (email) {
        WindowLocation.set(OAuthConfig.getOauthLoginUrl(email, OAuthConfig.getOauthState()));
      } else if (sso) {
        WindowLocation.set(OAuthConfig.getOauthLoginUrl(null, OAuthConfig.getOauthState()));
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

    function allowMessengerService(syncInfo, userRoles) {
      // both 'orgName' and 'orgID' must exist, and 'wapiOrgStatus' cannot be 'inactive'
      if (!syncInfo.orgName || !syncInfo.orgID || syncInfo.wapiOrgStatus === 'inactive') {
        return false;
      }

      // user is a full admin or a read-only admin
      if (_.intersection(['Full_Admin', 'Readonly_Admin'], userRoles).length) {
        return true;
      }

      // user is not a partner
      return !_.intersection(['PARTNER_ADMIN', 'PARTNER_READ_ONLY_ADMIN', 'PARTNER_USER'], userRoles).length;
    }

    // notes:
    // - currently (2017-05-11), this logic is used to stub in a fake org-level entitlement into the
    //   logged-in users's auth data
    // - the primary use-case for this is to allow access to the 'messenger' UI state (see
    //   'Authinfo.isAllowedState()')
    function injectMessengerService(authData) {
      var url = UrlConfig.getMessengerServiceUrl() + '/orgs/' + authData.orgId + '/cisync/';
      return httpGET(url)
        .then(function (res) {
          var syncInfo = _.get(res, 'data', {});
          if (allowMessengerService(syncInfo, authData.roles)) {
            Log.debug('This Org is migrated from Messenger, add webex-messenger service to Auth data');
            authData.services.push({
              serviceId: 'jabberMessenger',
              displayName: 'Messenger',
              ciName: 'webex-messenger',
              type: 'PAID',
              isBeta: false,
              isConfigurable: false,
              isIgnored: true,
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
          sqService: undefined,
        });
      });
      return authData;
    }

    function initializeAuthinfo(authData) {
      Authinfo.initialize(authData);
      if (Authinfo.isAdmin() || Authinfo.isReadOnlyAdmin() || Authinfo.isUserAdminUser() || Authinfo.isDeviceAdminUser()) {
        return AccountService.updateAuthinfoAccount().then(function () {
          return authData;
        });
      } else {
        return authData;
      }
    }

    function replaceOrTweakServices(res) {
      var authData = _.get(res, 'data');
      var isAdmin = _.intersection(['Full_Admin', 'PARTNER_ADMIN', 'Readonly_Admin', 'PARTNER_READ_ONLY_ADMIN'], authData.roles).length;
      if (isAdmin) {
        return replaceServices(authData);
      } else {
        return tweakServices(authData);
      }
    }

    function resetAuthinfoAndRejectResponse(response) {
      Authinfo.clear();
      return $q.reject(response);
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
          'Authorization': 'Basic ' + token,
        },
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

    function verifyOauthState(testState) {
      return _.isEqual(testState, OAuthConfig.getOauthState());
    }

    function logErrorAndReject(message) {
      return function (res) {
        Log.error(message, res && (res.data || res.text));
        return $q.reject(res);
      };
    }

    function getHuronDomain(res) {
      var authData = _.get(res, 'data');
      return HuronCompassService.fetchDomain(authData);
    }

    function getNewAccessCode() {
      var url = OAuthConfig.getNewOauthAccessCodeUrl();
      var $http = $injector.get('$http');
      return $http({
        method: 'GET',
        url: url,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        withCredentials: true,
      });
    }

    function getAccessTokenWithNewScope() {
      var clientSessionId = TokenService.getOrGenerateClientSessionId();
      var token = OAuthConfig.getOAuthClientRegistrationCredentials();
      var url = OAuthConfig.getAccessTokenUrl();
      return getNewAccessCode()
        .then(function (resp) {
          var ref;
          if (resp && _.isString(resp.data)) {
            ref = resp.data.match(/<title>(.*)</);
          }
          var code = ref ? ref[1] : '';
          var data = OAuthConfig.getNewAccessTokenPostData(code, clientSessionId);
          return httpPOST(url, data, token)
            .then(updateOauthTokens)
            .catch(logErrorAndReject('Failed to obtain new oauth access token'));
        }).catch(logErrorAndReject('Failed to obtain new oauth code'));
    }
  }
})();
