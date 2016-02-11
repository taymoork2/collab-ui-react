(function () {
  'use strict';

  /* @ngInject  */
  function CsdmHuronDeviceService($http, $q, Authinfo, CsdmConfigService, HuronConfig, CsdmConverter, CsdmCacheFactory, $window, FeatureToggleService) {
    var devicesUrl = CsdmConfigService.getUrl() + '/organization/' + Authinfo.getOrgId() + '/huronDevices';
    var devicesFastUrl = devicesUrl + "?checkDisplayName=false";

    function directoryNumbersUrl(userId) {
      return HuronConfig.getCmiUrl() + '/voice/customers/' + Authinfo.getOrgId() + '/users/' + userId + '/directorynumbers';
    }

    function alternateNumbersUrl(directoryNumberId) {
      return HuronConfig.getCmiUrl() + '/voice/customers/' + Authinfo.getOrgId() + '/directorynumbers/' + directoryNumberId + '/alternatenumbers?alternatenumbertype=%2BE.164+Number';
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

    function getLinesForDevice(huronDevice) {
      return $http.get(directoryNumbersUrl(huronDevice.cisUuid))
        .then(function (res) {
          var lines = [];
          return $q.all(_.map(res.data, function (directoryNumber) {
            var line = {
              'directoryNumber': directoryNumber.directoryNumber.pattern,
              'usage': directoryNumber.dnUsage
            };
            return $http.get(alternateNumbersUrl(directoryNumber.directoryNumber.uuid)).then(function (alternates) {
              if (alternates.data && alternates.data[0]) {
                line.alternate = alternates.data[0].numMask;
              }
              lines.push(line);
            });
          })).then(function () {
            return lines;
          });
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
      getLinesForDevice: getLinesForDevice,
      resetDevice: resetDevice
    };
  }

  angular
    .module('Squared')
    .service('CsdmHuronDeviceService', CsdmHuronDeviceService);

})();
