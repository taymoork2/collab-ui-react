(function () {
  'use strict';

  /*ngInject*/
  function HelpdeskHuronService(HelpdeskService, $http, Config, $q, HelpdeskMockData, DeviceService, UserServiceCommonV2, HuronConfig) {

    function getDevices(orgId, userId) {
      if (HelpdeskService.useMock()) {
        return deferredResolve(massageDevices(HelpdeskMockData.huronDevicesForUser));
      }
      // return DeviceService.loadDevices(userId, orgId).then(massageHuronDevices);
      return deferredResolve([]);
    }

    function massageDevices(devices) {
      _.each(devices, function (device) {
        device.image = device.model ? 'images/devices/' + (device.model.trim().replace(/ /g, '_') + '.png').toLowerCase() : 'images/devices-hi/unknown.png';
        device.deviceStatus.cssColorClass = device.deviceStatus.status === 'Online' ? 'device-status-green' : 'device-status-red';
        if (!device.deviceStatus.status) {
          device.deviceStatus.status = 'Unknown';
        }
      });
      return devices;
    }

    function getUserNumbers(userId, orgId) {
      if (HelpdeskService.useMock()) {
        return deferredResolve(extractNumbers(HelpdeskMockData.huronUserNumbers));
      }
      //return UserServiceCommonV2.get({customerId: orgId, userId: userId}).$promise.then(extractNumbers);
      return deferredResolve([]);
    }

    function extractNumbers(res) {
      return res.data ? res.data.numbers : res.numbers;
    }

    function searchDevices(searchString, orgId, limit) {
      if (HelpdeskService.useMock()) {
        return deferredResolve(extractDevices(HelpdeskMockData.huronDeviceSearchResult));
      }
      /*return $http
      .get(HuronConfig.getCmiUrl() + '/voice/customers/' + orgId + '/sipendpoints?name=' +  encodeURIComponent('%' + searchString + '%') + '&limit=' + limit)
      .then(extractDevices);*/
      return deferredResolve([]);
    }

    function extractDevices(res) {
      var devices = res.data || res;
      // Massage to make it more similar to the cloudberry devices
      _.each(devices, function (device) {
        device.displayName = device.name;
      });
      return devices;
    }

    function deferredResolve(resolved) {
      var deferred = $q.defer();
      deferred.resolve(resolved);
      return deferred.promise;
    }

    return {
      getDevices: getDevices,
      getUserNumbers: getUserNumbers,
      searchDevices: searchDevices
    };
  }

  angular.module('Squared')
    .service('HelpdeskHuronService', HelpdeskHuronService);
}());
