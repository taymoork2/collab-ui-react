(function () {
  'use strict';

  angular
    .module('Hercules')
    .directive('herculesCloudExtensions', herculesCloudExtensions)
    .controller('HybridServicesCtrl', HybridServicesCtrl);

  /* @ngInject */
  function HybridServicesCtrl($scope, $stateParams, Authinfo, USSService, ServiceDescriptor, $timeout) {
    if (!Authinfo.isFusion()) {
      return;
    }
    var vm = this;
    var extensionEntitlements = ['squared-fusion-cal', 'squared-fusion-uc'];
    var stopDelayedUpdates = false;
    var delayedUpdateTimer = null;
    vm.extensions = [];
    vm.isEnabled = false;

    vm.getStatus = function (status) {
      return USSService.decorateWithStatus(status);
    };

    vm.extensionIcon = function (id) {
      return ServiceDescriptor.serviceIcon(id);
    };

    if (extensionEntitlements.every(function (extensionEntitlement) {
        return !Authinfo.isEntitled(extensionEntitlement);
      })) {
      return;
    }

    _.forEach(extensionEntitlements, function (extensionEntitlement) {
      if (Authinfo.isEntitled(extensionEntitlement)) {
        vm.extensions.push({
          id: extensionEntitlement,
          entitled: hasEntitlement(extensionEntitlement)
        });
      }
    });

    // Filter out extensions that are not enabled in FMS
    ServiceDescriptor.services(function (error, services) {
      if (services) {
        _.forEach(vm.extensions, function (extension) {
          extension.enabled = ServiceDescriptor.filterEnabledServices(services).some(function (service) {
            return extension.id === service.id;
          });
          if (extension.enabled) {
            vm.isEnabled = true;
          }
        });
        if (vm.isEnabled) {
          // Only poll for statuses if there are enabled extensions
          updateStatusForUser();
        }
      }
    });

    // Periodically update the user statuses from USS
    function updateStatusForUser() {
      if (angular.isDefined(vm.user)) {
        USSService.getStatusesForUser(vm.user.id, function (err, activationStatus) {
          if (activationStatus && activationStatus.userStatuses) {
            _.forEach(vm.extensions, function (extension) {
              extension.status = _.find(activationStatus.userStatuses, function (status) {
                return extension.id === status.serviceId;
              });
            });
          }
          delayedUpdateStatusForUser();
        });
      }
    }

    function delayedUpdateStatusForUser() {
      if (stopDelayedUpdates) {
        return;
      }
      delayedUpdateTimer = $timeout(function () {
        updateStatusForUser();
      }, 5000);
    }

    function hasEntitlement(entitlement) {
      if (!angular.isDefined(vm.user)) {
        return false;
      }

      return vm.user.entitlements && vm.user.entitlements.indexOf(entitlement) > -1;
    }

    $scope.$on('$destroy', function () {
      stopDelayedUpdates = true;
      if (delayedUpdateTimer) {
        $timeout.cancel(delayedUpdateTimer);
      }
    });
  }

  function herculesCloudExtensions() {
    return {
      scope: true,
      restrict: 'E',
      controller: 'HybridServicesCtrl',
      controllerAs: 'hybridServicesCtrl',
      bindToController: {
        user: '='
      },
      templateUrl: 'modules/hercules/hybridServices/hybridServices.tpl.html'
    };
  }
}());
