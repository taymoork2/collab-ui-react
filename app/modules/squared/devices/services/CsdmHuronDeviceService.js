(function () {
  'use strict';

  /* @ngInject  */
  function CsdmHuronDeviceService($http, $q, Authinfo, HuronConfig, CsdmConverter, CsdmCacheFactory, $window) {
    var devicesUrl = HuronConfig.getCmiV2Url() + '/lists/customers/' + Authinfo.getOrgId() + '/phones/';

    var deviceCache = CsdmCacheFactory.create({
      fetch: function () {
        if ($window.location.search.indexOf("showHuronDevices=true") > -1) {
          return $http.get(devicesUrl).then(function (res) {
            return CsdmConverter.convertHuronDevices(res.data[0].phones);
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

    return {
      on: deviceCache.on,
      getDeviceList: getDeviceList,
      getDeviceDetails: getDeviceDetails
    };
  }

  angular
    .module('Squared')
    .service('CsdmHuronDeviceService', CsdmHuronDeviceService);

})();
