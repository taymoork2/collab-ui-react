(function () {
  'use strict';

  /* @ngInject  */
  function CsdmHuronDeviceService($http, $q, Authinfo, CsdmConfigService, HuronConfig, CsdmConverter, CsdmCacheFactory, $window, FeatureToggleService) {
    var devicesUrl = CsdmConfigService.getUrl() + '/organization/' + Authinfo.getOrgId() + '/huronDevices';
    var devicesFastUrl = devicesUrl + "?checkDisplayName=false";

    function getCmiUploadLogsUrl(userId, deviceId) {
      return HuronConfig.getCmiV2Url() + '/customers/' + Authinfo.getOrgId() + '/users/' + userId + '/phones/' + deviceId + '/commands/logs';
    }

    var initialDataPromise = huronEnabled().then(function (enabled) {
      return !enabled ? $q.when([]) : $http.get(devicesFastUrl).then(function (res) {
        return CsdmConverter.convertHuronDevices(res.data);
      });
    });

    function huronEnabled() {
      if ($window.location.search.indexOf("showHuronDevices=true") > -1) {
        return $q.when(true);
      } else {
        return FeatureToggleService.supports(FeatureToggleService.features.csdmHuron);
      }
    }

    var deviceCache = CsdmCacheFactory.create({
      fetch: function () {
        return huronEnabled().then(function (enabled) {
          return !enabled ? $q.when([]) : $http.get(devicesUrl).then(function (res) {
            return CsdmConverter.convertHuronDevices(res.data);
          });
        });
      },
      initializeData: initialDataPromise
    });

    function getDeviceList() {
      return deviceCache.list();
    }

    function resetDevice(url) {
      return $http.put(url, {
        actions: {
          reset: true
        }
      });
    }

    function uploadLogs(device, feedbackId) {
      return $http.post(getCmiUploadLogsUrl(device.cisUuid, device.huronId), {
        ticketId: feedbackId
      });
    }

    return {
      on: deviceCache.on,
      getDeviceList: getDeviceList,
      resetDevice: resetDevice,
      uploadLogs: uploadLogs
    };
  }

  angular
    .module('Squared')
    .service('CsdmHuronDeviceService', CsdmHuronDeviceService);

})();
