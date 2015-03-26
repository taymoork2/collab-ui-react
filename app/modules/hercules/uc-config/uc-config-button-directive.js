(function () {
  'use strict';
  angular
    .module('Hercules')
    .controller('UCConfigButtonController', ['$scope', 'Authinfo', '$modal', function ($scope, auth, $modal) {
      $scope.fusionUCEnabled = auth.isFusionUC();

      $scope.showUCConfigDialog = function () {
        $scope.modal = $modal.open({
          scope: $scope,
          controller: 'UCConfigController',
          templateUrl: 'modules/hercules/uc-config/uc-config.html'
        });
      };
    }])
    .directive('herculesUcConfigButton',
      function () {
        return {
          restrict: 'E',
          controller: 'UCConfigButtonController',
          templateUrl: 'modules/hercules/uc-config/uc-config-button.html'
        };
      }
    );
})();
