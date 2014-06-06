'use strict';

angular.module('wx2AdminWebClientApp')
  .service('Orgservice', ['$http', '$rootScope', '$location', 'Storage', 'Config', 'Authinfo', 'Log', 'Utils',
    function($http, $rootScope, $location, Storage, Config, Authinfo, Log, Utils) {

      var token = Storage.get('accessToken');

      return {

        getOrg: function(callback) {
          var scomUrl = Config.scomUrl + '/' + Authinfo.getOrgId();
          $http.defaults.headers.common.Authorization = 'Bearer ' + token;
          $http.get(scomUrl)
            .success(function(data, status) {
              data.success = true;
              callback(data, status);
            })
            .error(function(data, status) {
              data.success = false;
              data.status = status;
              callback(data, status);
            });
        }

      };
    }
  ]);
