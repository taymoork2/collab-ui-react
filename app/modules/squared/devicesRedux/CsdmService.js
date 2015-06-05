'use strict';

angular.module('Squared').service('CsdmService',

  /* @ngInject  */
  function ($rootScope, $http, Authinfo, Config) {

    var baseUrl = Config.getCsdmServiceUrl() + '/organization/' + Authinfo.getOrgId();
    var devicesUrl = baseUrl + '/devices';
    var codesUrl = baseUrl + '/codes';

    var codesAndDevicesCache = null;

    var listDevices = function (callback) {
        $http.get(devicesUrl)
          .success(function (data) {
            callback(null, data);
          })
          .error(function () {
            callback(arguments);
          });
      }

    var listCodes = function (callback) {
        $http.get(codesUrl)
          .success(function (data) {
            callback(null, data);
          })
          .error(function () {
            callback(arguments);
          });
      }

    var fetchCodesAndDevices = function (callback) {
      console.log("Updating cache");
        listCodes(function (err, codes) {
          if (err) return callback(err);
          listDevices(function (err, devices) {
            if (err) return callback(err);
            callback(null, _.extend(codes, devices));
          });
        }.bind(this));
    }

    var fillCodesAndDevicesCache = function(callback) {
      fetchCodesAndDevices(function (err, data) {
          if(err) return callback(err);
          codesAndDevicesCache = _.map(data, function(v) { return v; });
          callback(null);
        });
    }

    return {
      
      fillCodesAndDevicesCache: function(callback) {
        fillCodesAndDevicesCache(callback);
      },

      listCodesAndDevices: function () {
        return codesAndDevicesCache;
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
            codesAndDevicesCache.push(data);
            callback(null, data);
          })
          .error(function () {
            callback(arguments);
          });
      }
    };

  }
);
