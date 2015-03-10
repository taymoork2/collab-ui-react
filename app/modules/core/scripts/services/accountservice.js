'use strict';

angular.module('Core')
  .service('AccountService', ['$http', '$rootScope', '$location', 'Storage', 'Config', 'Log',
    function ($http, $rootScope, $location, Storage, Config, Log) {

      var accountUrl = Config.getAdminServiceUrl();

      return {

        getAccount: function (org, callback) {
          var url = accountUrl + 'organization/' + org + '/accounts';
          $http.defaults.headers.common.Authorization = 'Bearer ' + $rootScope.token;
          return $http.get(url);
        }

      };
    }
  ]);
