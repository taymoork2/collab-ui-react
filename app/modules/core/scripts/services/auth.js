'use strict';

angular
  .module('Core')
  .factory('Auth', Auth);

/* @ngInject */
function Auth($injector, $translate, $location, $timeout, $window, $q, Log, Config, SessionStorage, Authinfo, Utils, Storage, $rootScope) {
  var auth = {
    oauthUrl: Config.getOauth2Url()
  };

  var authDeferred;

  var loginMarker = false;

  auth.getAccount = function (org) {
    var $http = $injector.get('$http');
    var accountUrl = Config.getAdminServiceUrl();
    var url = accountUrl + 'organization/' + org + '/accounts';
    return $http.get(url);
  };

  auth.authorize = function (token) {
    if (authDeferred) return authDeferred.promise;

    authDeferred = $q.defer();

    var authorizeUrl = Config.getAdminServiceUrl();
    var $http = $injector.get('$http');
    $http.defaults.headers.common.Authorization = 'Bearer ' + token;

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

      return $http.get(authUrl).then(function (authResponse) {

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
            return $http.get(servicesUrl);
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

          return $http.get(msgrServiceUrl).then(function (msgrResponse) {

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

    getAuthData()
      .then(function (authData) {
        Authinfo.initialize(authData);
        if (Authinfo.isAdmin()) {
          auth.getAccount(Authinfo.getOrgId())
            .success(function (data, status) {
              Authinfo.updateAccountInfo(data, status);
              Authinfo.initializeTabs();
            })
            .finally(authDeferred.resolve);
        } else {
          Authinfo.initializeTabs();
          authDeferred.resolve();
        }
      })
      .catch(authDeferred.reject);

    return authDeferred.promise;
  };

  auth.getFromGetParams = function (url) {
    var result = {};
    var cleanUrlA = url.split('#');
    var cleanUrl = cleanUrlA[1];
    for (var i = 2; i < cleanUrlA.length; i++) {
      cleanUrl += '#' + cleanUrlA[i];
    }
    var params = cleanUrl.split('&');
    for (i = 0; i < params.length; i++) {
      var param = params[i];
      result[param.split('=')[0]] = param.split('=')[1];
    }
    return result;
  };

  auth.getFromStandardGetParams = function (url) {
    var result = {};
    var cleanUrlA = url.split('?');
    var cleanUrl = cleanUrlA[1];
    var params = cleanUrl.split('&');
    for (var i = 0; i < params.length; i++) {
      var param = params[i];
      result[param.split('=')[0]] = param.split('=')[1];
    }
    return result;
  };

  auth.getNewAccessToken = function (code) {
    var $http = $injector.get('$http');
    var deferred = $q.defer();
    var token = Config.getOAuthClientRegistrationCredentials();
    var data = Config.getOauthCodeUrl(code) + Config.oauthClientRegistration.scope + '&' + Config.getRedirectUrl();
    $http({
        method: 'POST',
        url: auth.oauthUrl + 'access_token',
        data: data,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + token
        }
      })
      .success(function (data) {
        // This flow happens before the login controller is engaged and
        // login controller would not know that the admin logged in
        // without this marker. If there is a better way to check this
        // information from the login controller in the future, this
        // can be changed.
        loginMarker = true;
        deferred.resolve(data);
      })
      .error(function (data, status) {
        Log.error('Failed to obtain new oauth access_token.  Status: ' + status + ' Error: ' + data.error + ', ' + data.error_description);
        deferred.reject('Token request failed: ' + data.error_description);
      });
    return deferred.promise;
  };

  auth.refreshAccessToken = function (refresh_tok) {
    var $http = $injector.get('$http');
    var data = Config.getOauthAccessCodeUrl(refresh_tok);
    var cred = Config.getOAuthClientRegistrationCredentials();
    return $http({
      method: 'POST',
      url: auth.oauthUrl + 'access_token',
      data: data,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + cred
      }
    });
  };

  auth.setAccessToken = function () {
    var deferred = $q.defer();
    var $http = $injector.get('$http');
    var token = Utils.Base64.encode(Config.getClientId() + ':' + Config.getClientSecret());
    var data = Config.oauthUrl.oauth2ClientUrlPattern + Config.oauthClientRegistration.atlas.scope;
    $http({
        method: 'POST',
        url: auth.oauthUrl + 'access_token',
        data: data,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + token
        }
      })
      .success(function (data) {
        $rootScope.token = data.access_token;
        $http.defaults.headers.common.Authorization = 'Bearer ' + $rootScope.token;
        deferred.resolve(data.access_token);
      })
      .error(function (data, status) {
        Log.error('Failed to obtain oauth access_token.  Status: ' + status + ' Error: ' + data.error + ', ' + data.error_description);
        deferred.reject('Token request failed: ' + data.error_description);
      });
    return deferred.promise;
  };

  auth.refreshAccessTokenAndResendRequest = function (response) {
    var refresh_token = Storage.get('refreshToken');
    return this.refreshAccessToken(refresh_token)
      .then(function (response) {
        var $http = $injector.get('$http');
        Storage.put('accessToken', response.data.access_token);
        $rootScope.token = response.data.access_token;
        $http.defaults.headers.common.Authorization = 'Bearer ' + $rootScope.token;
        response.config.headers.Authorization = 'Bearer ' + $rootScope.token;
        return $http(response.config);
      });
  };

  auth.logout = function () {
    Storage.clear();
    var $http = $injector.get('$http');
    var token = Utils.Base64.encode(Config.getClientId() + ':' + Config.getClientSecret());
    var data = 'token=' + $rootScope.token;

    $http({
        method: 'POST',
        url: Config.getOauthDeleteTokenUrl(),
        data: data,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + token
        }
      })
      .success(function (data, status) {
        Log.info('oAuth token deleted successfully. Status: ' + status);
        $window.location.href = Config.getLogoutUrl();
      })
      .error(function (data, status) {
        Log.error('Failed to delete the oAuth token.  Status: ' + status + ' Error: ' + (data.error || 'unknown'));
        // Call CI logout even if delete oAuth token operation fails. This is consistent with other spark clients.
        $window.location.href = Config.getLogoutUrl();
      });
  };

  auth.isLoggedIn = function () {
    return Storage.get('accessToken');
  };

  auth.isUserAdmin = function () {
    return Authinfo.getRoles().indexOf('Full_Admin') > -1;
  };

  auth.redirectToLogin = function () {
    $window.location.href = Config.getOauthLoginUrl();
  };

  auth.isLoginMarked = function () {
    return loginMarker;
  };

  auth.clearLoginMarker = function () {
    loginMarker = false;
  };

  return auth;
}
