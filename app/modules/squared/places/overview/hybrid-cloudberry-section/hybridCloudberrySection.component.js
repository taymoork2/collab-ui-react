(function () {
  'use strict';

  module.exports = {
    bindings: {
      place: '=',
      eservice: '=',
    },
    controller: HybridCloudberrySectionCtrl,
    template: require('./hybridCloudberrySection.component.html'),
  };

  /* @ngInject */
  function HybridCloudberrySectionCtrl($timeout, Authinfo, USSService, HybridServicesUtilsService, HybridServiceUserSidepanelHelperService, ServiceDescriptorService, Notification, CloudConnectorService) {
    if (!Authinfo.isFusion()) {
      return;
    }
    var vm = this;

    var hybridServiceIds = ['squared-fusion-cal', 'squared-fusion-gcal', 'squared-fusion-uc'];
    var stopDelayedUpdates = false;
    var delayedUpdateTimer = null;
    vm.hybridServices = getHybridServices();
    vm.isAnyServicesEnabled = false;
    vm.placeStatusLoaded = false;

    vm.placeFilter = function (item) {
      return item && item.enabled === true && item.entitled === true;
    };

    vm.getStatus = function (status) {
      return USSService.decorateWithStatus(status);
    };

    vm.serviceIcon = function (id) {
      return HybridServicesUtilsService.serviceId2Icon(id);
    };

    if (hybridServiceIds.every(
      function (hybridServiceId) {
        return !Authinfo.isEntitled(hybridServiceId);
      })) {
      return;
    }

    vm.editService = function (service) {
      if (vm.eservice) {
        vm.eservice(service);
      }
    };

    vm.$onInit = function () {
      // Filter out services that are not enabled in FMS
      ServiceDescriptorService.getServices().then(function (services) {
        if (services) {
          _.forEach(vm.hybridServices, function (hybridService) {
            hybridService.enabled = ServiceDescriptorService.filterEnabledServices(services).some(function (service) {
              return hybridService.id === service.id && hybridService.id !== 'squared-fusion-gcal';
            });
            hybridService.isSetup = hybridService.enabled;

            if (hybridService.enabled) {
              vm.isAnyServicesEnabled = true;
            }
          });
          var calServiceExchange = getHybridService('squared-fusion-cal') || {};
          var calServiceGoogle = getHybridService('squared-fusion-gcal');
          if (calServiceGoogle) {
            CloudConnectorService.getService('squared-fusion-gcal')
              .then(function (service) {
                var isSetup = service.setup;
                calServiceGoogle.isSetup = isSetup;
                var ignoreGoogle = calServiceExchange.enabled && !calServiceExchange.entitled && !calServiceGoogle.entitled;
                if (isSetup && (!calServiceExchange.enabled || !calServiceExchange.entitled) && !ignoreGoogle) {
                  calServiceGoogle.enabled = true;
                  vm.isAnyServicesEnabled = true;
                  calServiceExchange.enabled = false;
                  if (!delayedUpdateTimer) {
                    updateStatusForPlace();
                  }
                }
              });
          }
          if (vm.isAnyServicesEnabled) {
            // Only poll for statuses if there are enabled services
            updateStatusForPlace();
          }
        }
      });
    };

    // Periodically update the place statuses from USS
    function updateStatusForPlace() {
      if (!_.isUndefined(vm.place())) {
        USSService.getStatusesForUser(vm.place().cisUuid)
          .then(function (placeStatuses) {
            _.forEach(vm.hybridServices, function (hybridService) {
              hybridService.status = _.find(placeStatuses, function (status) {
                return hybridService.id === status.serviceId;
              });
              if (hybridService.status && hybridService.status.messages && hybridService.status.state !== 'error') {
                hybridService.status.hasWarnings = _.some(hybridService.status.messages, function (message) {
                  return message.severity === 'warning';
                });
              }
            });
            delayedUpdateStatusForPlace();
          })
          .catch(function (error) {
            if (HybridServiceUserSidepanelHelperService.isPartnerAdminAndGot403Forbidden(error)) {
              Notification.errorWithTrackingId(error, {
                errorKey: 'hercules.userSidepanel.errorMessages.cannotReadDeviceDataFromUSSPartnerAdmin',
                feedbackInstructions: true,
              });
            } else {
              Notification.errorWithTrackingId(error, 'hercules.userSidepanel.errorMessages.cannotReadDeviceDataFromUSS');
            }
          })
          .finally(function () {
            vm.placeStatusLoaded = true;
          });
      }
    }

    function delayedUpdateStatusForPlace() {
      if (stopDelayedUpdates) {
        return;
      }
      delayedUpdateTimer = $timeout(function () {
        updateStatusForPlace();
      }, 10000);
    }

    function hasEntitlement(entitlement) {
      return vm.place().entitlements && vm.place().entitlements.indexOf(entitlement) > -1;
    }

    function getHybridServices() {
      return _.compact(_.map(hybridServiceIds, function (hybridServiceId) {
        if (Authinfo.isEntitled(hybridServiceId)) {
          return {
            id: hybridServiceId,
            entitled: hasEntitlement(hybridServiceId),
          };
        }
      }));
    }

    function getHybridService(id) {
      return _.find(vm.hybridServices, function (hybridService) {
        return hybridService.id === id;
      });
    }

    this.$onDestroy = function () {
      stopDelayedUpdates = true;
      if (delayedUpdateTimer) {
        $timeout.cancel(delayedUpdateTimer);
      }
    };
  }
}());
