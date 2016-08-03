(function () {
  'use strict';

  module.exports = angular.module('squared.activateservice', [
      require('modules/core/auth/auth'),
      require('modules/core/config/urlConfig'),
    ])
    .service('ActivateService', ActivateService)
    .name;

  /* @ngInject */
  function ActivateService($http, UrlConfig, Auth) {
    var userUrl = UrlConfig.getAdminServiceUrl();

    var service = {
      userUrl: userUrl,
      activateUser: activateUser,
      resendCode: resendCode
    };

    return service;

    function activateUser(encryptedParam) {
      return Auth.setAccessToken().then(function () {
        return $http.post(userUrl + 'users/email/activate', {
          'encryptedQueryString': encryptedParam
        });
      });
    }

    function resendCode(eqp) {
      return Auth.setAccessToken().then(function () {
        return $http.post(userUrl + 'users/email/reverify', {
          'encryptedQueryString': eqp
        });
      });
    }
  }
})();
