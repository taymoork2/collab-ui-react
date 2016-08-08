(function () {
  'use strict';

  angular
    .module('uc.device')
    .factory('DeviceService', DeviceService);

  /* @ngInject */
  function DeviceService($rootScope, Authinfo, UserEndpointService, SipEndpointService) {
    var currentDevice = {};

    var service = {
      listDevices: listDevices,
      loadDevices: loadDevices,
      updateDevice: updateDevice,
      deleteDevice: deleteDevice,
      getCurrentDevice: getCurrentDevice,
      setCurrentDevice: setCurrentDevice
    };

    return service;
    /////////////////////

    function listDevices(userUuid) {
      return UserEndpointService.query({
        customerId: Authinfo.getOrgId(),
        userId: userUuid
      }).$promise;
    }

    function getTags(description) {
      try {
        var tags = JSON.parse(description);
        return _.unique(tags);
      } catch (e) {
        try {
          tags = JSON.parse("[\"" + description + "\"]");
          return _.unique(tags);
        } catch (e) {
          return [];
        }
      }
    }

    function getTagString(description) {
      var tags = getTags(description);
      return tags.join(', ');
    }

    function decodeHuronTags(description) {
      var tagString = (description || "").replace(/\['/g, '["').replace(/']/g, '"]').replace(/',/g, '",').replace(/,'/g, ',"');
      return tagString;
    }

    function loadDevices(userUuid) {
      return UserEndpointService.query({
        customerId: Authinfo.getOrgId(),
        userId: userUuid
      }).$promise
        .then(function (devices) {
          var deviceList = [];
          for (var i = 0; i < devices.length; i++) {
            var device = {
              uuid: devices[i].endpoint.uuid,
              name: devices[i].endpoint.name,
              model: '',
              description: '',
              deviceStatus: {
                status: '',
                ipAddress: '',
                progressStatus: false,
                isValid: true
              }
            };

            deviceList.push(device);

            SipEndpointService.get({
              customerId: Authinfo.getOrgId(),
              sipEndpointId: device.uuid
            }, function (endpoint) {
              this.model = endpoint.model;
              this.description = getTagString(decodeHuronTags(endpoint.description));
            }.bind(device));

            device.deviceStatus.progressStatus = true;

            SipEndpointService.get({
              customerId: Authinfo.getOrgId(),
              sipEndpointId: device.uuid,
              status: true,
              ipaddress: true
            }).$promise.then(function (endpoint) {
              if (angular.isDefined(endpoint.registrationStatus) && angular.lowercase(endpoint.registrationStatus) === 'registered') {
                this.deviceStatus.status = 'Online';
              } else {
                this.deviceStatus.status = 'Offline';
              }

              if (angular.isDefined(endpoint.ipAddress) && endpoint.ipAddress !== null) {
                this.deviceStatus.ipAddress = endpoint.ipAddress;
              } else {
                this.deviceStatus.ipAddress = 'unknown';
              }
              this.deviceStatus.progressStatus = false;
            }.bind(device), function () {
              this.deviceStatus.progressStatus = false;
              this.deviceStatus.isValid = false;
            }.bind(device));

          }
          return deviceList;
        });
    }

    function updateDevice(device) {
      var payload = {
        description: device.description
      };
      return SipEndpointService.update({
        customerId: Authinfo.getOrgId(),
        sipEndpointId: device.uuid
      }, payload).$promise;
    }

    function deleteDevice(device) {
      return SipEndpointService.delete({
        customerId: Authinfo.getOrgId(),
        sipEndpointId: device.uuid
      }).$promise;
    }

    function getCurrentDevice() {
      return currentDevice;
    }

    function setCurrentDevice(device) {
      currentDevice = device;
      $rootScope.$broadcast("currentDeviceChanged");
    }

  }
})();
