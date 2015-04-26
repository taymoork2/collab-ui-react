(function () {
  'use strict';
  angular
    .module('Hercules')
    .controller('FuseNotPerformedController',

      /* @ngInject */
      function ($scope, ClusterProxy) {
        $scope.fusePerformed = false;
        ClusterProxy.getClusters(function (err, clusters) {
          $scope.fusePerformed = err || (clusters && clusters.length);
          if (!$scope.fusePerformed) $scope.showInfoPanel = true;
        });
      }

    )
    .directive('herculesFuseNotPerformed', [
      function () {
        return {
          scope: false,
          restrict: 'E',
          controller: 'FuseNotPerformedController',
          templateUrl: 'modules/hercules/dashboard-info-panel/fuse-not-performed.html'
        };
      }
    ]);
})();
