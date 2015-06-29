'use strict';

angular.module('Squared').service('CsdmService',

  /* @ngInject  */
  function ($window, $rootScope, $http, Authinfo, Config, CsdmConfigService, CsdmCacheUpdater, CsdmConverter) {

    var codesUrl = CsdmConfigService.getUrl() + '/organization/' + Authinfo.getOrgId() + '/codes';
    var devicesUrl = CsdmConfigService.getUrl() + '/organization/' + Authinfo.getOrgId() + '/devices';

    var codeCache = {};
    var deviceCache = {};

    function fetchDeviceList() {
      return $http.get(devicesUrl).success(function (devices) {
        var converted = CsdmConverter.convert(devices);
        CsdmCacheUpdater.update(deviceCache, converted);
      });
    }

    function fetchCodeList() {
      return $http.get(codesUrl).success(function (codes) {
        var converted = CsdmConverter.convert(codes);
        CsdmCacheUpdater.update(codeCache, converted);
      });
    }

    function getDeviceList() {
      return deviceCache;
    }

    function getCodeList() {
      return codeCache;
    }

    var updateDeviceName = function (deviceUrl, newName) {
      return $http.patch(deviceUrl, {
          name: newName
        })
        .success(function (status) {
          var device = codeCache[deviceUrl] || deviceCache[deviceUrl];
          device.displayName = newName;
          if (device.status && device.status.webSocketUrl) {
            return notifyDevice(deviceUrl, {
              command: "identityDataChanged",
              eventType: "room.identityDataChanged"
            });
          }
        });
    };

    var notifyDevice = function (deviceUrl, message, callback) {
      return $http.post(deviceUrl + '/notify', message);
    };

    var uploadLogs = function (deviceUrl, feedbackId, email) {
      return notifyDevice(deviceUrl, {
        command: "logUpload",
        eventType: "room.request_logs",
        feedbackId: feedbackId,
        email: email
      });
    };

    // todo: promisify
    var deleteUrl = function (url, callback) {
      $http.delete(url)
        .success(function (status) {
          delete codeCache[url];
          delete deviceCache[url];
          callback(null, status);
        })
        .error(function () {
          callback(arguments);
        });
    };

    // todo: promisify
    var createCode = function (name, callback) {
      $http.post(codesUrl, {
          name: name
        })
        .success(function (data) {
          codeCache[data.url] = data;
          callback(null, data);
        })
        .error(function () {
          callback(arguments);
        });
    };

    return {
      getCodeList: getCodeList,
      getDeviceList: getDeviceList,

      fetchCodeList: fetchCodeList,
      fetchDeviceList: fetchDeviceList,

      uploadLogs: uploadLogs,
      updateDeviceName: updateDeviceName,

      deleteUrl: deleteUrl,
      createCode: createCode
    };
  }
);
