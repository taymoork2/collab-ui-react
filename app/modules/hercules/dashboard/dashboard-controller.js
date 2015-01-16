'use strict';

/* global _ */

angular.module('Hercules')
  .controller('DashboardController', ['$scope', '$rootScope', '$http', 'ConnectorService', 'Notification',
    function ($scope, $rootScope, $http, service, notif) {
      $scope.loading = true;

      var loadData = function () {
        $scope.clusters = [];
        service.fetch(function (err, data) {
          $scope.clusters = data || [];
          $scope.loading = false;
        });
      };

      $scope.reload = function () {
        $scope.loading = true;
        loadData();
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

      loadData();
    }
  ]);
