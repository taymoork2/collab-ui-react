(function () {
  'use strict';

  /* @ngInject  */
  function CsdmService($http, Authinfo, CsdmConfigService, CsdmCacheUpdater, CsdmConverter) {

    var codeCache = {};
    var deviceCache = {};
    var codesUrl = CsdmConfigService.getUrl() + '/organization/' + Authinfo.getOrgId() + '/codes';
    var devicesUrl = CsdmConfigService.getUrl() + '/organization/' + Authinfo.getOrgId() + '/devices';

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

    function updateDeviceName(deviceUrl, newName) {
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
    }

    function notifyDevice(deviceUrl, message, callback) {
      return $http.post(deviceUrl + '/notify', message);
    }

    function uploadLogs(deviceUrl, feedbackId, email) {
      return notifyDevice(deviceUrl, {
        command: "logUpload",
        eventType: "room.request_logs",
        feedbackId: feedbackId,
        email: email
      });
    }

    function deleteUrl(url) {
      return $http.delete(url)
        .success(function (status) {
          delete codeCache[url];
          delete deviceCache[url];
        });
    }

    function createCode(name) {
      return $http.post(codesUrl, {
          name: name
        })
        .success(function (data) {
          codeCache[data.url] = data;
        });
    }

    return {
      getCodeList: getCodeList,
      fetchCodeList: fetchCodeList,
      getDeviceList: getDeviceList,
      fetchDeviceList: fetchDeviceList,
      deleteUrl: deleteUrl,
      createCode: createCode,
      uploadLogs: uploadLogs,
      updateDeviceName: updateDeviceName
    };
  }

  /* @ngInject */
  function CodeListService(CsdmPoller, CsdmService) {
    return CsdmPoller.create(CsdmService.fetchCodeList);
  }

  /* @ngInject */
  function DeviceListService(CsdmPoller, CsdmService) {
    return CsdmPoller.create(CsdmService.fetchDeviceList);
  }

  angular.module('Squared')
    .service('CsdmService', CsdmService)
    .service('CodeListService', CodeListService)
    .service('DeviceListService', DeviceListService);

})();
