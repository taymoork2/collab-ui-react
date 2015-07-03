(function () {
  'use strict';

  /* @ngInject */
  function ClusterDetailsController($scope, $stateParams, ConnectorService) {
    $scope.cluster = ConnectorService.getClusters()[$stateParams.clusterId];
  }

  angular
    .module('Hercules')
    .controller('ClusterDetailsController', ClusterDetailsController);
}());
