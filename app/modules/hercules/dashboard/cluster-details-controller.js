(function () {
  'use strict';

  /* @ngInject */
  function ClusterDetailsController($scope, $stateParams, ClusterService) {
    $scope.cluster = ClusterService.getClusters()[$stateParams.clusterId];
  }

  angular
    .module('Hercules')
    .controller('ClusterDetailsController', ClusterDetailsController);
}());
