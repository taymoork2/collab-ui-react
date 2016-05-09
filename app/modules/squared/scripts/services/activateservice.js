(function () {
  'use strict';

  angular.module('Squared')
    .service('Activateservice', ActivateService);

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
