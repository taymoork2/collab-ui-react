(function () {
  'use strict';
  angular
    .module('Hercules')
    .controller('ServiceActivationController',
      /* @ngInject */
      function ($scope, ServiceDescriptor, Log, XhrNotificationService) {
        $scope.saving = false;
        $scope.loading = true;
        $scope.confirmUpdate = false;

        ServiceDescriptor.services(function (error, services) {
          if (!error) {
            $scope.setServices(services);
          }
          $scope.loading = false;
        });

        $scope.save = function () {
          $scope.saving = true;
          ServiceDescriptor.services(function (error, services) {
            if (error) {
              Log.error("Failed to fetch services" + error);
            } else {
              var updatedServices = $scope.services.allExceptManagement.filter(function (updated) {
                return services.some(function (original) {
                  return updated.service_id === original.service_id && updated.enabled !== original.enabled;
                });
              });
              if (updatedServices.length > 0) {
                $scope.confirmUpdate = true;
                $scope.updatedServices = updatedServices;
                $scope.servicesToBeRemoved = updatedServices.filter(function (service) {
                  return !service.enabled;
                });
                $scope.servicesToBeAdded = updatedServices.filter(function (service) {
                  return service.enabled;
                });
              } else {
                $scope.$parent.modal.close();
              }
            }
            $scope.saving = false;
          });
        };

        $scope.confirm = function () {
          $scope.saving = true;
          _.forEach($scope.updatedServices, function (service) {
            ServiceDescriptor.setServiceEnabled(service.service_id, service.enabled, function (error) {
              if (error) {
                return XhrNotificationService.notify("Failed to update service: " + error);
              } else {
                // Refresh the services
                ServiceDescriptor.services(function (error, services) {
                  if (!error) {
                    $scope.setServices(services);
                  }
                });
                $scope.$parent.modal.close();
              }
            });
          });
        };
      });
})();
