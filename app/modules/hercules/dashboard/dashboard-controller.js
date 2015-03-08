'use strict';

/* global _ */

angular.module('Hercules')
  .controller('DashboardController', ['$scope', '$interval', '$http', '$modal', 'ConnectorService', 'Notification',
    function ($scope, $interval, $http, $modal, service, notif) {
      $scope.loading = true;
      $scope.inflight = false;
      $scope._promise = true;
      $scope.panelStates = {};
      $scope.visibleAlarm = {};
      $scope.pollHasFailed = false;
      $scope.deleteHostInflight = false;

      $scope._poll = function () {
        if ($scope._promise) {
          $scope._promise = $interval($scope.reload, 2000, 1);
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
          callback();
          if (err) {
            $scope.pollHasFailed = true;
          } else {
            $scope.pollHasFailed = false;
            if (!skipPoll) $scope._poll();
          }
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

      $scope.toggleAlarms = function (clusterId, serviceType, hostName) {
        if ($scope.visibleAlarm.clusterId == clusterId && $scope.visibleAlarm.serviceType == serviceType && $scope.visibleAlarm.hostName == hostName) {
          $scope.visibleAlarm = {};
        } else {
          $scope.visibleAlarm = {
            clusterId: clusterId,
            serviceType: serviceType,
            hostName: hostName
          };
        }
      };

      $scope.showNotificationConfigDialog = function () {
        $scope.modal = $modal.open({
          scope: $scope,
          controller: 'NotificationConfigController',
          templateUrl: 'modules/hercules/notification-config/notification-config.html',
        });
      };

      $scope.reload();
    }
  ]);
