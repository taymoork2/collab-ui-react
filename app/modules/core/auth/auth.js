'use strict';

angular
  .module('Core')
  .factory('Auth', Auth);

/* @ngInject */
function Auth($injector, $translate, $window, $q, Log, Config, SessionStorage, Authinfo, Utils, Storage, OAuthConfig) {

  return {
    logout: logout,
    authorize: authorize,
    getAccount: getAccount,
    isLoggedIn: isLoggedIn,
    setAccessToken: setAccessToken,
    redirectToLogin: redirectToLogin,
    getNewAccessToken: getNewAccessToken,
    refreshAccessToken: refreshAccessToken,
    setAuthorizationHeader: setAuthorizationHeader,
    refreshAccessTokenAndResendRequest: refreshAccessTokenAndResendRequest
  };

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

  function getAccount(org) {
    var url = Config.getAdminServiceUrl() + 'organization/' + org + '/accounts';
    return httpGET(url);
  }

  function getNewAccessToken(code) {
    var url = OAuthConfig.getAccessTokenUrl();
    var data = OAuthConfig.getNewAccessTokenPostData(code);
    var token = OAuthConfig.getOAuthClientRegistrationCredentials();

    return httpPOST(url, data, token)
      .then(updateAccessToken)
      .catch(handleError('Failed to obtain new oauth access_token.'));
  }

  function refreshAccessToken() {
    var refreshToken = Storage.get('refreshToken');

    var url = OAuthConfig.getAccessTokenUrl();
    var data = OAuthConfig.getOauthAccessCodeUrl(refreshToken);
    var token = OAuthConfig.getOAuthClientRegistrationCredentials();

    return httpPOST(url, data, token)
      .then(updateAccessToken)
      .catch(handleError('Failed to refresh access token'));
  }

  function refreshAccessTokenAndResendRequest(response) {
    return refreshAccessToken()
      .then(function () {
        var $http = $injector.get('$http');
        return $http(response.config);
      });
  }

  function setAccessToken() {
    var url = OAuthConfig.getAccessTokenUrl();
    var data = OAuthConfig.getAccessTokenPostData();
    var token = OAuthConfig.getOAuthClientRegistrationCredentials();

    return httpPOST(url, data, token)
      .then(updateAccessToken)
      .catch(handleError('Failed to obtain oauth access_token'));
  }

  function logout() {
    var url = OAuthConfig.getOauthDeleteTokenUrl();
    var data = 'token=' + Storage.get('accessToken');
    var token = OAuthConfig.getOAuthClientRegistrationCredentials();
    return httpPOST(url, data, token)
      .catch(handleError('Failed to delete the oAuth token'))
      .finally(function () {
        Storage.clear();
        $window.location.href = Config.getLogoutUrl();
      });
  }

  function isLoggedIn() {
    return !!Storage.get('accessToken');
  }

  function redirectToLogin(email) {
    if (email) {
      $window.location.href = OAuthConfig.getOauthLoginUrl(email);
    } else {
      var $state = $injector.get('$state');
      $state.go('login');
    }
  }

  // authorize helpers

  function getAuthorizationUrl() {
    var url = Config.getAdminServiceUrl();

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

  function injectMessengerService(authData) {
    var url = Config.getMessengerServiceUrl() + '/orgs/' + authData.orgId + '/cisync/';
    return httpGET(url)
      .then(function (res) {
        var isMessengerOrg = _.has(res, 'data.orgName') && _.has(res, 'data.orgID');
        if (isMessengerOrg) {
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
      }).catch(function (res) {
        handleError('Ignore error from Msgr service check.')(res);
        return authData;
      });
  }

  function replaceServices(authData) {
    var servicesUrl = Config.getAdminServiceUrl() + 'organizations/' + authData.orgId + '/services';
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
    if (Authinfo.isAdmin()) {
      return getAccount(Authinfo.getOrgId())
        .then(function (res) {
          Authinfo.updateAccountInfo(res.data);
          Authinfo.initializeTabs();
        });
    } else {
      Authinfo.initializeTabs();
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

  function updateAccessToken(response) {
    var token = _.get(response, 'data.access_token', '');
    Log.info('updateAccessToken: ' + token);
    Storage.put('accessToken', token);
    setAuthorizationHeader(token);
    return token;
  }

  function handleError(message) {
    return function (res) {
      Log.error(message, res && res.data || res.text);
    };
  }

  function setAuthorizationHeader(token) {
    $injector.get('$http').defaults.headers.common.Authorization = 'Bearer ' + (token || Storage.get('accessToken'));
  }

}
