'use strict';

angular.module('Squared')
  .service('csadminservice', ['$rootScope', '$http', 'Storage', 'Config', 'Log', 'Auth', 'Authinfo',
    function ($rootScope, $http, Storage, Config, Log, Auth, Authinfo) {

      var csadminUrl = Config.getAdminServiceUrl() + 'organization/' + Authinfo.getOrgId() + '/users/csadmin';

      return {
        setCsAdmin: function (encryptedParam, callback) {
          var csadminData = {
            'encryptedQueryString': encryptedParam
          };
          $http.defaults.headers.common.Authorization = 'Bearer ' + $rootScope.token;
          $http.post(csadminUrl, csadminData)
            .success(function (data, status) {
              data.success = true;
              callback(data, status);
            })
            .error(function (data, status) {
              data.success = false;
              data.status = status;
              callback(data, status);
              Auth.handleStatus(status);
            });
        }
      };
    }
  ]);
