'use strict';

/* global _ */

angular.module('Hercules')
  .controller('FusionSetupCtrl', ['$scope', '$timeout', 'ConnectorService',
    function ($scope, $timeout, service) {
      var timer = 1;

      var poll = function () {
        if (timer) {
          timer = $timeout(fetch, 5000);
        }
      };

      var fetch = function () {
        $scope.clusters = service.fetch(function (err, clusters) {
          $scope.clusters = clusters || [];
          poll();
        });
      };

      $scope.clusters = [];

      $scope.$on('$destroy', function () {
        timer = 0;
        $timeout.cancel(timer);
      });

      fetch();
    }
  ]);
