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

    return {
      on: deviceCache.on,
      getDeviceList: getDeviceList
    };
  }

  angular
    .module('Squared')
    .service('CsdmHuronDeviceService', CsdmHuronDeviceService);

})();
