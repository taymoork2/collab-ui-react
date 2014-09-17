'use strict';

angular.module('Squared')
  .service('SpacesService', ['$http', 'Storage', 'Config', 'Log', 'Auth',
    function($http, Storage, Config, Log, Auth) {

      return {
        listRooms: function() {
          // var logsUrl = Config.getAdminServiceUrl() + 'logs/' + userId;

          // $http.defaults.headers.common.Authorization = 'Bearer ' + token;
          // $http.get(logsUrl)
          //   .success(function(data, status) {
          //     data.success = true;
          //     Log.debug('Retrieved logs for user: ' + userId);
          //     callback(data, status);
          //   })
          //   .error(function(data, status) {
          //     data.success = false;
          //     data.status = status;
          //     callback(data, status);
          //     Auth.handleStatus(status);
          //   });

          var rooms = [{Room: 'Moroni'},
                     {Room: 'Tiancum'},
                     {Room: 'Jacob'},
                     {Room: 'Nephi'},
                     {Room: 'Enos'}];

          return rooms;
        }
      };
    }
  ]);
