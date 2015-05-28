(function () {
  'use strict';
  angular
    .module('Hercules')
    .controller('SelectServicesController',

      /* @ngInject */
      function ($scope) {
        $scope.noServicesSelected = false;
        $scope.$watch('services', function (services) {
          $scope.noServicesSelected = _.every(services.allExceptManagement, function (service) {
            return !service.enabled;
          });
          if ($scope.noServicesSelected) $scope.showInfoPanel = true;
        });
      }
    )
    .directive('herculesSelectServices', [
      function () {
        return {
          scope: false,
          restrict: 'E',
          controller: 'SelectServicesController',
          templateUrl: 'modules/hercules/dashboard-info-panel/select-services.html'
        };
      }
    ]);
})();
