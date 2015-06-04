(function () {
  'use strict';
  angular
    .module('Squared')
    .controller('RemDeviceController',

      /* @ngInject */
      function () {}

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
