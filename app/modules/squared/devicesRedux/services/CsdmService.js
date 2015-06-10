'use strict';

angular.module('Squared').service('CsdmService',

  /* @ngInject  */
  function ($window, $rootScope, $http, Authinfo, Config, CsdmConfigService) {

    var codesUrl = CsdmConfigService.getUrl() + '/organization/' + Authinfo.getOrgId() + '/codes';
    var devicesUrl = CsdmConfigService.getUrl() + '/organization/' + Authinfo.getOrgId() + '/devices';

    var codesAndDevicesCache = {};

    var listDevices = function (callback) {
      $http.get(devicesUrl)
        .success(function (data) {
          callback(null, data);
        })
        .error(function () {
          callback(arguments);
        });
    };

    var listCodes = function (callback) {
      $http.get(codesUrl)
        .success(function (data) {
          callback(null, data);
        })
        .error(function () {
          callback(arguments);
        });
    };

    var fetchCodesAndDevices = function (callback) {
      listCodes(function (err, codes) {
        if (err) return callback(err);
        listDevices(function (err, devices) {
          if (err) return callback(err);
          callback(null, _.extend(codes, devices));
        });
      }.bind(this));
    };

    var fillCodesAndDevicesCache = function (callback) {
      fetchCodesAndDevices(function (err, data) {
        if (err) return callback(err, data);
        codesAndDevicesCache = data;
        callback();
      });
    };

    return {

      fillCodesAndDevicesCache: function (callback) {
        fillCodesAndDevicesCache(callback);
      },

      listCodesAndDevices: function () {
        return _.values(codesAndDevicesCache);
      },

      getDeviceStatus: function (deviceUrl, callback) {
        callback(null, codesAndDevicesCache[deviceUrl]);
      },

      deleteUrl: function (url, callback) {
        $http.delete(url)
          .success(function (status) {
            delete codesAndDevicesCache[url];
            callback(null, status);
          })
          .error(function () {
            callback(arguments);
          });
      },

      createCode: function (name, callback) {
        var deviceData = {
          name: name
        };

        $http.post(codesUrl, deviceData)
          .success(function (data) {
            codesAndDevicesCache[data.url] = data;
            callback(null, data);
          })
          .error(function () {
            callback(arguments);
          });
      }
    };

  }
);
