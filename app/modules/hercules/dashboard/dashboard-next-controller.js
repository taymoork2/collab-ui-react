'use strict';

/* global _ */

angular.module('Hercules')
  .controller('DashboardNextController', ['$scope', '$state', '$interval', '$http', '$modal', 'ConnectorService', 'Authinfo',
    function ($scope, $state, $interval, $http, $modal, service, Authinfo) {
      $scope.loading = true;
      $scope.inflight = false;
      $scope._promise = true;
      $scope.panelStates = {};
      $scope.pollHasFailed = false;
      $scope.deleteHostInflight = false;
      $scope.pollTimer = 1000;

      $scope.showClusterDetails = function (cluster) {
        $state.go('cluster-details', {
          cluster: cluster
        });
      };

      $scope._poll = function () {
        if ($scope._promise) {
          $scope._promise = $interval($scope.reload, $scope.pollTimer, 1);
        }
      };

      $scope.$on('$destroy', function () {
        $scope._promise = null;
        $interval.cancel($scope._promise);
      });

      $scope.reload = function (callback, skipPoll) {
        $scope.inflight = true;
        callback = callback || function () {};
        service.fetch(function (err, data) {
          $scope.clusters = data || [];
          $scope.loading = false;
          $scope.inflight = false;
          _.each($scope.clusters, function (c) {
            if ($scope.panelStates[c.id] !== false) {
              $scope.panelStates[c.id] = true;
            }
          });

          $scope.pollHasFailed = !!err;
          $scope.pollTimer = $scope.pollHasFailed ? $scope.pollTimer > 10000 ? $scope.pollTimer : $scope.pollTimer * 2 : 1000;
          if (!skipPoll) $scope._poll();

          callback();
        }, {
          squelchErrors: true
        });
      };

      $scope.upgradeSoftware = function (clusterId, serviceType, callback) {
        service.upgradeSoftware(clusterId, serviceType, function () {
          $scope.reload(function () {
            callback();
          }, true);
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
        service.deleteHost(clusterId, serial, function () {
          $scope.reload(function () {
            $scope.deleteHostInflight = false;
          }, true);
        });
      };

      $scope.showNotificationConfigDialog = function () {
        $scope.modal = $modal.open({
          scope: $scope,
          controller: 'NotificationConfigController',
          templateUrl: 'modules/hercules/notification-config/notification-config.html'
        });
      };

      $scope.reload();
    }
  ]);
