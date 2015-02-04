'use strict';

/* global _ */

angular.module('Hercules')
  .controller('DashboardController', ['$scope', '$rootScope', '$http', '$modal', 'ConnectorService', 'Notification',
    function ($scope, $rootScope, $http, $modal, service, notif) {
      $scope.loading = true;
      $scope.inflight = false;
      $scope.visibleAlarm = {};
      $scope.deleteHostInflight = false;

      $scope.reload = function (callback) {
        $scope.inflight = true;
        callback = callback || function () {};
        service.fetch(function (err, data) {
          $scope.clusters = data || [];
          $scope.loading = false;
          $scope.inflight = false;
          callback();
        });
      };

      $scope.upgradeSoftware = function (clusterId, serviceType, callback) {
        service.upgradeSoftware(clusterId, serviceType, function () {
          $scope.reload(function () {
            callback();
          });
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
          });
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
