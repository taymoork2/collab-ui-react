(function () {
  'use strict';

  angular
    .module('Squared')
    .controller('RemDeviceController',

      /* @ngInject */
      function ($modalInstance, $translate, CsdmDataModelService, device, Notification) {
        var rdc = this;

        rdc.device = device;

        rdc.getDeleteText = function () {
          if (device.isATA) {
            return $translate.instant('deviceOverviewPage.deleteDeviceType', { deviceType: device.product });
          }
          return $translate.instant('spacesPage.deleteDevice');
        };

        rdc.getDeleteConfText = function () {
          if (device.isATA) {
            return $translate.instant('deviceOverviewPage.deleteATAConfText');
          }
          return $translate.instant('spacesPage.deleteDeviceConfText');
        };

        rdc.deleteDevice = function () {
          return CsdmDataModelService.deleteItem(rdc.device)
            .then($modalInstance.close)
            .catch(function (error) {
              Notification.errorResponse(error, 'spacesPage.failedToDelete');
            });
        };
      }
    )
    .service('RemDeviceModal',
      /* @ngInject */
      function ($modal) {
        function open(device) {
          return $modal.open({
            resolve: {
              device: _.constant(device),
            },
            controllerAs: 'rdc',
            controller: 'RemDeviceController',
            template: require('modules/squared/devices/remDevice/remDevice.html'),
            type: 'dialog',
          }).result;
        }

        return {
          open: open,
        };
      }
    );
})();
