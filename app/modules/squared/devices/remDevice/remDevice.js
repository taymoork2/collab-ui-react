(function () {
  'use strict';
  angular
    .module('Squared')
    .controller('RemDeviceController',

      /* @ngInject */
      function ($scope, $modalInstance, CsdmCodeService, CsdmDeviceService, CsdmUnusedAccountsService, XhrNotificationService, deviceOrCode) {
        var rdc = this;

        rdc.deleteDeviceOrCode = function () {
          if (deviceOrCode.needsActivation) {
            return CsdmCodeService.deleteCode(deviceOrCode)
              .then($modalInstance.close, XhrNotificationService.notify);
          } else if (deviceOrCode.isUnused) {
            return CsdmUnusedAccountsService.deleteAccount(deviceOrCode)
              .then($modalInstance.close, XhrNotificationService.notify);
          } else {
            return CsdmDeviceService.deleteDevice(deviceOrCode.url)
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
            templateUrl: 'modules/squared/devices/remDevice/remDevice.html'
          }).result;
        }

        return {
          open: open
        };
      }
    );
})();
