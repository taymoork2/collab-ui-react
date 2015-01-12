(function () {
  'use strict';

  angular
    .module('uc.device')
    .factory('DeviceService', DeviceService);

  /* @ngInject */
  function DeviceService($rootScope, $http, Authinfo, UserEndpointService, SipEndpointService, HuronConfig) {
    var currentDevice = {};

    var service = {
      loadDevices: loadDevices,
      updateDevice: updateDevice,
      deleteDevice: deleteDevice,
      getCurrentDevice: getCurrentDevice,
      setCurrentDevice: setCurrentDevice,
      getQrCode: getQrCode,
      getQrCodeUrl: getQrCodeUrl
    };

    return service;
    /////////////////////

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
              description: ''
            };

            deviceList.push(device);

            SipEndpointService.get({
              customerId: Authinfo.getOrgId(),
              sipEndpointId: device.uuid
            }, function (endpoint) {
              this.model = endpoint.model;
              this.description = endpoint.description;
            }.bind(device))
          }
          return deviceList;
        });
    }

    function updateDevice(device) {
      var payload = {
        description: device.description
      }
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

    function getQrCode(activationCode) {
      var config = {
        headers: {
          'Accept': "image/png"
        }
      };
      return $http.get(HuronConfig.getOcelotUrl() + '/getqrimage?oneTimePassword=' + activationCode, config);
    }

    function getQrCodeUrl(activationCode) {
      return HuronConfig.getOcelotUrl() + '/getqrimage?oneTimePassword=' + activationCode
    }

  }
})();
