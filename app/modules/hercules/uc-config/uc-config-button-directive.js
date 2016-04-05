(function () {
  'use strict';

  angular
    .module('Hercules')
    .controller('UCConfigButtonController', UCConfigButtonController)
    .directive('herculesUcConfigButton', herculesUcConfigButton);

  /* @ngInject */
  function UCConfigButtonController($scope, auth, $modal) {
    $scope.fusionUCEnabled = auth.isFusionUC();

    $scope.showUCConfigDialog = function () {
      $scope.modal = $modal.open({
        scope: $scope,
        controller: 'UCConfigController',
        templateUrl: 'modules/hercules/uc-config/uc-config.html'
      });
    };
  }

  function herculesUcConfigButton() {
    return {
      restrict: 'E',
      controller: 'UCConfigButtonController',
      templateUrl: 'modules/hercules/uc-config/uc-config-button.html'
    };
  }
})();
