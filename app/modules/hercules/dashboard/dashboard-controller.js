'use strict';

/* global _ */

angular.module('Hercules')
  .controller('DashboardController', ['$scope', '$rootScope', '$http', 'ConnectorService', 'Notification',
    function ($scope, $rootScope, $http, service, notif) {
      $scope.loading = true;
      $scope.inflight = false;

      $scope.reload = function () {
        $scope.inflight = true;
        service.fetch(function (err, data) {
          $scope.clusters = data || [];
          $scope.loading = false;
          $scope.inflight = false;
        });
      };

      $scope.upgradeSoftware = function (clusterId, serviceType, callback) {
        service.upgradeSoftware({
          clusterId: clusterId,
          serviceType: serviceType,
          callback: function() {
            callback();
            $scope.reload();
          }
        });
        return false;
      };

      $scope.reload();
    }
  ]);
