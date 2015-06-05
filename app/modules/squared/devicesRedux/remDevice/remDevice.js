(function () {
  'use strict';
  angular
    .module('Squared')
    .controller('RemDeviceController',

      /* @ngInject */
      function ($scope, $state, CsdmService, XhrNotificationService) {
        $scope.deleteDevice = function (device) {
          CsdmService.deleteUrl(device.url, function (err, data) {
            if (err) {
              return XhrNotificationService.notify(err);
            }
            $state.sidepanel.close();
          });
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
