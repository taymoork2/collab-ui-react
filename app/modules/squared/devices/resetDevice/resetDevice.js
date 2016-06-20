(function () {
  'use strict';
  angular
    .module('Squared')
    .controller('ResetDeviceController',

      /* @ngInject */
      function ($modalInstance, CsdmHuronDeviceService, XhrNotificationService, deviceOrCode) {
        var rdc = this;

        rdc.resetDevice = function () {
          return CsdmHuronDeviceService.resetDevice(deviceOrCode.url)
            .then($modalInstance.close, XhrNotificationService.notify);
        };
      }

    )
    .service('ResetDeviceModal',
      /* @ngInject */
      function ($modal) {
        function open(deviceOrCode) {
          return $modal.open({
            resolve: {
              deviceOrCode: _.constant(deviceOrCode)
            },
            controllerAs: 'rdc',
            controller: 'ResetDeviceController',
            templateUrl: 'modules/squared/devices/resetDevice/resetDevice.html'
          }).result;
        }

        return {
          open: open
        };
      }
    );
})();
