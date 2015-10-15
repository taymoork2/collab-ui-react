(function () {
  'use strict';

  /* @ngInject */
  function ClusterDetailsController($scope, $modal, $stateParams, $location, ClusterService) {
    $scope.cluster = ClusterService.getClusters()[$stateParams.clusterId];
    if ($location.absUrl().match(/hercules-deregister=true/)) {
      $scope.showDeregisterButton = true;
    }

    $scope.showDeregisterDialog = function () {
      $modal.open({
        resolve: {
          cluster: function () {
            return $scope.cluster;
          }
        },
        controller: 'ClusterDeregisterController',
        controllerAs: "clusterDeregister",
        templateUrl: 'modules/hercules/cluster-deregister/deregister-dialog.html'
      });
    };
  }

  angular
    .module('Hercules')
    .controller('ClusterDetailsController', ClusterDetailsController);
}());
