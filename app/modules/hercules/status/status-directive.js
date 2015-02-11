(function () {
  'use strict';
  angular
    .module('Hercules')
    .controller('StatusController', ['$scope', 'ConnectorService', 'Authinfo', function ($scope, service, auth) {
      if (!auth.isFusion()) {
        $scope.isEnabled = false;
        return;
      }

      $scope.color = 'gray';
      $scope.isEnabled = true;
      $scope.className = 'fa fa-gear fa-spin';

      service.fetch(function (err, clusters) {
        $scope.className = 'fa fa-circle';

        $scope.needs_attention = _.reduce(clusters, function (needs_attention, cluster) {
          if (cluster.needs_attention) {
            needs_attention++;
          }
          return needs_attention;
        }, 0);

        if ($scope.needs_attention != 0 || err) {
          $scope.color = 'red';
        } else {
          $scope.color = 'green';
        }
      }, {
        squelchErrors: true
      });

    }])
    .directive('herculesStatus',
      function () {
        return {
          restrict: 'E',
          controller: 'StatusController',
          templateUrl: 'modules/hercules/status/status.html'
        };
      }
    );
})();
