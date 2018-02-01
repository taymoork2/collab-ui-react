import moduleName from './index';
import { IEntitlementNameAndState } from 'modules/hercules/services/hybrid-services-user-sidepanel-helper.service';
import { CCCService } from 'modules/hercules/services/calendar-cloud-connector.service';

describe('Component Controller: hybridServicesPanelCtrl', function () {
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
    expect(_.some(entitlements, function (entitlement: IEntitlementNameAndState) {
      return entitlement.entitlementName === name && entitlement.entitlementState === 'ACTIVE';
    })).toBeTruthy();
  }

  it('should init as expected with no Hybrid Services enabled', function () {
    this.compileComponent('hybridServicesEntitlementsPanel');
    expect(this.controller.isEnabled).toBe(false);
    expect(this.controller.services.calendarEntitled).toBe(false);
    expect(this.controller.services.calendarExchangeOrOffice365).toBeNull();
    expect(this.controller.services.calendarGoogle).toBeNull();
    expect(this.controller.services.callServiceAware).toBeNull();
    expect(this.controller.services.callServiceConnect).toBeNull();
    expect(this.controller.services.hasCalendarService()).toBe(false);
    expect(this.controller.services.hasCallService()).toBe(false);
  });

  it('should behave as expected with only squared-fusion-cal enabled', function () {
    initMockServices.call(this, ['squared-fusion-cal'], ['squared-fusion-uc']);
    this.compileComponent('hybridServicesEntitlementsPanel');
    expect(this.controller.isEnabled).toBe(true);
    expect(this.controller.services.calendarEntitled).toBe(false);
    expect(this.controller.services.calendarExchangeOrOffice365.enabled).toBe(true);
    expect(this.controller.services.calendarExchangeOrOffice365.entitled).toBe(false);
    expect(this.controller.services.calendarGoogle).toBeNull();
    expect(this.controller.services.callServiceAware).toBeNull();
    expect(this.controller.services.callServiceConnect).toBeNull();
    expect(this.controller.services.hasCalendarService()).toBe(true);
    expect(this.controller.services.hasCallService()).toBe(false);

    // "Check" the calendar entitlement box
    this.controller.services.calendarEntitled = true;
    this.controller.setEntitlements();
    this.$scope.$apply();
    expect(this.controller.services.calendarExchangeOrOffice365.entitled).toBe(true);
    expect(this.controller.entitlements.length).toBe(1);
    expectEntitlementActive(this.controller.entitlements, 'squaredFusionCal');
  });

  it('should behave as expected with both exchange calendar and call entitlements enabled', function () {
    initMockServices.call(this, ['squared-fusion-cal', 'squared-fusion-uc', 'squared-fusion-ec'], []);
    this.compileComponent('hybridServicesEntitlementsPanel');
    expect(this.controller.isEnabled).toBe(true);
    expect(this.controller.services.calendarExchangeOrOffice365.enabled).toBe(true);
    expect(this.controller.services.calendarExchangeOrOffice365.entitled).toBe(false);
    expect(this.controller.services.calendarGoogle).toBeNull();
    expect(this.controller.services.callServiceAware.enabled).toBe(true);
    expect(this.controller.services.callServiceAware.entitled).toBe(false);
    expect(this.controller.services.callServiceConnect.enabled).toBe(true);
    expect(this.controller.services.callServiceConnect.entitled).toBe(false);
    expect(this.controller.services.hasCalendarService()).toBe(true);
    expect(this.controller.services.hasCallService()).toBe(true);

    // "Check" only the calendar entitlement box first
    this.controller.services.calendarEntitled = true;
    this.controller.setEntitlements();
    this.$scope.$apply();
    expect(this.controller.services.calendarExchangeOrOffice365.entitled).toBe(true);
    expect(this.controller.entitlements.length).toBe(1);
    expectEntitlementActive(this.controller.entitlements, 'squaredFusionCal');

    // "Check" the call boxes too
    this.controller.services.callServiceAware.entitled = true;
    this.controller.services.callServiceConnect.entitled = true;
    this.controller.setEntitlements();
    this.$scope.$apply();
    expect(this.controller.services.calendarExchangeOrOffice365.entitled).toBe(true);
    expect(this.controller.entitlements.length).toBe(3);
    expectEntitlementActive(this.controller.entitlements, 'squaredFusionCal');
    expectEntitlementActive(this.controller.entitlements, 'squaredFusionUC');
    expectEntitlementActive(this.controller.entitlements, 'squaredFusionEC');
  });

  it('should behave as expected with google calendar entitled, but disabled', function () {
    initMockServices.call(this, ['squared-fusion-cal'], ['squared-fusion-gcal']);
    this.compileComponent('hybridServicesEntitlementsPanel');
    expect(this.controller.isEnabled).toBe(true);
    expect(this.controller.services.calendarExchangeOrOffice365.enabled).toBe(true);
    expect(this.controller.services.calendarExchangeOrOffice365.entitled).toBe(false);
    expect(this.controller.services.calendarGoogle).toBeNull();
    expect(this.controller.services.hasCalendarService()).toBe(true);

    // "Check" only the calendar entitlement box first
    this.controller.services.calendarEntitled = true;
    this.controller.setEntitlements();
    this.$scope.$apply();
    expect(this.controller.services.calendarExchangeOrOffice365.entitled).toBe(true);
    expect(this.controller.entitlements.length).toBe(1);
    expectEntitlementActive(this.controller.entitlements, 'squaredFusionCal');
  });

  it('should behave as expected with the whole lot enabled', function () {
    initMockServices.call(this, ['squared-fusion-cal', 'squared-fusion-gcal', 'squared-fusion-uc', 'squared-fusion-ec'], []);
    this.compileComponent('hybridServicesEntitlementsPanel');
    expect(this.controller.isEnabled).toBe(true);
    expect(this.controller.services.calendarExchangeOrOffice365.enabled).toBe(true);
    expect(this.controller.services.calendarExchangeOrOffice365.entitled).toBe(false);
    expect(this.controller.services.calendarGoogle.enabled).toBe(true);
    expect(this.controller.services.calendarGoogle.entitled).toBe(false);
    expect(this.controller.services.callServiceAware.enabled).toBe(true);
    expect(this.controller.services.callServiceAware.entitled).toBe(false);
    expect(this.controller.services.callServiceConnect.enabled).toBe(true);
    expect(this.controller.services.callServiceConnect.entitled).toBe(false);
    expect(this.controller.services.hasCalendarService()).toBe(true);
    expect(this.controller.services.hasCallService()).toBe(true);

    // "Check" the calendar entitlement box first
    this.controller.services.calendarEntitled = true;
    this.controller.setEntitlements();
    this.$scope.$apply();
    expect(this.controller.services.selectedCalendarType).toBe('squared-fusion-cal');
    expect(this.controller.services.calendarExchangeOrOffice365.entitled).toBe(true);
    expect(this.controller.services.calendarGoogle.entitled).toBe(false);
    expect(this.controller.entitlements.length).toBe(1);
    expectEntitlementActive(this.controller.entitlements, 'squaredFusionCal');

    // Change to google instead of exchange (the radio buttons)
    this.controller.services.selectedCalendarType = 'squared-fusion-gcal';
    this.controller.setEntitlements();
    this.$scope.$apply();
    expect(this.controller.services.selectedCalendarType).toBe('squared-fusion-gcal');
    expect(this.controller.services.calendarExchangeOrOffice365.entitled).toBe(false);
    expect(this.controller.services.calendarGoogle.entitled).toBe(true);
    expect(this.controller.entitlements.length).toBe(1);
    expectEntitlementActive(this.controller.entitlements, 'squaredFusionGCal');

    // Change back to exchange (the radio buttons)
    this.controller.services.selectedCalendarType = 'squared-fusion-cal';
    this.controller.setEntitlements();
    this.$scope.$apply();
    expect(this.controller.services.selectedCalendarType).toBe('squared-fusion-cal');
    expect(this.controller.services.calendarExchangeOrOffice365.entitled).toBe(true);
    expect(this.controller.services.calendarGoogle.entitled).toBe(false);
    expect(this.controller.entitlements.length).toBe(1);
    expectEntitlementActive(this.controller.entitlements, 'squaredFusionCal');
  });

  it('should not add hybrid call services if huron is enabled', function () {
    this.OnboardService.huronCallEntitlement = true;
    initMockServices.call(this, ['squared-fusion-uc', 'squared-fusion-ec'], []);
    this.compileComponent('hybridServicesEntitlementsPanel');
    expect(this.controller.isEnabled).toBe(true);
    expect(this.controller.services.callServiceAware.enabled).toBe(true);
    expect(this.controller.services.callServiceAware.entitled).toBe(false);
    expect(this.controller.services.callServiceConnect.enabled).toBe(true);
    expect(this.controller.services.callServiceConnect.entitled).toBe(false);
    expect(this.controller.services.hasCallService()).toBe(true);

    this.controller.services.callServiceAware.entitled = true;
    this.controller.services.callServiceConnect.entitled = true;
    this.controller.setEntitlements();
    this.$scope.$apply();
    expect(this.controller.services.callServiceAware.entitled).toBe(false);
    expect(this.controller.services.callServiceConnect.entitled).toBe(false);
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

  it('should initialize a "autoAssignTemplateData" property and populate it with the initialized "services" property', function () {
    initMockServices.call(this, ['squared-fusion-uc'], []);
    this.compileComponent('hybridServicesEntitlementsPanel');
    expect(_.isEmpty(this.controller.autoAssignTemplateData.hybridServices)).toBe(false);
    expect(this.controller.autoAssignTemplateData.hybridServices.callServiceAware).toEqual({
      enabled: true,
      entitled: false,
      id: 'squared-fusion-uc',
    });
  });

  it('should initialize "services" property from "autoAssignTemplateData" if provided', function () {
    initMockServices.call(this, ['squared-fusion-uc'], []);
    this.$scope.fakeAutoAssignTemplateData = {
      hybridServices: {
        callServiceAware: {
          enabled: true,
          entitled: false,
          id: 'squared-fusion-uc',
        },
        hasCalendarService: jasmine.createSpy('hasCalendarService'),
        hasCallService: jasmine.createSpy('hasCallService'),
        hasHybridMessageService: jasmine.createSpy('hasHybridMessageService'),
      },
    };
    this.compileComponent('hybridServicesEntitlementsPanel', {
      autoAssignTemplateData: 'fakeAutoAssignTemplateData',
    });
    expect(this.ServiceDescriptorService.getServices).not.toHaveBeenCalled();
    expect(this.CloudConnectorService.getService).not.toHaveBeenCalled();
    expect(this.controller.autoAssignTemplateData.hybridServices.callServiceAware).toEqual({
      enabled: true,
      entitled: false,
      id: 'squared-fusion-uc',
    });
  });

  it('should initialize "services" properties from "userEntitlementsStateData" if provided', function () {
    initMockServices.call(this, ['squared-fusion-uc'], ['squared-fusion-cal']);
    this.$scope.fakeUserEntitlementsStateData = [{
      entitlementName: 'squaredFusionUC',
      entitlementState: 'ACTIVE',
    }, {
      entitlementName: 'squaredFusionCal',
      entitlementState: 'ACTIVE',
    }];
    this.compileComponent('hybridServicesEntitlementsPanel', {
      userEntitlementsStateData: 'fakeUserEntitlementsStateData',
    });
    this.$scope.$apply();
    expect(this.controller.services.calendarEntitled).toBe(true);
    expect(this.controller.services.callServiceAware.entitled).toBe(true);
  });
});

describe('Cloud-only calendar deployments', () => {

  beforeEach(function () {
    this.initModules(moduleName);
    this.injectDependencies(
      '$q',
      'CloudConnectorService',
      'FeatureToggleService',
      'ServiceDescriptorService',
    );

    spyOn(this.CloudConnectorService, 'getService');
    spyOn(this.ServiceDescriptorService, 'getServices').and.returnValue(this.$q.resolve([]));
    spyOn(this.FeatureToggleService, 'supports').and.returnValue(this.$q.resolve(false));
  });

  it('should enable Microsoft-based calendar if Office365 is enabled in the CCC, even when Expressway-based Office365 or Exchange is not configured', function () {
    this.CloudConnectorService.getService.and.callFake((serviceId: CCCService) => {
      if (serviceId === 'squared-fusion-o365') {
        return this.$q.resolve({ setup: true });
      } else {
        return this.$q.resolve({ setup: false });
      }
    });

    this.compileComponent('hybridServicesEntitlementsPanel');
    expect(this.controller.isEnabled).toBe(true);
    expect(this.controller.services.calendarExchangeOrOffice365.enabled).toBe(true);
    expect(this.controller.services.calendarExchangeOrOffice365.entitled).toBe(false);
    expect(this.controller.services.hasCalendarService()).toBe(true);
  });

  it('should enable Google Calendar if it is enabled in the CCC', function () {
    this.CloudConnectorService.getService.and.callFake((serviceId: CCCService) => {
      if (serviceId === 'squared-fusion-gcal') {
        return this.$q.resolve({ setup: true });
      } else {
        return this.$q.resolve({ setup: false });
      }
    });

    this.compileComponent('hybridServicesEntitlementsPanel');
    expect(this.controller.isEnabled).toBe(true);
    expect(this.controller.services.calendarGoogle.enabled).toBe(true);
    expect(this.controller.services.calendarGoogle.entitled).toBe(false);
    expect(this.controller.services.hasCalendarService()).toBe(true);
  });

  it('should allow both types to be enabled in the CCC', function () {
    this.CloudConnectorService.getService.and.returnValue(this.$q.resolve({ setup: true }));

    this.compileComponent('hybridServicesEntitlementsPanel');
    expect(this.controller.isEnabled).toBe(true);
    expect(this.controller.services.calendarExchangeOrOffice365.enabled).toBe(true);
    expect(this.controller.services.calendarExchangeOrOffice365.entitled).toBe(false);
    expect(this.controller.services.calendarGoogle.enabled).toBe(true);
    expect(this.controller.services.calendarGoogle.entitled).toBe(false);
    expect(this.controller.services.hasCalendarService()).toBe(true);
  });

});
