(function () {
  'use strict';

  /* @ngInject  */
  function CsdmDeviceService($http, $log, Authinfo, CsdmConfigService, CsdmCacheUpdater, CsdmConverter) {
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
        .success(function (updatedDevice) {
          deviceCache[deviceUrl].update(updatedDevice);
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
      var req = {
        method: 'GET',
        url: CsdmConfigService.getEnrollmentServiceUrl() + '/enrollment/entries/?organizationId=' + Authinfo.getOrgId(),
        headers: {
          'Cisco-Experimental': true
        }
      };
      return $http(req).then(function (res) {
        var codes = res.data;
        var filtered = _.filter(codes, function (c) {
          return c.status != 'CLAIMED';
        });
        var converted = CsdmConverter.convertCodes(filtered);
        var indexed = _.indexBy(converted, 'url');
        CsdmCacheUpdater.update(codeCache, indexed);
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

    function deleteCode(code) {
      deleteFromCsdm(codesUrl + '/' + code.activationCode);
      return deleteFromEnrollment(code.url).then(function () {
        delete codeCache[code.url];
      });
    }

    function deleteFromCsdm(url) {
      return $http.delete(url);
    }

    function deleteFromEnrollment(url) {
      var req = {
        method: 'DELETE',
        url: url,
        headers: {
          'Cisco-Experimental': true
        }
      };
      return $http(req);
    }

    function createCode(name) {
      return $http.post(codesUrl, {
        name: name
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
