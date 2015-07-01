(function () {
  'use strict';
  angular
    .module('Squared')
    .controller('RemDeviceController',

      /* @ngInject */
      function ($scope, $state, CsdmCodeService, CsdmDeviceService, XhrNotificationService) {
        $scope.deleteDeviceOrCode = function (deviceOrCode) {
          if (deviceOrCode.needsActivation) {
            CsdmCodeService
              .deleteCode(deviceOrCode.url)
              .then($state.sidepanel.close, XhrNotificationService.notify);
          } else {
            CsdmDeviceService
              .deleteDevice(deviceOrCode.url)
              .then($state.sidepanel.close, XhrNotificationService.notify);
          }
        };
      }

    )
    .directive('squaredRemDevice',
      function () {
        return {
          restrict: 'E',
          controller: 'RemDeviceController',
          templateUrl: 'modules/squared/devicesRedux/remDevice/remDevice.html'
        };
      }
    );
})();
