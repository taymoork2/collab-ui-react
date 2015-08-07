'use strict';

angular.module('Squared')
  .service('Activateservice', ActivateService);

function ActivateService($http, Config, Auth) {
  var userUrl = Config.getAdminServiceUrl();

  return {
    activateUser: function (encryptedParam) {
      return Auth.setAccessToken().then(function () {
        return $http.post(userUrl + 'users/email/activate', {
          'encryptedQueryString': encryptedParam
        });
      });
    },

    resendCode: function (eqp) {
      return Auth.setAccessToken().then(function () {
        return $http.post(userUrl + 'users/email/reverify', {
          'encryptedQueryString': eqp
        });
      });
    }
  };
}
