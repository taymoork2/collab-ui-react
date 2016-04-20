(function () {
  'use strict';

  angular
    .module('DigitalRiver')
    .service('DigitalRiverService', DigitalRiverService);

  /* @ngInject */
  function DigitalRiverService($http, $window, Config, Auth, $q, UrlConfig, Storage, EmailService) {

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
      decrytpUserAuthToken: decrytpUserAuthToken
    };

    return service;

    function getUserFromEmail(email) {
      return Auth.setAccessToken().then(function () {
        return $http.get(UrlConfig.getAdminServiceUrl() + 'ordertranslator/digitalriver/user/' + email + '/exists');
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
  }
})();
