(function () {
  'use strict';

  angular
    .module('Squared')
    .controller('RemDeviceController',

      /* @ngInject */
      function ($modalInstance, $translate, $q, CsdmDataModelService, device, Notification, CsdmLyraConfigurationService, FeatureToggleService) {
        var rdc = this;

        rdc.device = device;
        rdc.deleteConfig = false;

        rdc.deleteConfigurationOptionAvailable = false;
        FeatureToggleService.csdmDeviceDeleteConfigurationOptionGetStatus().then(function (status) {
          rdc.deleteConfigurationOptionAvailable = status;
        });

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
          var deleteConfigPromise;

          if (rdc.device.isCloudberryDevice() && (rdc.deleteConfig || !rdc.deleteConfigurationOptionAvailable)) {
            deleteConfigPromise = CsdmLyraConfigurationService.deleteConfig(rdc.device.cisUuid, rdc.device.wdmUrl);
          } else {
            deleteConfigPromise = $q.resolve();
          }

          return deleteConfigPromise
            .then(function () {
              return CsdmDataModelService.deleteItem(rdc.device);
            })
            .then(function () {
              $modalInstance.close();
            })
            .catch(function (error) {
              // If Lyra cannot find the device, there is nothing to delete
              if (error.status === 404) {
                return CsdmDataModelService.deleteItem(rdc.device)
                  .then($modalInstance.close);
              } else {
                Notification.errorResponse(error, 'spacesPage.failedToDelete');
                return $q.reject(error);
              }
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
