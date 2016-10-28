(function () {
  'use strict';

  angular
    .module('Squared')
    .controller('RemDeviceController',

      /* @ngInject */
      function ($rootScope, $modalInstance, CsdmDataModelService, CsdmUnusedAccountsService, Notification, deviceOrCode) {
        var rdc = this;

        rdc.deviceOrCode = deviceOrCode;

        rdc.deleteDeviceOrCode = function () {
          if (rdc.deviceOrCode.isUnused) {
            return CsdmUnusedAccountsService.deleteAccount(rdc.deviceOrCode)
              .then($modalInstance.close, Notification.success)
              .finally(rdc.updateDeviceList);
          } else {
            return CsdmDataModelService.deleteItem(rdc.deviceOrCode)
              .then($modalInstance.close, Notification.success)
              .finally(rdc.updateDeviceList);
          }
        };
        rdc.updateDeviceList = function () {
          $rootScope.$emit('updateDeviceList');
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
