'use strict';

/* global _ */

angular.module('Hercules')
  .controller('FusionSetupCtrl', ['$scope', '$interval', 'ConnectorService',
    function ($scope, $interval, service) {
      var promise = true;

      var poll = function () {
        if (promise) {
          promise = $interval(fetch, 5000, 1);
        }
      };

      var fetch = function () {
        $scope.clusters = service.fetch(function (err, clusters) {
          $scope.clusters = clusters || [];
          poll();
        });
      };

      $scope.$on('$destroy', function () {
        promise = null;
        $interval.cancel(promise);
      });

      fetch();
    }
  ]);
