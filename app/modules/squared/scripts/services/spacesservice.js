(function () {
  'use strict';

  angular.module('Squared')
    .service('SpacesService', SpacesService);

  /* @ngInject */
  function SpacesService($http, Authinfo, UrlConfig) {
    var deviceUrl = UrlConfig.getAdminServiceUrl() + 'organization/' + Authinfo.getOrgId() + '/devices';

    var service = {
      deviceUrl: deviceUrl,
      listDevices: listDevices,
      addDevice: addDevice,
      deleteDevice: deleteDevice,
      getDeviceStatus: getDeviceStatus,
    };

    return service;

    function listDevices(callback) {
      $http.get(deviceUrl)
        .then(function (response) {
          var data = response.data;
          data = _.isObject(data) ? data : {};
          data.success = true;
          callback(data, response.status);
        })
        .catch(function (response) {
          var data = response.data;
          data = _.isObject(data) ? data : {};
          data.success = false;
          data.status = response.status;
          callback(data, response.status);
        });
    }

    function addDevice(newDeviceName, callback) {
      var deviceData = {
        name: newDeviceName,
      };

      if (deviceData.name.length > 0) {
        $http.post(deviceUrl, deviceData)
          .then(function (response) {
            var data = response.data;
            data = _.isObject(data) ? data : {};
            data.success = true;
            callback(data, response.status);
          })
          .catch(function (response) {
            var data = response.data;
            data = _.isObject(data) ? data : {};
            data.success = false;
            data.status = response.status;
            callback(data, response.status);
          });
      } else {
        callback('No valid device entered.');
      }
    }

    function deleteDevice(deviceUuid, callback) {
      if ((deviceUuid !== null) && (deviceUuid.length > 0)) {
        var deleteUrl = deviceUrl + '/' + deviceUuid;
        $http.delete(deleteUrl)
          .then(function (response) {
            var data = response.data;
            data = _.isObject(data) ? data : {};
            data.success = true;
            callback(data, response.status);
          })
          .catch(function (response) {
            var data = response.data;
            data = _.isObject(data) ? data : {};
            data.success = false;
            data.status = response.status;
            callback(data, response.status);
          });
      } else {
        callback('No valid device available to delete.');
      }
    }

    function getDeviceStatus(deviceUuid, i, callback) {
      if ((deviceUuid !== null) && (deviceUuid.length > 0)) {
        var getStatusUrl = deviceUrl + '/' + deviceUuid + '/status';
        $http.get(getStatusUrl)
          .then(function (response) {
            var data = response.data;
            data = _.isObject(data) ? data : {};
            data.success = true;
            callback(data, i, response.status);
          })
          .catch(function (response) {
            var data = response.data;
            data = _.isObject(data) ? data : {};
            data.success = false;
            data.status = response.status;
            callback(data, i, response.status);
          });
      } else {
        callback('No valid device available.');
      }
    }
  }
})();
