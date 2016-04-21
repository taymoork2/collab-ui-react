(function () {
  'use strict';

  angular
    .module('Hercules')
    .directive('herculesCloudExtensions', herculesCloudExtensions)
    .controller('HybridServicesCtrl', HybridServicesCtrl);

  /* @ngInject */
  function HybridServicesCtrl($scope, $timeout, Authinfo, Config, USSService, ServiceDescriptor, Orgservice) {
    if (!Authinfo.isFusion()) {
      return;
    }
    var vm = this;
    var extensionEntitlements = ['squared-fusion-cal', 'squared-fusion-uc', 'squared-fusion-ec'];
    var extensionCallEntitlements = ['squared-fusion-uc', 'squared-fusion-ec'];
    var stopDelayedUpdates = false;
    var delayedUpdateTimer = null;
    vm.extensions = getExtensions();
    vm.isEnabled = false;

    $scope.allExceptUcFilter = function (item) {
      return item.enabled === true && item.id !== 'squared-fusion-ec';
    };

    vm.getStatus = function (status) {
      // for Hybrid Call, we need to aggregate the status from ﬂﬂ Aware and Connect
      var mostSignificantStatus;
      if (status) {
        if (_.find(extensionCallEntitlements, function (ece) {
            return status && ece === status.serviceId;
          })) {
          var callServiceStatuses = getCallExtensions();
          mostSignificantStatus = getMostSignificantStatus(callServiceStatuses);
        }
      }

      return USSService.decorateWithStatus(mostSignificantStatus === undefined || mostSignificantStatus.status === undefined ? status : mostSignificantStatus.status);
    };

    function getMostSignificantStatus(statuses) {
      var mostSignificant = _.max(statuses, function (s) {
        if (s && s.status) {
          return getStatusSeverity(USSService.decorateWithStatus(s.status));
        }
      });

      return mostSignificant;
    }

    function getStatusSeverity(status) {
      var value = -1;

      switch (status) {
        case 'not_entitled':
          value = 0;
          break;
        case 'activated':
          value = 1;
          break;
        case 'pending_activation':
          value = 2;
          break;
        case 'error':
        default:
          value = 3;
      }
      return value;
    }

    vm.extensionIcon = function (id) {
      return ServiceDescriptor.serviceIcon(id);
    };

    if (extensionEntitlements.every(function (extensionEntitlement) {
        return !Authinfo.isEntitled(extensionEntitlement);
      })) {
      return;
    }

    Orgservice.getLicensesUsage()
      .then(function (subscriptions) {
        var hasAnyLicense = _.some(subscriptions, function (subscription) {
          return subscription.licenses && subscription.licenses.length > 0;
        });
        if (hasAnyLicense) {
          checkEntitlements({
            enforceLicenseCheck: true
          });
        } else {
          checkEntitlements({
            enforceLicenseCheck: false
          });
        }
      }, function () {
        checkEntitlements({
          enforceLicenseCheck: false
        });
      });

    function checkEntitlements(options) {
      if (options.enforceLicenseCheck && !hasCaaSLicense()) {
        return;
      }
      // Filter out extensions that are not enabled in FMS
      ServiceDescriptor.services(function (error, services) {
        if (services) {
          _.forEach(vm.extensions, function (extension) {
            extension.enabled = ServiceDescriptor.filterEnabledServices(services).some(function (service) {
              return extension.id === service.id;
            });
            // can't have huron (ciscouc) and call service at the same time
            if (extension.id === 'squared-fusion-uc' && hasHuronEntitlement()) {
              extension.enabled = false;
            }
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
    }

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

    function getExtensions() {
      return _.map(extensionEntitlements, function (extensionEntitlement) {
        if (Authinfo.isEntitled(extensionEntitlement)) {
          return {
            id: extensionEntitlement,
            entitled: hasEntitlement(extensionEntitlement)
          };
        }
      });
    }

    function getCallExtensions() {
      return _.map(vm.extensions, function (extensionEntitlement) {
        if (_.find(extensionCallEntitlements, function (ee) {
            return extensionEntitlement.id === ee;
          })) {
          return {
            status: extensionEntitlement.status
          };
        }
      });
    }

    function hasCaaSLicense() {
      // latest update says that a "Collaboration as a Service license" is
      // equivalent to any license
      var licenseIDs = _.get(vm.user, 'licenseID', []);
      var offerCodes = _.map(licenseIDs, function (licenseString) {
        return licenseString.split('_')[0];
      });
      return offerCodes.length > 0;
    }

    var hasHuronEntitlement = function (ent) {
      return vm.user.entitlements.indexOf('ciscouc') > -1;
    };

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
