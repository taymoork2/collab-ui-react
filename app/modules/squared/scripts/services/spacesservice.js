'use strict';

angular.module('Squared')
  .service('SpacesService', ['$http', 'Storage', 'Config', 'Log', 'Auth', 'Authinfo',
    function ($http, Storage, Config, Log, Auth, Authinfo) {

      var roomUrl = Config.getAdminServiceUrl() + 'organization/' + Authinfo.getOrgId() + '/devices';
      var token = Storage.get('accessToken');

      return {
        listRooms: function (callback) {
          $http.defaults.headers.common.Authorization = 'Bearer ' + token;
          $http.get(roomUrl)
            .success(function (data, status) {
              data.success = true;
              Log.debug('Retrieved list of rooms for org: ' + token);
              callback(data, status);
            })
            .error(function (data, status) {
              data.success = false;
              data.status = status;
              callback(data, status);
              Auth.handleStatus(status);
            });
        },

        addRoom: function (newRoomName, callback) {
          var roomData = {
            'name': newRoomName
          };

          if (roomData.name.length > 0) {
            $http.defaults.headers.common.Authorization = 'Bearer ' + token;
            $http.post(roomUrl, roomData)
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
          } else {
            callback('No valid rooms entered.');
          }

        }
      };
    }
  ]);
