(function () {
  'use strict';

  angular.module('Squared')
    .service('SpacesService', SpacesService);

  /* @ngInject */
  function SpacesService($rootScope, $http, Storage, Config, Log, Auth, Authinfo, UrlConfig) {
    var deviceUrl = UrlConfig.getAdminServiceUrl() + 'organization/' + Authinfo.getOrgId() + '/devices';

    var service = {
      deviceUrl: deviceUrl,
      listDevices: listDevices,
      addDevice: addDevice,
      deleteDevice: deleteDevice,
      getDeviceStatus: getDeviceStatus
    };

    return service;

    function listDevices(callback) {
      $http.get(deviceUrl)
        .success(function (data, status) {
          data = data || {};
          data.success = true;
          callback(data, status);
        })
        .error(function (data, status) {
          data = data || {};
          data.success = false;
          data.status = status;
          callback(data, status);
        });
    }

    function addDevice(newDeviceName, callback) {
      var deviceData = {
        'name': newDeviceName
      };

      if (deviceData.name.length > 0) {
        $http.post(deviceUrl, deviceData)
          .success(function (data, status) {
            data = data || {};
            data.success = true;
            callback(data, status);
          })
          .error(function (data, status) {
            data = data || {};
            data.success = false;
            data.status = status;
            callback(data, status);
          });
      } else {
        callback('No valid device entered.');
      }
    }

    function deleteDevice(deviceUuid, callback) {

      if ((deviceUuid !== null) && (deviceUuid.length > 0)) {
        var deleteUrl = deviceUrl + '/' + deviceUuid;
        $http.delete(deleteUrl)
          .success(function (data, status) {
            data = data || {};
            data.success = true;
            callback(data, status);
          })
          .error(function (data, status) {
            data = data || {};
            data.success = false;
            data.status = status;
            callback(data, status);
          });
      } else {
        callback('No valid device available to delete.');
      }
    }

    function getDeviceStatus(deviceUuid, i, callback) {

      if ((deviceUuid !== null) && (deviceUuid.length > 0)) {
        var getStatusUrl = deviceUrl + '/' + deviceUuid + '/status';
        $http.get(getStatusUrl)
          .success(function (data, status) {
            data = data || {};
            data.success = true;
            callback(data, i, status);
          })
          .error(function (data, status) {
            data = data || {};
            data.success = false;
            data.status = status;
            callback(data, i, status);
          });
      } else {
        callback('No valid device available.');
      }
    }
  }
})();
