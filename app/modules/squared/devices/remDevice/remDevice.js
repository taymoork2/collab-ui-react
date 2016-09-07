(function () {
  'use strict';
  angular
    .module('Squared')
    .controller('RemDeviceController',

      /* @ngInject */
      function ($modalInstance, CsdmCodeService, CsdmDeviceService, CsdmHuronOrgDeviceService, CsdmUnusedAccountsService, XhrNotificationService, deviceOrCode) {
        var rdc = this;

        rdc.deviceOrCode = deviceOrCode;

        rdc.deleteDeviceOrCode = function () {
          if (rdc.deviceOrCode.needsActivation) {
            return CsdmCodeService.deleteCode(rdc.deviceOrCode)
              .then($modalInstance.close, XhrNotificationService.notify);
          } else if (rdc.deviceOrCode.isUnused) {
            return CsdmUnusedAccountsService.deleteAccount(rdc.deviceOrCode)
              .then($modalInstance.close, XhrNotificationService.notify);
          } else if (rdc.deviceOrCode.type === 'cloudberry') {
            return CsdmDeviceService.deleteDevice(rdc.deviceOrCode.url)
              .then($modalInstance.close, XhrNotificationService.notify);
          } else {
            var CsdmHuronDeviceService = CsdmHuronOrgDeviceService.create();
            return CsdmHuronDeviceService.deleteDevice(rdc.deviceOrCode.url)
              .then($modalInstance.close, XhrNotificationService.notify);
          }
        };
      }

    )
    .service('RemDeviceModal',
      /* @ngInject */
      function ($modal) {
        function open(deviceOrCode) {
          return $modal.open({
            resolve: {
              deviceOrCode: _.constant(deviceOrCode)
            },
            controllerAs: 'rdc',
            controller: 'RemDeviceController',
            templateUrl: 'modules/squared/devices/remDevice/remDevice.html',
            type: 'dialog'
          }).result;
        }

        return {
          open: open
        };
      }
    );
})();
