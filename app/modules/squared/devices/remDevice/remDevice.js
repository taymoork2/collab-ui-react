(function () {
  'use strict';
  angular
    .module('Squared')
    .controller('RemDeviceController',

      /* @ngInject */
      function ($modalInstance, CsdmDataModelService, CsdmHuronOrgDeviceService, CsdmUnusedAccountsService, XhrNotificationService, deviceOrCode) {
        var rdc = this;

        rdc.deviceOrCode = deviceOrCode;

        rdc.deleteDeviceOrCode = function () {
          if (rdc.deviceOrCode.isUnused) {
            return CsdmUnusedAccountsService.deleteAccount(rdc.deviceOrCode)
              .then($modalInstance.close, XhrNotificationService.notify);
          } else if (rdc.deviceOrCode.isHuronDevice) {
            var CsdmHuronDeviceService = CsdmHuronOrgDeviceService.create();
            return CsdmHuronDeviceService.deleteDevice(rdc.deviceOrCode.url)
              .then($modalInstance.close, XhrNotificationService.notify);
          } else {
            return CsdmDataModelService.deleteItem(rdc.deviceOrCode)
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
