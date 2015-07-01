(function () {
  'use strict';

  /* @ngInject  */
  function CsdmDeviceService($http, Authinfo, CsdmConfigService, CsdmCacheUpdater, CsdmConverter) {
    var deviceCache = {};
    var devicesUrl = CsdmConfigService.getUrl() + '/organization/' + Authinfo.getOrgId() + '/devices';

    function fetchDeviceList() {
      return $http.get(devicesUrl).success(function (devices) {
        var converted = CsdmConverter.convert(devices);
        CsdmCacheUpdater.update(deviceCache, converted);
      });
    }

    function getDeviceList() {
      return deviceCache;
    }

    function updateDeviceName(deviceUrl, newName) {
      return $http.patch(deviceUrl, {
          name: newName
        })
        .success(function (status) {
          var device = deviceCache[deviceUrl];
          device.displayName = newName;
          if (device.status && device.status.webSocketUrl) {
            return notifyDevice(deviceUrl, {
              command: "identityDataChanged",
              eventType: "room.identityDataChanged"
            });
          }
        });
    }

    function deleteDevice(url) {
      return $http.delete(url)
        .success(function (status) {
          delete deviceCache[url];
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

    return {
      fetchDeviceList: fetchDeviceList,
      getDeviceList: getDeviceList,
      uploadLogs: uploadLogs,
      deleteDevice: deleteDevice,
      updateDeviceName: updateDeviceName
    };
  }

  /* @ngInject  */
  function CsdmCodeService($http, Authinfo, CsdmConfigService, CsdmCacheUpdater, CsdmConverter) {
    var codeCache = {};
    var codesUrl = CsdmConfigService.getUrl() + '/organization/' + Authinfo.getOrgId() + '/codes';

    function fetchCodeList() {
      return $http.get(codesUrl).success(function (codes) {
        var converted = CsdmConverter.convert(codes);
        CsdmCacheUpdater.update(codeCache, converted);
      });
    }

    function getCodeList() {
      return codeCache;
    }

    function updateCodeName(deviceUrl, newName) {
      return $http.patch(deviceUrl, {
          name: newName
        })
        .success(function (status) {
          var device = codeCache[deviceUrl];
          device.displayName = newName;
        });
    }

    function deleteCode(url) {
      return $http.delete(url)
        .success(function (status) {
          delete codeCache[url];
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
      deleteCode: deleteCode,
      createCode: createCode,
      updateCodeName: updateCodeName
    };
  }

  /* @ngInject */
  function CodeListService(CsdmPoller, CsdmCodeService) {
    return CsdmPoller.create(CsdmCodeService.fetchCodeList);
  }

  /* @ngInject */
  function DeviceListService(CsdmPoller, CsdmDeviceService) {
    return CsdmPoller.create(CsdmDeviceService.fetchDeviceList);
  }

  angular.module('Squared')
    .service('CsdmCodeService', CsdmCodeService)
    .service('CsdmDeviceService', CsdmDeviceService)
    .service('CodeListService', CodeListService)
    .service('DeviceListService', DeviceListService);

})();
