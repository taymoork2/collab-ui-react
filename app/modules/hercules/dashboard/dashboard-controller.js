'use strict';

/* global _ */

angular.module('Hercules')
  .controller('DashboardController', ['$scope', '$rootScope', '$http', 'ConnectorService', 'Notification',
    function ($scope, $rootScope, $http, service, notif) {
      $scope.loading = true;
      $scope.inflight = false;
      $scope.deleteHostInflight = false;

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
          callback: function () {
            callback();
            $scope.reload();
          }
        });
        return false;
      };

      $scope.toggleEdit = function (hostName) {
        if ($scope.editingHost == hostName) {
          $scope.editingHost = null;
        } else {
          $scope.editingHost = hostName;
        }
      };

      $scope.deleteHost = function (clusterId, serial) {
        $scope.deleteHostInflight = true;
        service.deleteHost(clusterId, serial, function() {
          $scope.deleteHostInflight = false;
          $scope.reload();
        });
      };

      $scope.reload();
    }
  ]);
