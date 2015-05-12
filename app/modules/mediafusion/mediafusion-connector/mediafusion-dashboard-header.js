'use strict';

(function () {

  angular.module('Mediafusion')
    .controller('mediafusionDashboardHeaderController', function ($scope, Log) {
      Log.debug("no of clusterss are :" + $scope.clusters);
      $scope.clusters = 5;
      Log.debug("no of clusterss are :" + $scope.clusters);
    })
    .directive('mediafusionDashboardHeader', [
      function () {
        return {
          restrict: 'EA',
          scope: false,
          controller: 'mediafusionDashboardHeaderController',
          templateUrl: 'modules/mediafusion/mediafusion-connector/mediafusion-dashboard-header.html'
        };
      }
    ]);

})();
