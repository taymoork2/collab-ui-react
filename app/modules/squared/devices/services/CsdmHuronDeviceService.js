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

    return {
      on: deviceCache.on,
      getDeviceList: getDeviceList
    };
  }

  angular
    .module('Squared')
    .service('CsdmHuronDeviceService', CsdmHuronDeviceService);

})();
