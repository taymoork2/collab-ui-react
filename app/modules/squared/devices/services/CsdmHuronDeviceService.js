(function () {
  'use strict';

  /* @ngInject  */
  function CsdmHuronDeviceService($http, $q, Authinfo, CsdmConfigService, CsdmConverter, CsdmCacheFactory, $window) {
    var devicesUrl = CsdmConfigService.getUrl() + '/organization/' + Authinfo.getOrgId() + '/huronDevices';

    var deviceCache = CsdmCacheFactory.create({
      fetch: function () {
        if ($window.location.search.indexOf("showHuronDevices=true") > -1) {
          return $http.get(devicesUrl).then(function (res) {
            return CsdmConverter.convertHuronDevices(res.data);
          });
        }
        return $q(function (resolve) {
          resolve([]);
        });
      }
    });

    function getDeviceList() {
      return deviceCache.list();
    }

    function getDeviceDetails(huronDevice) {
      $http.get(huronDevice.url + "?status=true").then(function (res) {
        return CsdmConverter.convertHuronDeviceDetailed(res, huronDevice);
      })
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
