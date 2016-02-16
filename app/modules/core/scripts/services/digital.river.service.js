(function () {
  'use strict';

  angular
    .module('Core')
    .service('DigitalRiverService', DigitalRiverService);

  /* @ngInject */
  function DigitalRiverService($http, Config, Auth) {

    var service = {
      getUserFromEmail: getUserFromEmail,
      addDrUser: addDrUser,
      getDrReferrer: getDrReferrer,
      getUserAuthToken: getUserAuthToken
    };

    return service;

    function getUserAuthToken(userid) {
      return Auth.setAccessToken().then(function () {
        return $http.get(Config.getAdminServiceUrl() + "ordertranslator/digitalriver/authtoken/" + userid);
      });
    }

    function getUserFromEmail(email) {
      return Auth.setAccessToken().then(function () {
        return $http.get(Config.getAdminServiceUrl() + 'ordertranslator/digitalriver/user/' + email + '/exists');
      });
    }

    function addDrUser(emailPassword) {
      return Auth.setAccessToken().then(function () {
        return $http.post(Config.getAdminServiceUrl() + 'ordertranslator/digitalriver/user', emailPassword);
      });
    }

    // TODO: Remove this after the go-live.
    function getDrReferrer() {
      return 'digitalriver-ZGlnaXRhbHJpdmVy';
    }

  }
})();
