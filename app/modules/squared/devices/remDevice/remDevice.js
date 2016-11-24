(function () {
  'use strict';

  angular
    .module('Squared')
    .controller('RemDeviceController',

      /* @ngInject */
      function ($modalInstance, $translate, CsdmDataModelService, FeatureToggleService, deviceOrCode) {
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
          if (deviceOrCode.isATA) {
            return $translate.instant('deviceOverviewPage.deleteDeviceType', { deviceType: deviceOrCode.product });
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
          if (deviceOrCode.isATA) {
            return $translate.instant('deviceOverviewPage.deleteATAConfText');
          }
          return $translate.instant('spacesPage.deleteDeviceConfText');
        };

        rdc.deleteDeviceOrCode = function () {
          return CsdmDataModelService.deleteItem(rdc.deviceOrCode)
            .then($modalInstance.close);
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
