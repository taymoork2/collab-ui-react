'use strict';

angular.module('Hercules')
  .controller('ClusterDetailsController',

    /* @ngInject */
    function ($scope, $state, $stateParams, ConnectorService) {
      $scope.cluster = $stateParams.cluster;

      $scope.visibleAlarm = {};

      $scope.toggleEdit = function (hostName) {
        if ($scope.editingHost == hostName) {
          $scope.editingHost = null;
        } else {
          $scope.editingHost = hostName;
        }
      };

      $scope.deleteHost = function (clusterId, serial) {
        $scope.deleteHostInflight = true;
        ConnectorService.deleteHost(clusterId, serial, function () {
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

      $scope.reload = function (callback) {
        ConnectorService.fetch(function (err, data) {
          var cluster = _.find(data, function (c) {
            return c.id == $scope.cluster.id;
          });
          if (cluster) {
            $scope.cluster = cluster;
            callback();
          } else {
            $state.sidepanel.close();
          }
        });
      };

    }
  );
