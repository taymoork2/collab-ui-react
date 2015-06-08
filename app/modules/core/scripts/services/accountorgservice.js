'use strict';

angular
  .module('Core')
  .service('AccountOrgService', ['$http', '$rootScope', 'Config',
    function ($http, $rootScope, Config) {
      var accountUrl = Config.getAdminServiceUrl();
      return {
        getAccount: function (org, callback) {
          var url = accountUrl + 'organization/' + org + '/accounts';
          return $http.get(url);
        }
      };
    }
  ]);
