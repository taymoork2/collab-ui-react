(function () {
  'use strict';
  angular
    .module('Hercules')
    .controller('FuseNotPerformedController',

      /* @ngInject */
      function ($scope, ClusterProxy) {
        $scope.fusePerformed = false;
        ClusterProxy.getClusters(function (err, clusters) {
          $scope.fusePerformed = clusters.length;
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
