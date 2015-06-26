'use strict';

angular.module('Squared').service('CsdmService',

  /* @ngInject  */
  function ($window, $rootScope, $http, Authinfo, Config, CsdmConfigService, CsdmCacheUpdater) {

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

    var fillCodesAndDevicesCache = function (callback) {
      listCodes(function (err, codes) {
        if (err) return callback(err);
        CsdmCacheUpdater.addAndUpdate(codesAndDevicesCache, codes);
        listDevices(function (err, devices) {
          if (err) return callback(err);
          CsdmCacheUpdater.addUpdateAndRemove(codesAndDevicesCache, _.extend(codes, devices));
          callback(null, listCodesAndDevices());
        });
      });
    };

    var updateDeviceName = function (deviceUrl, newName, callback) {
      $http.patch(deviceUrl, {
          name: newName
        })
        .success(function (status) {
          codesAndDevicesCache[deviceUrl].displayName = newName;
          var device = codesAndDevicesCache[deviceUrl];
          if (device.status && device.status.webSocketUrl) {
            notifyDevice(deviceUrl, {
              command: "identityDataChanged",
              eventType: "room.identityDataChanged"
            }, callback);
          }
        })
        .error(function () {
          callback(arguments);
        });
    };

    var notifyDevice = function (deviceUrl, message, callback) {
      $http.post(deviceUrl + '/notify', message)
        .success(function (status) {
          callback(null, status);
        })
        .error(function () {
          callback(arguments);
        });
    };

    var uploadLogs = function (deviceUrl, feedbackId, email, callback) {
      notifyDevice(deviceUrl, {
        command: "logUpload",
        eventType: "room.request_logs",
        feedbackId: feedbackId,
        email: email
      }, callback);
    };

    var listCodesAndDevices = function () {
      return _.values(codesAndDevicesCache);
    };

    return {
      uploadLogs: uploadLogs,
      updateDeviceName: updateDeviceName,
      listCodesAndDevices: listCodesAndDevices,
      fillCodesAndDevicesCache: fillCodesAndDevicesCache,

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
        $http.post(codesUrl, {
            name: name
          })
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
