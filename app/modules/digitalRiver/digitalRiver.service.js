(function () {
  'use strict';

  angular
    .module('DigitalRiver')
    .service('DigitalRiverService', DigitalRiverService);

  /* @ngInject */
  function DigitalRiverService($http, Config, Auth, $q, UrlConfig) {

    var service = {
      getUserFromEmail: getUserFromEmail,
      addDrUser: addDrUser,
      getDrReferrer: getDrReferrer,
      getUserAuthToken: getUserAuthToken,
      activateUser: activateUser,
      activateProduct: activateProduct
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

    // TODO: Remove this after the go-live.
    function getDrReferrer() {
      return 'digitalriver-ZGlnaXRhbHJpdmVy';
    }

  }
})();
