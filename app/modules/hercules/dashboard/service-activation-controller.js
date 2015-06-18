(function () {
  'use strict';
  angular
    .module('Hercules')
    .controller('ServiceActivationController',
      /* @ngInject */
      function ($scope, ServiceDescriptor, Log, Notification, $translate) {
        $scope.saving = false;
        $scope.loading = true;
        $scope.confirmRemove = false;

        ServiceDescriptor.services(function (error, services) {
          if (!error) {
            $scope.setServices(services);
          }
          $scope.loading = false;
        });

        var updateServices = function (updatedServices) {
          _.forEach(updatedServices, function (service) {
            ServiceDescriptor.setServiceEnabled(service.service_id, service.enabled, function (error) {
              if (error) {
                var serviceName = $translate.instant('hercules.serviceNames.' + service.service_id);
                if (error[1] === 403) {
                  Notification.notify($translate.instant('hercules.errors.enableServiceEntitlementFailure', {serviceName: serviceName}), 'error');
                } else {
                  Notification.notify($translate.instant('hercules.errors.enableServiceFailure', {serviceName: serviceName}), 'error');
                }
              } else {
                // Refresh the services
                ServiceDescriptor.services(function (error, services) {
                  if (!error) {
                    $scope.setServices(services);
                  }
                });
              }
            });
          });
        };

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
                $scope.servicesToBeRemoved = updatedServices.filter(function (service) {
                  return !service.enabled;
                });
                var servicesToBeAdded = updatedServices.filter(function (service) {
                  return service.enabled;
                });
                updateServices(servicesToBeAdded);
                if ($scope.servicesToBeRemoved.length > 0) {
                  $scope.confirmRemove = true;
                } else {
                  $scope.$parent.modal.close();
                }
              } else {
                $scope.$parent.modal.close();
              }
            }
            $scope.saving = false;
          });
        };

        $scope.confirm = function () {
          $scope.saving = true;
          updateServices($scope.servicesToBeRemoved);
          $scope.$parent.modal.close();
        };
      });
})();
