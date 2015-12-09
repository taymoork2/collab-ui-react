(function () {
  'use strict';
  angular
    .module('Hercules')
    .controller('UserActivationController',

      /* @ngInject */
      function ($scope, $state, ServiceDescriptor, $modal) {
        var statusSummary = [];
        var updateSummary = function () {
          var userActivationNotComplete = false;
          var servicesWithUserErrors = false;
          if ($scope.clusters && $scope.clusterLength() !== 0 && $scope.services && $scope.services.enabledOnly && $scope.services.enabledOnly.length !== 0) {
            $scope.xsummary = _.map($scope.services.enabledOnly, function (service) {
              var summaryForService = _.find(statusSummary, function (summary) {
                return service.id == summary.serviceId;
              });
              var needsUserActivation = !summaryForService || (summaryForService.activated === 0 && summaryForService.error === 0 && summaryForService.notActivated === 0);
              if (needsUserActivation) {
                userActivationNotComplete = true;
              }

              var errors = 0;
              if (summaryForService && summaryForService.error > 0) {
                servicesWithUserErrors = true;
                errors = summaryForService.error;
              }
              return {
                serviceId: service.id,
                needsUserActivation: needsUserActivation,
                errors: errors
              };
            });
          }
          $scope.userActivationNotComplete = userActivationNotComplete;
          $scope.servicesWithUserErrors = servicesWithUserErrors;
          if (userActivationNotComplete || servicesWithUserErrors) {
            $scope.showInfoPanel = true;
          }
        };

        $scope.$watch('services', function () {
          updateSummary();
        });

        $scope.$watch('clusters', function () {
          updateSummary();
        });

        $scope.$watch('userStatusesSummary', function (userStatusesSummary) {
          if (userStatusesSummary && userStatusesSummary.summary) {
            statusSummary = userStatusesSummary.summary;
            updateSummary();
          }
        });

        $scope.navigateToUsers = function () {
          $state.go('users.list');
        };

        $scope.showUserStatusesDialog = function (selectedServiceId) {
          $scope.selectedServiceId = selectedServiceId;
          $scope.modal = $modal.open({
            scope: $scope,
            controller: 'UserErrorsController',
            controllerAs: 'userErrorsCtrl',
            templateUrl: 'modules/hercules/expressway-service/user-errors.html',
            resolve: {
              serviceId: function () {
                return $scope.selectedServiceId;
              }
            }
          });
        };

      }
    )
    .directive('herculesUserActivation', [
      function () {
        return {
          scope: false,
          restrict: 'E',
          controller: 'UserActivationController',
          templateUrl: 'modules/hercules/dashboard-info-panel/user-activation.html'
        };
      }

    ]);
})();
