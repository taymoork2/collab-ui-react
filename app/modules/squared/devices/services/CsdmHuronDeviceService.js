(function () {
  'use strict';

  /* @ngInject  */
  function CsdmHuronDeviceService($http, $q, Authinfo, CsdmConfigService, HuronConfig, CsdmConverter, CsdmCacheFactory, $window, FeatureToggleService) {
    var devicesUrl = CsdmConfigService.getUrl() + '/organization/' + Authinfo.getOrgId() + '/huronDevices';
    var devicesFastUrl = devicesUrl + "?checkDisplayName=false";

    function getCmiUploadLogsUrl(userId, deviceId) {
      return HuronConfig.getCmiV2Url() + '/customers/' + Authinfo.getOrgId() + '/users/' + userId + '/phones/' + deviceId + '/commands/logs';
    }

    function getDirectoryNumbersUrl(userId) {
      return HuronConfig.getCmiUrl() + '/voice/customers/' + Authinfo.getOrgId() + '/users/' + userId + '/directorynumbers';
    }

    function getAlternateNumbersUrl(directoryNumberId) {
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

    function encodeHuronTags(description) {
      return (description || "").replace(/"/g, "'");
    }

    function decodeHuronTags(description) {
      var tagString = (description || "").replace(/\['/g, '["').replace(/']/g, '"]').replace(/',/g, '",').replace(/,'/g, ',"');
      return tagString;
    }

    var deviceCache = CsdmCacheFactory.create({
      fetch: function () {
        return huronEnabled().then(function (enabled) {
          return !enabled ? $q.when([]) : $http.get(devicesUrl).then(function (res) {
            return CsdmConverter.convertHuronDevices(res.data);
          });
        });
      },
      update: function (url, obj) {
        return $http.put(url, obj).then(function (res) {
          var device = _.clone(deviceCache.list()[url]);
          if (obj.description) {
            try {
              device.tags = JSON.parse(decodeHuronTags(obj.description));
            } catch (e) {
              device.tags = [];
            }
          }
          return device;
        });
      },
      initializeData: initialDataPromise
    });

    function getDeviceList() {
      return deviceCache.list();
    }

    function getLinesForDevice(huronDevice) {
      return $http.get(getDirectoryNumbersUrl(huronDevice.cisUuid))
        .then(function (res) {
          var lines = [];
          return $q.all(_.map(res.data, function (directoryNumber) {
            var line = {
              'directoryNumber': directoryNumber.directoryNumber.pattern,
              'usage': directoryNumber.dnUsage
            };
            return $http.get(getAlternateNumbersUrl(directoryNumber.directoryNumber.uuid)).then(function (alternates) {
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

    function updateTags(url, tags) {
      var jsonTags = encodeHuronTags(JSON.stringify(tags || []));
      if (jsonTags.length >= 128) {
        return $q.reject("List of tags is longer than supported.");
      }
      deviceCache.list()[url].tags = tags; // update ui asap
      deviceCache.list()[url].tagString = tags.join(', '); // update ui asap
      return deviceCache.update(url, {
        description: jsonTags
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
      getLinesForDevice: getLinesForDevice,
      resetDevice: resetDevice,
      uploadLogs: uploadLogs,
      updateTags: updateTags
    };
  }

  angular
    .module('Squared')
    .service('CsdmHuronDeviceService', CsdmHuronDeviceService);

})();
