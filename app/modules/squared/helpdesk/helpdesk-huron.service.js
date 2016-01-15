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
    
    function getDevice(orgId, deviceId) {
      if (HelpdeskService.useMock()) {
        return deferredResolve(massageDevice(HelpdeskMockData.huronDevice));
      }
       /*return $http
      .get(HuronConfig.getCmiUrl() + '/voice/customers/' + orgId + '/sipendpoints/' + deviceId + '?status=true')
      .then(extractDevices);*/
      return deferredResolve([]);
    }

    function massageDevices(devices) {
      _.each(devices, massageDevice);
      console.log('massageDevices', devices);
      return devices;
    }
    
    function massageDevice(device) {
      device.displayName = device.name;
      device.isHuronDevice = true;
      device.image = device.model ? 'images/devices/' + (device.model.trim().replace(/ /g, '_') + '.png').toLowerCase() : 'images/devices-hi/unknown.png';
      if (!device.deviceStatus) {      
        if (device.registrationStatus) {
          device.deviceStatus = { status: angular.lowercase(device.registrationStatus) === 'registered' ? 'Online' : 'Offline' };
        } else {
          device.deviceStatus = { status: 'Unknown' };
        }
      } else if (!device.deviceStatus.status) {
        device.deviceStatus.status = 'Unknown';
      }
      device.deviceStatus.statusKey = 'common.' + angular.lowercase(device.deviceStatus.status);
      device.deviceStatus.cssColorClass = device.deviceStatus.status === 'Online' ? 'device-status-green' : 'device-status-red';    
      return device;
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
      return massageDevices(res.data || res);
    }

    function deferredResolve(resolved) {
      var deferred = $q.defer();
      deferred.resolve(resolved);
      return deferred.promise;
    }

    return {
      getDevices: getDevices,
      getUserNumbers: getUserNumbers,
      searchDevices: searchDevices,
      getDevice: getDevice
    };
  }

  angular.module('Squared')
    .service('HelpdeskHuronService', HelpdeskHuronService);
}());
