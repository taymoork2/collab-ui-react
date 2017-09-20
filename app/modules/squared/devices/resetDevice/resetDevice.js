(function () {
  'use strict';

  angular
    .module('Squared')
    .controller('ResetDeviceController',

      /* @ngInject */
      function ($modalInstance, CsdmHuronOrgDeviceService, Notification, device) {
        var rdc = this;

        rdc.resetDevice = function () {
          var CsdmHuronDeviceService = CsdmHuronOrgDeviceService.create();
          return CsdmHuronDeviceService.resetDevice(device.url)
            .then(function () {
              $modalInstance.close();
              Notification.success('deviceOverviewPage.deviceRebootingDetails', null, 'deviceOverviewPage.deviceRebooting');
            })
            .catch(function (response) {
              Notification.errorResponse(response);
            });
        };
      }

    )
    .service('ResetDeviceModal',
      /* @ngInject */
      function ($modal) {
        function open(device) {
          return $modal.open({
            type: 'dialog',
            resolve: {
              device: _.constant(device),
            },
            controllerAs: 'rdc',
            controller: 'ResetDeviceController',
            template: require('modules/squared/devices/resetDevice/resetDevice.html'),
          }).result;
        }

        return {
          open: open,
        };
      }
    );
})();
