'use strict';

angular.module('Hercules')
  .controller('DashboardNextController',

    /* @ngInject */
    function ($scope, $state, $interval, $http, $modal, ClusterProxy, Authinfo) {
      $scope.loading = true;
      $scope.pollHasFailed = false;

      ClusterProxy.startPolling();

      $scope.$watch(ClusterProxy.getClusters, function (data) {
        $scope.clusters = data.clusters || [];
        $scope.pollHasFailed = data.error;
        $scope.loading = false;
      }, true);

      $scope.$on('$destroy', function () {
        ClusterProxy.stopPolling();
      });

      $scope.showClusterDetails = function (cluster) {
        $state.go('cluster-details', {
          clusterId: cluster.id
        });
      };

      $scope.showNotificationConfigDialog = function () {
        $scope.modal = $modal.open({
          scope: $scope,
          controller: 'NotificationConfigController',
          templateUrl: 'modules/hercules/notification-config/notification-config.html'
        });
      };
    }
  );
