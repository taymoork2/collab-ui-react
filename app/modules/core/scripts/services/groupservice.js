'use strict';

angular.module('Core')
  .service('GroupService', ['$http', '$rootScope', '$location', 'Storage', 'Config', 'Log', 'Authinfo', 'Auth',
    function ($http, $rootScope, $location, Storage, Config, Log, Authinfo, Auth) {

      var groupssUrl = Config.getAdminServiceUrl() + 'organization/' + Authinfo.getOrgId() + '/groups';

      return {

        getGroupList: function (callback) {

          $http.defaults.headers.common.Authorization = 'Bearer ' + $rootScope.token;
          $http.get(groupssUrl)
            .success(function (data, status) {
              data.success = true;
              Log.debug('Retrieved group list');
              callback(data, status);
            })
            .error(function (data, status) {
              data.success = false;
              callback(data, status);
              Auth.handleStatus(status);
            });
        }

      };
    }
  ]);
