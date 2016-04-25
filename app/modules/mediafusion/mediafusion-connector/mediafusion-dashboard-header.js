'use strict';

(function () {

  angular.module('Mediafusion')
    .controller('mediafusionDashboardHeaderController', mediafusionDashboardHeaderController)
    .directive('mediafusionDashboardHeader', mediafusionDashboardHeader);

  /* @ngInject */
  function mediafusionDashboardHeaderController($scope, Log) {
    Log.debug("no of clusterss are :" + $scope.clusters);
    $scope.clusters = 5;
    Log.debug("no of clusterss are :" + $scope.clusters);
  }

  function mediafusionDashboardHeader() {
    return {
      restrict: 'EA',
      scope: false,
      controller: 'mediafusionDashboardHeaderController',
      templateUrl: 'modules/mediafusion/mediafusion-connector/mediafusion-dashboard-header.html'
    };
    }
})();
