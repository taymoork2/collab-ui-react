'use strict';

angular.module('Hercules')
  .controller('FusionSetupCtrl', ['$scope', '$interval', 'ConnectorService',
    function ($scope, $interval, service) {
      $scope._promise = true;

      $scope._poll = function () {
        if ($scope._promise) {
          $scope._promise = $interval(fetch, 5000, 1);
        }
      };

      var fetch = function () {
        $scope.clusters = service.fetch(function (err, clusters) {
          $scope.clusters = clusters || [];
          if (!err) $scope._poll();
        });
      };

      $scope.$on('$destroy', function () {
        $scope._promise = null;
        $interval.cancel($scope._promise);
      });

      fetch();
    }
  ]);
