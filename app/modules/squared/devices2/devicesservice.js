'use strict';

angular.module('Squared')
  .service('DevicesService', ['$rootScope', '$http', 'Storage', 'Config', 'Log', 'Auth', 'Authinfo',
    function ($rootScope, $http, Storage, Config, Log, Auth, Authinfo) {

      var baseUrl = Config.getCsdmServiceUrl() + '/organization/' + Authinfo.getOrgId();
      var deviceUrl = baseUrl + '/devices';
      var codeUrl = baseUrl + '/codes';

      return {

        listCodes: function (callback) {
          $http.get(codeUrl)
            .success(function (data, status) {
              callback(data, status, true);
            })
            .error(function (data, status) {
              callback(data, status, false);
            });
        },

        listDevices: function (callback) {
          $http.get(deviceUrl)
            .success(function (data, status) {
              callback(data, status, true);
            })
            .error(function (data, status) {
              callback(data, status, false);
            });
        },

        createCode: function (newDeviceName, callback) {
          var deviceData = {
            'name': newDeviceName
          };

          if (deviceData.name.length > 0) {
            $http.post(codeUrl, deviceData)
              .success(function (data, status) {
                data = data || {};
                data.success = true;
                callback(data, status);
              })
              .error(function (data, status) {
                data = data || {};
                data.success = false;
                data.status = status;
                callback(data, status);
              });
          } else {
            callback('No valid device name entered.');
          }

        },

        deleteUrl: function (url, callback) {
          if ((url !== null) && (url.length > 0)) {
            $http.delete(url)
              .success(function (status) {
                callback(true, status);
              })
              .error(function (status) {
                callback(false, status);
              });
          } else {
            callback('No valid device available to delete.');
          }
        },

        getStatus: function (url, callback) {
          if ((url !== null) && (url.length > 0)) {
            var getStatusUrl = url + '/status';
            $http.get(getStatusUrl)
              .success(function (data, status) {
                data = data || {};
                data.success = true;
                callback(data, url, status);
              })
              .error(function (data, status) {
                data = data || {};
                data.success = false;
                data.status = status;
                callback(data, url, status);
                Auth.handleStatus(status);
              });
          } else {
            callback('No valid device available.');
          }
        },

        getEntity: function (url, callback) {
          if ((url !== null) && (url.length > 0)) {
            $http.get(url)
              .success(function (data, status) {
                callback(data, url, status, true);
              })
              .error(function (data, status) {
                callback(data, url, status, false);
                Auth.handleStatus(status);
              });
          } else {
            callback('No valid url available.');
          }
        }
      };
    }
  ]);
