(function () {
  'use strict';

  angular
    .module('Hercules')
    .directive('herculesCloudExtensions', herculesCloudExtensions)
    .controller('HybridServicesCtrl', HybridServicesCtrl);

  /* @ngInject */
  function HybridServicesCtrl($scope, $rootScope, $timeout, Authinfo, USSService, HybridServicesUtils, ServiceDescriptor, Notification, Userservice, CloudConnectorService, FeatureToggleService) {
    if (!Authinfo.isFusion()) {
      return;
    }
    var vm = this;
    var extensionEntitlements = ['squared-fusion-cal', 'squared-fusion-gcal', 'squared-fusion-uc', 'squared-fusion-ec'];
    var extensionCallEntitlements = ['squared-fusion-uc', 'squared-fusion-ec'];
    var stopDelayedUpdates = false;
    var delayedUpdateTimer = null;
    vm.extensions = getExtensions();
    vm.isEnabled = false;
    vm.userStatusLoaded = false;
    vm.isPlace = vm.user && vm.user.accountType === 'MACHINE';
    vm.isUser = !vm.isPlace;
    vm.isInvitePending = vm.user && vm.isUser ? Userservice.isInvitePending(vm.user) : false;

    FeatureToggleService.supports(FeatureToggleService.features.atlasHerculesGoogleCalendar)
      .then(function (supported) {
        vm.atlasHerculesGoogleCalendarFeatureToggle = supported;
      });

    vm.allExceptUcFilter = function (item) {
      return item && item.enabled === true && item.id !== 'squared-fusion-ec';
    };

    vm.placeFilter = function (item) {
      return item && item.enabled === true && item.entitled === true && item.id != 'squared-fusion-ec';
    };

    vm.getStatus = function (status) {
      // for Hybrid Call, we need to aggregate the status from Aware and Connect
      var mostSignificantStatus;
      if (status) {
        if (_.includes(extensionCallEntitlements, status.serviceId)) {
          var callServiceStatuses = getCallExtensions();
          mostSignificantStatus = getMostSignificantStatus(callServiceStatuses);
        }
      }
      return USSService.decorateWithStatus(mostSignificantStatus === undefined || mostSignificantStatus.status === undefined ? status : mostSignificantStatus.status);
    };

    function getMostSignificantStatus(statuses) {
      return _.maxBy(statuses, function (s) {
        if (s && s.status) {
          return getStatusSeverity(USSService.decorateWithStatus(s.status));
        }
      });
    }

    function getStatusSeverity(status) {
      switch (status) {
        case 'not_entitled':
          return 0;
        case 'activated':
          return 1;
        case 'pending_activation':
          return 2;
        case 'error':
          return 3;
        default:
          return -1;
      }
    }

    vm.extensionIcon = function (id) {
      return HybridServicesUtils.serviceId2Icon(id);
    };

    if (extensionEntitlements.every(
        function (extensionEntitlement) {
          return !Authinfo.isEntitled(extensionEntitlement);
        })) {
      return;
    }

    vm.editService = function (service) {
      if (vm.eservice) {
        vm.eservice(service);
      }
    };

    var enforceLicenseCheck = vm.isUser && _.size(Authinfo.getLicenses()) > 0;
    checkEntitlements(enforceLicenseCheck);

    function checkEntitlements(enforceLicenseCheck) {
      if (enforceLicenseCheck && !hasCaaSLicense()) {
        return;
      }
      // Filter out extensions that are not enabled in FMS
      ServiceDescriptor.getServices().then(function (services) {
        if (services) {
          _.forEach(vm.extensions, function (extension) {
            extension.enabled = ServiceDescriptor.filterEnabledServices(services).some(function (service) {
              return extension.id === service.id && extension.id !== 'squared-fusion-gcal';
            });
            extension.isSetup = extension.enabled;

            // Can't have huron (ciscouc) and call service at the same time
            if (extension.id === 'squared-fusion-uc' && hasEntitlement('ciscouc')) {
              extension.enabled = false;
            }
            if (extension.enabled) {
              vm.isEnabled = true;
            }
          });
          var calServiceExchange = getExtension('squared-fusion-cal') || {};
          var calServiceGoogle = getExtension('squared-fusion-gcal');
          if (calServiceGoogle && vm.atlasHerculesGoogleCalendarFeatureToggle) {
            CloudConnectorService.getService('squared-fusion-gcal')
              .then(function (service) {
                var isSetup = service.setup;
                calServiceGoogle.isSetup = isSetup;
                var ignoreGoogle = calServiceExchange.enabled && !calServiceExchange.entitled && !calServiceGoogle.entitled;
                if (isSetup && (!calServiceExchange.enabled || !calServiceExchange.entitled) && !ignoreGoogle) {
                  calServiceGoogle.enabled = true;
                  vm.isEnabled = true;
                  calServiceExchange.enabled = false;
                  if (!delayedUpdateTimer) {
                    updateStatusForUser();
                  }
                }
              }).catch(function (error) {
                Notification.errorWithTrackingId(error, 'hercules.settings.googleCalendar.couldNotReadGoogleCalendarStatus');
              });
          }
          if (vm.isEnabled) {
            // Only poll for statuses if there are enabled extensions
            updateStatusForUser();
          }
        }
      });
    }

    // Periodically update the user statuses from USS
    function updateStatusForUser() {
      if (!_.isUndefined(vm.user)) {
        USSService.getStatusesForUser(vm.user.id || vm.user.cisUuid)
          .then(function (userStatuses) {
            _.forEach(vm.extensions, function (extension) {
              extension.status = _.find(userStatuses, function (status) {
                return extension.id === status.serviceId;
              });
              if (extension.status && extension.status.messages && extension.status.state !== 'error') {
                extension.status.hasWarnings = _.some(extension.status.messages, function (message) {
                  return message.severity === 'warning';
                });
              }
            });
            delayedUpdateStatusForUser();
          }).catch(function (response) {
            Notification.errorWithTrackingId(response, 'hercules.userSidepanel.readUserStatusFailed');
          }).finally(function () {
            vm.userStatusLoaded = true;
          });
      }
    }

    function delayedUpdateStatusForUser() {
      if (stopDelayedUpdates) {
        return;
      }
      delayedUpdateTimer = $timeout(function () {
        updateStatusForUser();
      }, 10000);
    }

    function hasEntitlement(entitlement) {
      if (_.isUndefined(vm.user)) {
        return false;
      }
      return vm.user.entitlements && vm.user.entitlements.indexOf(entitlement) > -1;
    }

    function getExtensions() {
      return _.compact(_.map(extensionEntitlements, function (extensionEntitlement) {
        if (Authinfo.isEntitled(extensionEntitlement)) {
          return {
            id: extensionEntitlement,
            entitled: hasEntitlement(extensionEntitlement),
          };
        }
      }));
    }

    function getExtension(id) {
      return _.find(vm.extensions, function (extension) {
        return extension.id === id;
      });
    }

    function getCallExtensions() {
      return _.map(vm.extensions, function (extensionEntitlement) {
        if (_.includes(extensionCallEntitlements, extensionEntitlement.id)) {
          return {
            status: extensionEntitlement.status,
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

    var cancelStateChangeListener = $rootScope.$on('$stateChangeSuccess', function () {
      stopDelayedUpdates = true;
      if (delayedUpdateTimer) {
        $timeout.cancel(delayedUpdateTimer);
      }
    });

    $scope.$on('$destroy', function () {
      cancelStateChangeListener();
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
        user: '=',
        eservice: '=',
      },
      templateUrl: 'modules/hercules/user-sidepanel/hybridServices.tpl.html',
    };
  }
}());
