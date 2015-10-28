(function () {
  'use strict';

  /* @ngInject */
  function ClusterDetailsController($scope, $modal, $stateParams, $location, ClusterService) {
    $scope.cluster = ClusterService.getClusters()[$stateParams.clusterId];

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
