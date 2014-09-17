'use strict';

angular.module('Squared')
  .service('SpacesService', ['$http', 'Storage', 'Config', 'Log', 'Auth',
    function($http, Storage, Config, Log, Auth) {

      var roomUrl = Config.getAdminServiceUrl();
      var token = Storage.get('accessToken');

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
        },

        addRoom: function(newRoomName, callback){
          var roomData = {
            'name': newRoomName
          };

          if (roomData.name.length > 0) {
            $http.defaults.headers.common.Authorization = 'Bearer ' + token;
            $http.post(roomUrl + 'rooms', roomData)
              .success(function(data, status) {
                data.success = true;
                callback(data, status);
              })
              .error(function(data, status) {
                data.success = false;
                data.status = status;
                callback(data, status);
                Auth.handleStatus(status);
              });
          } else {
            callback('No valid rooms entered.');
          }

        }
      };
    }
  ]);
