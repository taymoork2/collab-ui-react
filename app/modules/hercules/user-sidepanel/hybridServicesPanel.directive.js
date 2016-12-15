(function () {
  'use strict';

  angular
    .module('Hercules')
    .directive('hybridServicesPanel', hybridServicesPanel)
    .controller('hybridServicesPanelCtrl', hybridServicesPanelCtrl);

  /* @ngInject */
  function hybridServicesPanelCtrl(OnboardService, ServiceDescriptor, CloudConnectorService, Authinfo, $q, FeatureToggleService, $translate) {
    var vm = this;
    vm.isEnabled = false;
    vm.entitlements = [];
    vm.hasGoogleCalendarFeature = false;
    vm.services = {
      calendarEntitled: false,
      selectedCalendarType: null,
      calendarExchange: null,
      calendarGoogle: null,
      callServiceAware: null,
      callServiceConnect: null,
      notSetupText: $translate.instant('hercules.cloudExtensions.notSetup'),
      hasCalendarService: function () {
        return this.calendarExchange !== null || this.calendarGoogle !== null;
      },
      hasCallService: function () {
        return this.callServiceAware !== null;
      },
      setSelectedCalendarEntitlement: function () {
        if (this.calendarEntitled) {
          var selectedCalendarService;
          var previousCalendarService;
          if (!this.selectedCalendarType) {
            // Set one of them entitled (preferring Exchange over Google) if none selected yet
            selectedCalendarService = this.calendarExchange || this.calendarGoogle;
            this.selectedCalendarType = selectedCalendarService.id;
          } else {
            if (this.selectedCalendarType === 'squared-fusion-cal') {
              selectedCalendarService = this.calendarExchange;
              previousCalendarService = this.calendarGoogle;
            } else {
              selectedCalendarService = this.calendarGoogle;
              previousCalendarService = this.calendarExchange;
            }
          }
          selectedCalendarService.entitled = true;
          if (previousCalendarService) {
            previousCalendarService.entitled = false;
          }
        }
      }
    };
    vm.setEntitlements = setEntitlements;
    vm.hasHuronCallEntitlement = hasHuronCallEntitlement;

    if (Authinfo.isEntitled('squared-fusion-gcal')) {
      FeatureToggleService.supports(FeatureToggleService.features.atlasHerculesGoogleCalendar)
        .then(function (hasGoogleCalendarFeatureToggle) {
          vm.hasGoogleCalendarFeature = hasGoogleCalendarFeatureToggle;
          init();
        });
    } else {
      init();
    }

    ////////////////

    function init() {
      $q.all({
        servicesFromFms: ServiceDescriptor.getServices(),
        gcalService: vm.hasGoogleCalendarFeature ? CloudConnectorService.getService('squared-fusion-gcal') : $q.resolve({})
      }).then(function (response) {
        vm.services.calendarExchange = getServiceIfEnabled(response.servicesFromFms, 'squared-fusion-cal');
        vm.services.callServiceAware = getServiceIfEnabled(response.servicesFromFms, 'squared-fusion-uc');
        vm.services.callServiceConnect = getServiceIfEnabled(response.servicesFromFms, 'squared-fusion-ec');
        vm.services.calendarGoogle = (response.gcalService && response.gcalService.setup) ? response.gcalService : null;
        vm.isEnabled = vm.services.hasCalendarService() || vm.services.hasCallService();
      });
    }

    function setEntitlements() {
      // US8209 says to only add entitlements, not remove them. Allowing INACTIVE would remove entitlement when users are patched.
      vm.entitlements = [];
      if (vm.services.calendarEntitled) {
        vm.services.setSelectedCalendarEntitlement();
        if (vm.services.calendarExchange && vm.services.calendarExchange.entitled) {
          vm.entitlements.push({ entitlementState: 'ACTIVE', entitlementName: 'squaredFusionCal' });
        } else if (vm.services.calendarGoogle && vm.services.calendarGoogle.entitled) {
          vm.entitlements.push({ entitlementState: 'ACTIVE', entitlementName: 'squaredFusionGCal' });
        }
      } else {
        vm.services.selectedCalendarType = null;
      }
      if (!hasHuronCallEntitlement() && vm.services.callServiceAware && vm.services.callServiceAware.entitled) {
        vm.entitlements.push({ entitlementState: 'ACTIVE', entitlementName: 'squaredFusionUC' });
        if (vm.services.callServiceConnect && vm.services.callServiceConnect.entitled) {
          vm.entitlements.push({ entitlementState: 'ACTIVE', entitlementName: 'squaredFusionEC' });
        }
      } else {
        if (vm.services.callServiceAware) {
          vm.services.callServiceAware.entitled = false;
        }
        if (vm.services.callServiceConnect) {
          vm.services.callServiceConnect.entitled = false;
        }
      }
      if (!_.isUndefined(vm.updateEntitlements)) {
        vm.updateEntitlements({
          'entitlements': vm.entitlements
        });
      }
    }

    function getServiceIfEnabled(services, id) {
      var service = _.find(services, {
        'id': id,
        'enabled': true
      });
      if (service) {
        service.entitled = false;
        return service;
      } else {
        return null;
      }
    }

    function hasHuronCallEntitlement() {
      return OnboardService.huronCallEntitlement;
    }
  }

  /* @ngInject */
  function hybridServicesPanel() {
    return {
      restrict: 'E',
      scope: {
        'updateEntitlements': '&bindEntitlements'
      },
      bindToController: true,
      controllerAs: 'hybridServicesPanelCtrl',
      controller: 'hybridServicesPanelCtrl',
      templateUrl: 'modules/hercules/user-sidepanel/hybridServicesPanel.tpl.html'
    };
  }
})();
