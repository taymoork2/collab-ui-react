(function () {
  'use strict';

  /* @ngInject */
  function ClusterDetailsController($scope, $modal, $stateParams, $location, ClusterService) {

    if ($location.absUrl().match(/hercules-deregister=true/)) {
      $scope.showDeregisterButton = true;
    }

    $scope.showDeregisterDialog = function () {
      var cluster = ClusterService.getClusters()[$stateParams.clusterId];
      $modal.open({
        resolve: {
          cluster: function () {
            return cluster;
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
