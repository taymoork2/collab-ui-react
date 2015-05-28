'use strict';

angular.module('Hercules')
  .controller('DashboardNextController',

    /* @ngInject */
    function ($scope, $state, $interval, $http, $modal, ClusterProxy, ServiceDescriptor) {
      $scope.loading = true;
      $scope.pollHasFailed = false;
      $scope.showInfoPanel = false;
      $scope.noServicesSelected = false;
      $scope.startSetupClicked = false;

      ClusterProxy.startPolling();

      $scope.$watch('services', function (services) {
        $scope.noServicesSelected = _.every(services.allExceptManagement, function (service) {
          return !service.enabled;
        });
        if ($scope.noServicesSelected) $scope.showInfoPanel = true;
      });

      ServiceDescriptor.services(function (error, services) {
        if (!error) {
          $scope.setServices(services);
        } else {
          $scope.setServices([]);
        }
        $scope.loading = false;
      });

      $scope.$watch(ClusterProxy.getClusters, function (data) {
        $scope.clusters = data.clusters || [];
        $scope.pollHasFailed = data.error;
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

      $scope.showServiceActivationDialog = function () {
        $scope.modal = $modal.open({
          scope: $scope,
          controller: 'ServiceActivationController',
          templateUrl: 'modules/hercules/dashboard/service-activation.html'
        });
      };

      $scope.startSetup = function () {
        $scope.startSetupClicked = true;
      };

      $scope.setServices = function (services) {
        $scope.services = {
          all: services,
          enabledOnly: ServiceDescriptor.filterEnabledServices(services),
          allExceptManagement: ServiceDescriptor.filterAllExceptManagement(services)
        };
      };

      $scope.shouldShowWelcomeScreen = function () {
        return !$scope.loading && !$scope.pollHasFailed && $scope.noServicesSelected && $scope.clusters.length === 0 && !$scope.startSetupClicked;
      };
    }
  );
