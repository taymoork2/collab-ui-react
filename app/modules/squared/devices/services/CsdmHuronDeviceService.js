(function () {
  'use strict';

  /* @ngInject  */
  function CsdmHuronDeviceService($http, $q, Authinfo, CsdmConfigService, CsdmConverter, CsdmCacheFactory, $window, FeatureToggleService) {
    var devicesUrl = CsdmConfigService.getUrl() + '/organization/' + Authinfo.getOrgId() + '/huronDevices';

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
      }
    });

    function getDeviceList() {
      return deviceCache.list();
    }

    function getDeviceDetails(huronDevice) {
      return $http.get(huronDevice.url + "?status=true").then(function (res) {
        return CsdmConverter.convertHuronDeviceDetailed(res.data, huronDevice);
      });
    }

    function resetDevice(url) {
      return $http.put(url, {
        actions: {
          reset: true
        }
      });
    }

    return {
      on: deviceCache.on,
      getDeviceList: getDeviceList,
      getDeviceDetails: getDeviceDetails,
      resetDevice: resetDevice
    };
  }

  angular
    .module('Squared')
    .service('CsdmHuronDeviceService', CsdmHuronDeviceService);

})();
