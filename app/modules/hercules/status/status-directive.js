(function () {
  'use strict';
  angular
    .module('Hercules')
    .controller('StatusController',

      /* @ngInject */
      function ($scope, ClusterService, Authinfo, ServiceDescriptor) {
        if (!Authinfo.isFusion()) {
          $scope.isEnabled = false;
          return;
        }

        var updateStatus = function () {
          $scope.color = 'gray';
          $scope.isEnabled = true;
          $scope.className = 'fa fa-gear fa-spin';

          ClusterService.fetch().then(function (clusters) {
            $scope.className = 'fa fa-circle';

            $scope.needs_attention = _.reduce(clusters, function (needs_attention, cluster) {
              if (cluster.needs_attention) {
                needs_attention++;
              }
              return needs_attention;
            }, 0);

            if ($scope.needs_attention !== 0) {
              $scope.color = 'red';
            } else {
              $scope.color = 'green';
            }
          }, function () {
            $scope.color = 'red';
            $scope.className = 'fa fa-circle';
          });
        };

        ServiceDescriptor.isFusionEnabled(function (enabled) {
          if (enabled) {
            updateStatus();
          }
        });

      }
    )
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
