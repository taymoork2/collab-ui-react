(function () {
  'use strict';

  angular
    .module('DigitalRiver')
    .service('DigitalRiverService', DigitalRiverService);

  /* @ngInject */
  function DigitalRiverService($http, $window, $translate, Config, Auth, $q, UrlConfig, Storage, EmailService) {

    var service = {
      getUserFromEmail: getUserFromEmail,
      addDrUser: addDrUser,
      getDrReferrer: getDrReferrer,
      getUserAuthToken: getUserAuthToken,
      activateUser: activateUser,
      activateProduct: activateProduct,
      getUserAuthInfo: getUserAuthInfo,
      submitOrderOnline: submitOrderOnline,
      sendDRWelcomeEmail: sendDRWelcomeEmail,
      decrytpUserAuthToken: decrytpUserAuthToken,
      userExists: userExists
    };

    return service;

    function getUserFromEmail(email) {
      return Auth.setAccessToken().then(function () {
        return $http.get(UrlConfig.getAdminServiceUrl() + 'ordertranslator/online/user/' + email + '/exists');
      });
    }

    function addDrUser(emailPassword) {
      return Auth.setAccessToken().then(function () {
        return $http.post(UrlConfig.getAdminServiceUrl() + 'ordertranslator/digitalriver/user', emailPassword);
      });
    }

    function getUserAuthToken(userid) {
      return Auth.setAccessToken().then(function () {
        return $http.get(UrlConfig.getAdminServiceUrl() + "ordertranslator/digitalriver/authtoken/" + userid);
      });
    }

    function decrytpUserAuthToken(token) {
      return Auth.setAccessToken().then(function () {
        return $http.post(UrlConfig.getAdminServiceUrl() + "ordertranslator/api/digitalriver/token/validate", token);
      });
    }

    function activateUser(uuid) {
      if (!uuid) {
        return $q.reject('blank uuid');
      }
      return Auth.setAccessToken().then(function () {
        return $http.patch(UrlConfig.getAdminServiceUrl() + 'ordertranslator/online/accountstatus/' + uuid + '?accountStatus=active');
      });
    }

    function activateProduct(oid) {
      if (!oid) {
        return $q.reject('blank oid');
      }
      return Auth.setAccessToken().then(function () {
        return $http.post(UrlConfig.getAdminServiceUrl() + 'ordertranslator/api/digitalriver/activate/' + oid);
      });
    }

    function getDrReferrer() {
      return 'digitalriver-ZGlnaXRhbHJpdmVy';
    }

    function getUserAuthInfo() {
      return $http.get(Auth.getAuthorizationUrl());
    }

    // submitOrder call to the Commerce API.
    function submitOrderOnline(request) {
      return Auth.setAccessToken().then(function () {
        return $http.post(UrlConfig.getAdminServiceUrl() + 'online/commerce/orders', request);
      });
    }

    function sendDRWelcomeEmail(customerEmail, uuid, orderId) {
      var token = Storage.get('userToken');
      Auth.setAuthorizationHeader(token);
      return EmailService.emailDRWelcomeRequest(customerEmail, uuid, orderId);
    }

    function userExists(email) {
      var result = {};
      result.domainClaimed = false;
      result.userExists = false;
      result.error = null;

      return getUserFromEmail(email)
        .then(function (response) {
          if (response.status === 200) {
            if (response.data.data.checkEmail.domainClaimed === true) {
              result.domainClaimed = true;
            } else if (angular.isDefined(response.data.data.checkEmail.identityUser)) {
              result.userExists = true;
            }
          } else {
            result.error = _.get(result, 'data.message', $translate.instant('digitalRiver.validation.unexpectedError'));
          }
          return result;
        })
        .catch(function (error) {
          result.error = _.get(result, 'data.message', $translate.instant('digitalRiver.validation.unexpectedError'));
          return result;
        });
    }

  }
})();
