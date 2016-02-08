'use strict';

angular
  .module('Core')
  .factory('Auth', Auth);

/* @ngInject */
function Auth($injector, $translate, $window, $q, Log, Config, SessionStorage, Authinfo, Utils, Storage) {

  var authDeferred;

  /* 
    still untested and not refactored, will fix in my next PR 
    - stimurbe
  */
  function authorize () {
    if (authDeferred) return authDeferred.promise;
    authDeferred = $q.defer();

    var authorizeUrl = Config.getAdminServiceUrl();
    var currentOrgId = SessionStorage.get('customerOrgId');
    var partnerOrgId = SessionStorage.get('partnerOrgId');

    var orgId = null;
    var authUrl = null;

    if (currentOrgId) {
      authUrl = authorizeUrl + 'organization/' + currentOrgId + '/userauthinfo';
      orgId = currentOrgId;
    } else if (partnerOrgId) {
      authUrl = authorizeUrl + 'organization/' + partnerOrgId + '/userauthinfo?launchpartnerorg=true';
      orgId = partnerOrgId;
    } else {
      authUrl = authorizeUrl + 'userauthinfo';
    }

    //Return data from the /userauthinfo API, with data from the /services API
    //grafted onto it if the user has access to /services (instead of the native
    //"services" field from the /userauthinfo response.) This allows us to expose
    //the "isConfigurable" flag in objects that appear in the /services API response.
    var getAuthData = function () {
      var result;

      return httpGET(authUrl).then(function (authResponse) {

          //We'll need to explicitly use values from the response instead of
          //using Authinfo, since Authinfo.initialize() hasn't been called yet

          result = angular.copy(authResponse.data);

          //Figure out whether this user is allowed to access the /services API
          var doServicesRequest = (result.roles && _.isArray(result.roles)) ?
            _.any(['Full_Admin', 'PARTNER_ADMIN'], function (role) {
              return result.roles.indexOf(role) > -1;
            }) : false;

          //Do the /services requset if the user is allowed to;
          //otherwise, explicitly return null
          if (doServicesRequest) {
            var servicesUrl = Config.getAdminServiceUrl() + 'organizations/' + result.orgId + '/services';
            return httpGET(servicesUrl);
          } else {
            return $q.when(null);
          }

        })
        .then(function (servicesResponse) {

          //If we received data from the /services API (not null)...
          if (servicesResponse) {

            //Replace the value of the "services" field in the /userauthinfo API response
            //with the related/more detailed data provided by the /services API
            result.services = angular.copy(servicesResponse.data.entitlements);

            //If we did NOT receive data from the /services API,
            //Change some relevant key names in the /userauthinfo API response's
            //"services" field to match the format of the /services API, so that
            //consuming code doesn't have to know about two sets of key names
          } else if (_.isArray(result.services)) {

            result.services = result.services.map(function (service) {
              service = angular.copy(service);
              if (service.ciService) {
                service.ciName = service.ciService;
                delete service.ciService;
              }
              if (service.sqService) {
                service.serviceId = service.sqService;
                delete service.sqService;
              }
              return service;
            });
          }

          // A temp workaround to bring Messenger Service Tab back with webex-messenger service/entitlement removed from backend.
          var msgrServiceUrl = Config.getMessengerServiceUrl() + '/orgs/' + result.orgId + '/cisync/';

          return httpGET(msgrServiceUrl).then(function (msgrResponse) {

            var isMsgrOrg = _.has(msgrResponse, 'data.orgName') && _.has(msgrResponse, 'data.orgID');
            if (isMsgrOrg) {

              Log.debug('This Org is migrated from Messenger, add webex-messenger service to Auth data');

              // Better get from CI or backend, hard code now since it's workaround and content is stable
              var msgr_service = {
                "serviceId": "jabberMessenger",
                "displayName": "Messenger",
                "ciName": "webex-messenger",
                "type": "PAID",
                "isBeta": false,
                "isConfigurable": false,
                "isIgnored": true
              };

              result.services.push(msgr_service);
            }

            return result;
          }).catch(function (msgrErrResp) {

            Log.error('Ignore error from Msgr service check: error code = ' + msgrErrResp.status);
            return result;
          });

        })
        .catch(function (response) {
          Authinfo.clear();
          var error = $translate.instant('errors.serverDown');
          if (response) {
            if (response.status === 403) {
              error = $translate.instant('errors.status403');
            } else if (response.status === 401) {
              error = $translate.instant('errors.status401');
            }
          }
          return $q.reject(error);
        });
    };

    getAuthData().then(function (authData) {
      Authinfo.initialize(authData);
      if (Authinfo.isAdmin()) {
        getAccount(Authinfo.getOrgId())
          .success(function (data, status) {
            Authinfo.updateAccountInfo(data, status);
            Authinfo.initializeTabs();
          })
          .finally(authDeferred.resolve);
      } else {
        Authinfo.initializeTabs();
        authDeferred.resolve();
      }
    });

    return authDeferred.promise;
  };

  function getAccount(org) {
    var url = Config.getAdminServiceUrl() + 'organization/' + org + '/accounts';
    return httpGET(url);
  };

  function getNewAccessToken (code) {
    var url = Config.getOauth2Url() + 'access_token';
    var token = Config.getOAuthClientRegistrationCredentials();
    var data = Config.getOauthCodeUrl(code) + Config.oauthClientRegistration.scope + '&' + Config.getRedirectUrl();

    return httpPOST(url, data, token).then(
      updateAccessToken, 
      handleError('Failed to obtain new oauth access_token.')
    );
  };

  function refreshAccessToken() {
    var refreshToken = Storage.get('refreshToken');
    var url = Config.getOauth2Url() + 'access_token';
    var data = Config.getOauthAccessCodeUrl(refreshToken);
    var token = Config.getOAuthClientRegistrationCredentials();
    
    return httpPOST(url, data, token).then(updateAccessToken);
  };

  function setAccessToken() {
    var url = Config.getOauth2Url() + 'access_token';
    var token = Config.getOAuthClientRegistrationCredentials();
    var data = Config.oauthUrl.oauth2ClientUrlPattern + Config.oauthClientRegistration.atlas.scope;

    return httpPOST(url, data, token).then(
      updateAccessToken, 
      handleError('Failed to obtain oauth access_token')
    );
  };


  function refreshAccessTokenAndResendRequest(response) {
    return refreshAccessToken()
      .then(function (token) {
        var $http = $injector.get('$http');
        return $http(response.config);
      });
  };

  function logout () {
    var url = Config.getOauthDeleteTokenUrl();
    var data = 'token=' + Storage.get('accessToken');
    var token = Config.getOAuthClientRegistrationCredentials();
    return httpPOST(url, data, token)
      .then(function() {
        Log.info('oAuth token deleted successfully.');
      }, handleError('Failed to delete the oAuth token'))
      .finally(function() {
        Storage.clear();
        $window.location.href = Config.getLogoutUrl();
      });
  };

  function isLoggedIn () {
    return Storage.get('accessToken');
  };

  function redirectToLogin () {
    $window.location.href = Config.getOauthLoginUrl();
  };

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
    var token = _.get(response, 'data.access_token');
    Log.info('updateAccessToken: ' + token);
    Storage.put('accessToken', token);
    setAuthorizationHeader(token);
    return token;
  }

  function handleError(message) {
    return function(res) {
      Log.error(message, res.data);
    }
  }

  function setAuthorizationHeader(token) {
    $injector.get('$http').defaults.headers.common.Authorization = 'Bearer ' + (token || Storage.get('accessToken'));
  }

  // expose service

  return {
    getAccount: getAccount,
    authorize: authorize,
    getNewAccessToken: getNewAccessToken,
    refreshAccessToken:refreshAccessToken,
    setAccessToken:setAccessToken,
    refreshAccessTokenAndResendRequest:refreshAccessTokenAndResendRequest,
    logout:logout,
    isLoggedIn:isLoggedIn,
    redirectToLogin:redirectToLogin,
    setAuthorizationHeader: setAuthorizationHeader
  };

}
