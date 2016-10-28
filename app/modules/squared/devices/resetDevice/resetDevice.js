(function () {
  'use strict';

  angular
    .module('Squared')
    .controller('ResetDeviceController',

      /* @ngInject */
      function ($modalInstance, CsdmHuronOrgDeviceService, Notification, deviceOrCode) {
        var rdc = this;

        rdc.resetDevice = function () {
          var CsdmHuronDeviceService = CsdmHuronOrgDeviceService.create();
          return CsdmHuronDeviceService.resetDevice(deviceOrCode.url)
            .then($modalInstance.close, Notification.notify);
        };
      }

    )
    .service('ResetDeviceModal',
      /* @ngInject */
      function ($modal) {
        function open(deviceOrCode) {
          return $modal.open({
            type: 'dialog',
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
