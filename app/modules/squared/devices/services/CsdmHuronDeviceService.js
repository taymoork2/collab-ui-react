(function () {
  'use strict';

  /* @ngInject  */
  function CsdmHuronDeviceService($http, $q, Authinfo, CsdmConfigService, CsdmConverter, CsdmCacheFactory, $window, FeatureToggleService) {
    var devicesUrl = CsdmConfigService.getUrl() + '/organization/' + Authinfo.getOrgId() + '/huronDevices';

    function huronEnabled() {
      return FeatureToggleService.getFeaturesForUser(Authinfo.getUserId()).then(function (features) {
        var feature = _.find(features.user, {
          key: "csdm-huron"
        });
        if (angular.isUndefined(feature)) {
          return false;
        }
        return feature.val;
      });
    }

    var deviceCache = CsdmCacheFactory.create({
      fetch: function () {
        return huronEnabled().then(function (enabled) {
          if (enabled) {
            return $http.get(devicesUrl).then(function (res) {
              return CsdmConverter.convertHuronDevices(res.data);
            });
          } else {
            return $q(function (resolve) {
              resolve([]);
            });
          }
        }).catch(function (err) {
          return $q(function (resolve) {
            resolve([]);
          });
        });
      }
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

    return {
      on: deviceCache.on,
      getDeviceList: getDeviceList,
      resetDevice: resetDevice
    };
  }

  angular
    .module('Squared')
    .service('CsdmHuronDeviceService', CsdmHuronDeviceService);

})();
