import moduleName from './index';

describe('Directive Controller: hybridServicesPanelCtrl', function () {
  beforeEach(function () {
    this.initModules(moduleName);
    this.injectDependencies(
      '$q',
      '$scope',
      'Authinfo',
      'CloudConnectorService',
      'FeatureToggleService',
      'ServiceDescriptorService',
      'OnboardService',
    );

    this.OnboardService.huronCallEntitlement = false;

    spyOn(this.CloudConnectorService, 'getService').and.returnValue(this.$q.resolve({ setup: false }));
    spyOn(this.Authinfo, 'isEntitled').and.returnValue(false);
    spyOn(this.ServiceDescriptorService, 'getServices').and.returnValue(this.$q.resolve([]));
    spyOn(this.FeatureToggleService, 'supports').and.returnValue(this.$q.resolve(false));
  });

  function initMockServices(enabledServiceIds, disabledServiceIds) {
    const servicesResponse: Object[] = [];
    _.forEach(enabledServiceIds, function (serviceId) {
      servicesResponse.push({ id: serviceId, enabled: true });
    });
    _.forEach(disabledServiceIds, function (serviceId) {
      servicesResponse.push({ id: serviceId, enabled: false });
    });
    this.ServiceDescriptorService.getServices.and.returnValue(this.$q.resolve(servicesResponse));
    if (_.includes(enabledServiceIds, 'squared-fusion-gcal' || _.includes(disabledServiceIds, 'squared-fusion-gcal'))) {
      this.CloudConnectorService.getService.and.returnValue(this.$q.resolve({ setup: _.includes(enabledServiceIds, 'squared-fusion-gcal') }));
      this.Authinfo.isEntitled.and.returnValue(true);
    }
  }

  function expectEntitlementActive(entitlements, name) {
    // TODO: better TS type for arg
    expect(_.some(entitlements, function (entitlement: any) {
      return entitlement.entitlementName === name && entitlement.entitlementState === 'ACTIVE';
    })).toBeTruthy();
  }

  it('should init as expected with no Hybrid Services enabled', function () {
    this.compileComponent('hybridServicesEntitlementsPanel');
    expect(this.controller.isEnabled).toBeFalsy();
    expect(this.controller.services.calendarEntitled).toBeFalsy();
    expect(this.controller.services.calendarExchange).toBeNull();
    expect(this.controller.services.calendarGoogle).toBeNull();
    expect(this.controller.services.callServiceAware).toBeNull();
    expect(this.controller.services.callServiceConnect).toBeNull();
    expect(this.controller.services.hasCalendarService()).toBeFalsy();
    expect(this.controller.services.hasCallService()).toBeFalsy();
  });

  it('should behave as expected with only squared-fusion-cal enabled', function () {
    initMockServices.call(this, ['squared-fusion-cal'], ['squared-fusion-uc']);
    this.compileComponent('hybridServicesEntitlementsPanel');
    expect(this.controller.isEnabled).toBeTruthy();
    expect(this.controller.services.calendarEntitled).toBeFalsy();
    expect(this.controller.services.calendarExchange.enabled).toBeTruthy();
    expect(this.controller.services.calendarExchange.entitled).toBeFalsy();
    expect(this.controller.services.calendarGoogle).toBeNull();
    expect(this.controller.services.callServiceAware).toBeNull();
    expect(this.controller.services.callServiceConnect).toBeNull();
    expect(this.controller.services.hasCalendarService()).toBeTruthy();
    expect(this.controller.services.hasCallService()).toBeFalsy();

    // "Check" the calendar entitlement box
    this.controller.services.calendarEntitled = true;
    this.controller.setEntitlements();
    this.$scope.$apply();
    expect(this.controller.services.calendarExchange.entitled).toBeTruthy();
    expect(this.controller.entitlements.length).toBe(1);
    expectEntitlementActive(this.controller.entitlements, 'squaredFusionCal');
  });

  it('should behave as expected with both exchange calendar and call entitlements enabled', function () {
    initMockServices.call(this, ['squared-fusion-cal', 'squared-fusion-uc', 'squared-fusion-ec'], []);
    this.compileComponent('hybridServicesEntitlementsPanel');
    expect(this.controller.isEnabled).toBeTruthy();
    expect(this.controller.services.calendarExchange.enabled).toBeTruthy();
    expect(this.controller.services.calendarExchange.entitled).toBeFalsy();
    expect(this.controller.services.calendarGoogle).toBeNull();
    expect(this.controller.services.callServiceAware.enabled).toBeTruthy();
    expect(this.controller.services.callServiceAware.entitled).toBeFalsy();
    expect(this.controller.services.callServiceConnect.enabled).toBeTruthy();
    expect(this.controller.services.callServiceConnect.entitled).toBeFalsy();
    expect(this.controller.services.hasCalendarService()).toBeTruthy();
    expect(this.controller.services.hasCallService()).toBeTruthy();

    // "Check" only the calendar entitlement box first
    this.controller.services.calendarEntitled = true;
    this.controller.setEntitlements();
    this.$scope.$apply();
    expect(this.controller.services.calendarExchange.entitled).toBeTruthy();
    expect(this.controller.entitlements.length).toBe(1);
    expectEntitlementActive(this.controller.entitlements, 'squaredFusionCal');

    // "Check" the call boxes too
    this.controller.services.callServiceAware.entitled = true;
    this.controller.services.callServiceConnect.entitled = true;
    this.controller.setEntitlements();
    this.$scope.$apply();
    expect(this.controller.services.calendarExchange.entitled).toBeTruthy();
    expect(this.controller.entitlements.length).toBe(3);
    expectEntitlementActive(this.controller.entitlements, 'squaredFusionCal');
    expectEntitlementActive(this.controller.entitlements, 'squaredFusionUC');
    expectEntitlementActive(this.controller.entitlements, 'squaredFusionEC');
  });

  it('should behave as expected with google calendar entitled, but disabled', function () {
    initMockServices.call(this, ['squared-fusion-cal'], ['squared-fusion-gcal']);
    this.compileComponent('hybridServicesEntitlementsPanel');
    expect(this.controller.isEnabled).toBeTruthy();
    expect(this.controller.services.calendarExchange.enabled).toBeTruthy();
    expect(this.controller.services.calendarExchange.entitled).toBeFalsy();
    expect(this.controller.services.calendarGoogle).toBeNull();
    expect(this.controller.services.hasCalendarService()).toBeTruthy();

    // "Check" only the calendar entitlement box first
    this.controller.services.calendarEntitled = true;
    this.controller.setEntitlements();
    this.$scope.$apply();
    expect(this.controller.services.calendarExchange.entitled).toBeTruthy();
    expect(this.controller.entitlements.length).toBe(1);
    expectEntitlementActive(this.controller.entitlements, 'squaredFusionCal');
  });

  it('should behave as expected with the whole lot enabled', function () {
    initMockServices.call(this, ['squared-fusion-cal', 'squared-fusion-gcal', 'squared-fusion-uc', 'squared-fusion-ec'], []);
    this.compileComponent('hybridServicesEntitlementsPanel');
    expect(this.controller.isEnabled).toBeTruthy();
    expect(this.controller.services.calendarExchange.enabled).toBeTruthy();
    expect(this.controller.services.calendarExchange.entitled).toBeFalsy();
    expect(this.controller.services.calendarGoogle.setup).toBeTruthy();
    expect(this.controller.services.calendarGoogle.entitled).toBeFalsy();
    expect(this.controller.services.callServiceAware.enabled).toBeTruthy();
    expect(this.controller.services.callServiceAware.entitled).toBeFalsy();
    expect(this.controller.services.callServiceConnect.enabled).toBeTruthy();
    expect(this.controller.services.callServiceConnect.entitled).toBeFalsy();
    expect(this.controller.services.hasCalendarService()).toBeTruthy();
    expect(this.controller.services.hasCallService()).toBeTruthy();

    // "Check" the calendar entitlement box first
    this.controller.services.calendarEntitled = true;
    this.controller.setEntitlements();
    this.$scope.$apply();
    expect(this.controller.services.selectedCalendarType).toBe('squared-fusion-cal');
    expect(this.controller.services.calendarExchange.entitled).toBeTruthy();
    expect(this.controller.services.calendarGoogle.entitled).toBeFalsy();
    expect(this.controller.entitlements.length).toBe(1);
    expectEntitlementActive(this.controller.entitlements, 'squaredFusionCal');

    // Change to google instead of exchange (the radio buttons)
    this.controller.services.selectedCalendarType = 'squared-fusion-gcal';
    this.controller.setEntitlements();
    this.$scope.$apply();
    expect(this.controller.services.selectedCalendarType).toBe('squared-fusion-gcal');
    expect(this.controller.services.calendarExchange.entitled).toBeFalsy();
    expect(this.controller.services.calendarGoogle.entitled).toBeTruthy();
    expect(this.controller.entitlements.length).toBe(1);
    expectEntitlementActive(this.controller.entitlements, 'squaredFusionGCal');

    // Change back to exchange (the radio buttons)
    this.controller.services.selectedCalendarType = 'squared-fusion-cal';
    this.controller.setEntitlements();
    this.$scope.$apply();
    expect(this.controller.services.selectedCalendarType).toBe('squared-fusion-cal');
    expect(this.controller.services.calendarExchange.entitled).toBeTruthy();
    expect(this.controller.services.calendarGoogle.entitled).toBeFalsy();
    expect(this.controller.entitlements.length).toBe(1);
    expectEntitlementActive(this.controller.entitlements, 'squaredFusionCal');
  });

  it('should not add hybrid call services if huron is enabled', function () {
    this.OnboardService.huronCallEntitlement = true;
    initMockServices.call(this, ['squared-fusion-uc', 'squared-fusion-ec'], []);
    this.compileComponent('hybridServicesEntitlementsPanel');
    expect(this.controller.isEnabled).toBeTruthy();
    expect(this.controller.services.callServiceAware.enabled).toBeTruthy();
    expect(this.controller.services.callServiceAware.entitled).toBeFalsy();
    expect(this.controller.services.callServiceConnect.enabled).toBeTruthy();
    expect(this.controller.services.callServiceConnect.entitled).toBeFalsy();
    expect(this.controller.services.hasCallService()).toBeTruthy();

    this.controller.services.callServiceAware.entitled = true;
    this.controller.services.callServiceConnect.entitled = true;
    this.controller.setEntitlements();
    this.$scope.$apply();
    expect(this.controller.services.callServiceAware.entitled).toBeFalsy();
    expect(this.controller.services.callServiceConnect.entitled).toBeFalsy();
    expect(this.controller.entitlements.length).toBe(0);
  });

  it('should not show any hybrid message info if the org is not feature toggled', function () {
    this.FeatureToggleService.supports.and.returnValue(this.$q.resolve(false));
    initMockServices.call(this, ['spark-hybrid-impinterop'], []);
    this.compileComponent('hybridServicesEntitlementsPanel');
    expect(this.controller.services.hybridMessage).toBe(null);
  });

  it('should show hybrid message info if the org is feature toggled', function () {
    this.FeatureToggleService.supports.and.returnValue(this.$q.resolve(true));
    initMockServices.call(this, ['spark-hybrid-impinterop'], []);
    this.compileComponent('hybridServicesEntitlementsPanel');
    expect(this.controller.services.hasHybridMessageService()).toBe(true);
    expect(this.controller.services.hybridMessage.enabled).toBe(true);
  });

  it('should use the callback with an empty entitlement list when a user no longer has a paid license', function () {
    initMockServices.call(this, ['squared-fusion-uc', 'squared-fusion-ec'], []);
    this.compileComponent('hybridServicesEntitlementsPanel');
    this.controller.entitlementsCallback = jasmine.createSpy('entitlementsCallback');
    this.controller.$onChanges({
      hasAssignableLicenses: {
        previousValue: true,
        currentValue: false,
        isFirstChange: function () {
          return false;
        },
      },
    });

    expect(this.controller.entitlementsCallback).toHaveBeenCalledWith({
      entitlements: [],
    });
    expect(this.controller.entitlementsCallback.calls.count()).toBe(1);
  });
});
