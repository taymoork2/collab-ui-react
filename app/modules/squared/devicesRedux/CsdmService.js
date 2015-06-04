'use strict';

angular.module('Squared').service('CsdmService',

  /* @ngInject  */
  function ($rootScope, $http, Authinfo, Config) {

    var baseUrl = Config.getCsdmServiceUrl() + '/organization/' + Authinfo.getOrgId();
    var devicesUrl = baseUrl + '/devices';
    var codesUrl = baseUrl + '/codes';

    return {
      listDevices: function (callback) {
        $http.get(devicesUrl)
          .success(function (data) {
            callback(null, data);
          })
          .error(function () {
            callback(arguments);
          });
      },

      listCodes: function (callback) {
        $http.get(codesUrl)
          .success(function (data) {
            callback(null, data);
          })
          .error(function () {
            callback(arguments);
          });
      },

      listCodesAndDevices: function (callback) {
        this.listCodes(function (err, codes) {
          if (err) return callback(err);
          this.listDevices(function (err, devices) {
            if (err) return callback(err);
            callback(null, _.extend(codes, devices));
          });
        }.bind(this));
      },

      getDeviceStatus: function (deviceUrl, callback) {
        $http.get(deviceUrl)
          .success(function (data) {
            callback(null, data);
          })
          .error(function () {
            callback(arguments);
          });
      },

      createCode: function (name, callback) {
        var deviceData = {
          'name': name
        };

        $http.post(codesUrl, deviceData)
          .success(function (data) {
            callback(null, data);
          })
          .error(function () {
            callback(arguments);
          });

      }
    };

  }
);
