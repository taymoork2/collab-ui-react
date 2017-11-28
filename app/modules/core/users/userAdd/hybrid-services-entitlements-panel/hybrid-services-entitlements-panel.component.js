(function () {
  'use strict';

  module.exports = {
    hybridServicesEntitlementsPanelCtrl: hybridServicesEntitlementsPanelCtrl,
  };

  /* @ngInject */
  function hybridServicesEntitlementsPanelCtrl($q, $translate, Authinfo, CloudConnectorService, FeatureToggleService, OnboardService, ServiceDescriptorService) {
    var vm = this;
    vm.isEnabled = false;
    vm.entitlements = [];
    vm.showCalendarChoice = Authinfo.isFusionGoogleCal();
    vm.services = {
      calendarEntitled: false,
      selectedCalendarType: null,
      hybridMessage: null,
      calendarExchange: null,
      calendarGoogle: null,
      callServiceAware: null,
      callServiceConnect: null,
      notSetupText: $translate.instant('hercules.cloudExtensions.notSetup'),
      hasHybridMessageService: function () {
        return this.hybridMessage !== null;
      },
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
      },
    };
    vm.setEntitlements = setEntitlements;
    vm.hasHuronCallEntitlement = hasHuronCallEntitlement;
    vm.$onInit = $onInit;
    vm.$onChanges = $onChanges;

    function $onInit() {
      $q.all({
        servicesFromFms: ServiceDescriptorService.getServices(),
        gcalService: CloudConnectorService.getService('squared-fusion-gcal'),
        hasHybridMessageFeatureToggle: FeatureToggleService.supports(FeatureToggleService.features.atlasHybridImp),
      }).then(function (response) {
        vm.services.calendarExchange = getServiceIfEnabled(response.servicesFromFms, 'squared-fusion-cal');
        vm.services.callServiceAware = getServiceIfEnabled(response.servicesFromFms, 'squared-fusion-uc');
        vm.services.callServiceConnect = getServiceIfEnabled(response.servicesFromFms, 'squared-fusion-ec');
        vm.services.calendarGoogle = (response.gcalService && response.gcalService.setup) ? response.gcalService : null;
        if (response.hasHybridMessageFeatureToggle) {
          vm.services.hybridMessage = getServiceIfEnabled(response.servicesFromFms, 'spark-hybrid-impinterop');
        }
        vm.isEnabled = vm.services.hasCalendarService() || vm.services.hasCallService() || vm.services.hasHybridMessageService();
      });
    }

    function $onChanges(changes) {
      if (changes.userIsLicensed && !changes.userIsLicensed.currentValue && changes.userIsLicensed.previousValue) {
        clearSelectedHybridServicesEntitlements();
      }
    }

    function setEntitlements() {
      // US8209 says to only add entitlements, not remove them. Allowing INACTIVE would remove entitlement when users are patched.
      vm.entitlements = [];
      if (vm.services.calendarEntitled) {
        vm.services.setSelectedCalendarEntitlement();
        if (_.get(vm.services, 'calendarExchange.entitled')) {
          vm.entitlements.push({ entitlementState: 'ACTIVE', entitlementName: 'squaredFusionCal' });
        } else if (_.get(vm.services, 'calendarGoogle.entitled')) {
          vm.entitlements.push({ entitlementState: 'ACTIVE', entitlementName: 'squaredFusionGCal' });
        }
      } else {
        vm.services.selectedCalendarType = null;
      }
      if (!hasHuronCallEntitlement() && _.get(vm.services, 'callServiceAware.entitled')) {
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
      if (_.get(vm.services, 'hybridMessage.entitled')) {
        vm.entitlements.push({ entitlementState: 'ACTIVE', entitlementName: 'sparkHybridImpInterop' });
      }
      if (!_.isUndefined(vm.entitlementsCallback)) {
        vm.entitlementsCallback({
          entitlements: vm.entitlements,
        });
      }
    }

    function getServiceIfEnabled(services, id) {
      var service = _.find(services, {
        id: id,
        enabled: true,
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

    function clearSelectedHybridServicesEntitlements() {
      vm.services.calendarEntitled = false;
      if (vm.services.callServiceAware) {
        vm.services.callServiceAware.entitled = false;
      }
      if (vm.services.callServiceConnect) {
        vm.services.callServiceConnect.entitled = false;
      }
      if (vm.services.hybridMessage) {
        vm.services.hybridMessage.entitled = false;
      }
      setEntitlements();
    }
  }
})();
