(function () {
  'use strict';

  angular
    .module('Squared')
    .controller('RemDeviceController',

      /* @ngInject */
      function ($modalInstance, $translate, CsdmDataModelService, CsdmUnusedAccountsService, FeatureToggleService, deviceOrCode) {
        var rdc = this;
        var showPlaces = false;

        rdc.deviceOrCode = deviceOrCode;

        FeatureToggleService.csdmPlacesGetStatus().then(function (result) {
          showPlaces = result;
        });

        rdc.getDeleteText = function () {
          if (deviceOrCode.needsActivation) {
            if (showPlaces) {
              return $translate.instant('placesPage.deletePlace');
            }
            return $translate.instant('deviceOverviewPage.deleteLocation');
          }
          return $translate.instant('spacesPage.deleteDevice');
        };

        rdc.getDeleteConfText = function () {
          if (deviceOrCode.needsActivation) {
            if (showPlaces) {
              return $translate.instant('spacesPage.deletePlaceConfText');
            }
            return $translate.instant('spacesPage.deleteLocationConfText');
          }
          return $translate.instant('spacesPage.deleteDeviceConfText');
        };

        rdc.deleteDeviceOrCode = function () {
          if (rdc.deviceOrCode.isUnused) {
            return CsdmUnusedAccountsService.deleteAccount(rdc.deviceOrCode)
              .then($modalInstance.close);
          } else {
            return CsdmDataModelService.deleteItem(rdc.deviceOrCode)
              .then($modalInstance.close);
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
