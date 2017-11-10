'use strict';

var hybridServicesPanelCtrlModuleName = require('./index.ts').default;

describe('Directive Controller: hybridServicesPanelCtrl', function () {
  beforeEach(angular.mock.module(hybridServicesPanelCtrlModuleName));

  var vm, $scope, $rootScope, $componentController, $q, FeatureToggleService, $translate, OnboardService, ServiceDescriptorService, CloudConnectorService, Authinfo;

  beforeEach(inject(function (_$rootScope_, _$componentController_, _OnboardService_, _ServiceDescriptorService_, _CloudConnectorService_, _Authinfo_, _$q_, _FeatureToggleService_, _$translate_) {
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();
    $componentController = _$componentController_;
    $q = _$q_;
    FeatureToggleService = _FeatureToggleService_;
    $translate = _$translate_;
    OnboardService = _OnboardService_;
    ServiceDescriptorService = _ServiceDescriptorService_;
    CloudConnectorService = _CloudConnectorService_;
    Authinfo = _Authinfo_;

    OnboardService.huronCallEntitlement = false;
    spyOn(CloudConnectorService, 'getService').and.returnValue($q.resolve({ setup: false }));
    spyOn(Authinfo, 'isEntitled').and.returnValue(false);
    spyOn(ServiceDescriptorService, 'getServices').and.returnValue($q.resolve([]));
    spyOn(FeatureToggleService, 'supports').and.returnValue($q.resolve(false));
  }));

  function initController() {
    var controller = $componentController('hybridServicesEntitlementsPanel', {
      $scope: $scope,
      $q: $q,
      $translate: $translate,
      OnboardService: OnboardService,
      FeatureToggleService: FeatureToggleService,
      ServiceDescriptorService: ServiceDescriptorService,
      Authinfo: Authinfo,
      CloudConnectorService: CloudConnectorService,
    });
    controller.$onInit();
    $scope.$apply();
    return controller;
  }

  function initMockServices(enabledServiceIds, disabledServiceIds) {
    var servicesResponse = [];
    _.forEach(enabledServiceIds, function (serviceId) {
      servicesResponse.push({ id: serviceId, enabled: true });
    });
    _.forEach(disabledServiceIds, function (serviceId) {
      servicesResponse.push({ id: serviceId, enabled: false });
    });
    ServiceDescriptorService.getServices.and.returnValue($q.resolve(servicesResponse));
    if (_.includes(enabledServiceIds, 'squared-fusion-gcal' || _.includes(disabledServiceIds, 'squared-fusion-gcal'))) {
      CloudConnectorService.getService.and.returnValue($q.resolve({ setup: _.includes(enabledServiceIds, 'squared-fusion-gcal') }));
      Authinfo.isEntitled.and.returnValue(true);
    }
  }

  function expectEntitlementActive(entitlements, name) {
    expect(_.some(entitlements, function (entitlement) {
      return entitlement.entitlementName === name && entitlement.entitlementState === 'ACTIVE';
    })).toBeTruthy();
  }

  it('should init as expected with no Hybrid Services enabled', function () {
    vm = initController();
    expect(vm.isEnabled).toBeFalsy();
    expect(vm.services.calendarEntitled).toBeFalsy();
    expect(vm.services.calendarExchange).toBeNull();
    expect(vm.services.calendarGoogle).toBeNull();
    expect(vm.services.callServiceAware).toBeNull();
    expect(vm.services.callServiceConnect).toBeNull();
    expect(vm.services.hasCalendarService()).toBeFalsy();
    expect(vm.services.hasCallService()).toBeFalsy();
  });

  it('should behave as expected with only squared-fusion-cal enabled', function () {
    initMockServices(['squared-fusion-cal'], ['squared-fusion-uc']);
    vm = initController();
    expect(vm.isEnabled).toBeTruthy();
    expect(vm.services.calendarEntitled).toBeFalsy();
    expect(vm.services.calendarExchange.enabled).toBeTruthy();
    expect(vm.services.calendarExchange.entitled).toBeFalsy();
    expect(vm.services.calendarGoogle).toBeNull();
    expect(vm.services.callServiceAware).toBeNull();
    expect(vm.services.callServiceConnect).toBeNull();
    expect(vm.services.hasCalendarService()).toBeTruthy();
    expect(vm.services.hasCallService()).toBeFalsy();

    // "Check" the calendar entitlement box
    vm.services.calendarEntitled = true;
    vm.setEntitlements();
    $scope.$apply();
    expect(vm.services.calendarExchange.entitled).toBeTruthy();
    expect(vm.entitlements.length).toBe(1);
    expectEntitlementActive(vm.entitlements, 'squaredFusionCal');
  });

  it('should behave as expected with both exchange calendar and call entitlements enabled', function () {
    initMockServices(['squared-fusion-cal', 'squared-fusion-uc', 'squared-fusion-ec'], []);
    vm = initController();
    expect(vm.isEnabled).toBeTruthy();
    expect(vm.services.calendarExchange.enabled).toBeTruthy();
    expect(vm.services.calendarExchange.entitled).toBeFalsy();
    expect(vm.services.calendarGoogle).toBeNull();
    expect(vm.services.callServiceAware.enabled).toBeTruthy();
    expect(vm.services.callServiceAware.entitled).toBeFalsy();
    expect(vm.services.callServiceConnect.enabled).toBeTruthy();
    expect(vm.services.callServiceConnect.entitled).toBeFalsy();
    expect(vm.services.hasCalendarService()).toBeTruthy();
    expect(vm.services.hasCallService()).toBeTruthy();

    // "Check" only the calendar entitlement box first
    vm.services.calendarEntitled = true;
    vm.setEntitlements();
    $scope.$apply();
    expect(vm.services.calendarExchange.entitled).toBeTruthy();
    expect(vm.entitlements.length).toBe(1);
    expectEntitlementActive(vm.entitlements, 'squaredFusionCal');

    // "Check" the call boxes too
    vm.services.callServiceAware.entitled = true;
    vm.services.callServiceConnect.entitled = true;
    vm.setEntitlements();
    $scope.$apply();
    expect(vm.services.calendarExchange.entitled).toBeTruthy();
    expect(vm.entitlements.length).toBe(3);
    expectEntitlementActive(vm.entitlements, 'squaredFusionCal');
    expectEntitlementActive(vm.entitlements, 'squaredFusionUC');
    expectEntitlementActive(vm.entitlements, 'squaredFusionEC');
  });

  it('should behave as expected with google calendar entitled, but disabled', function () {
    initMockServices(['squared-fusion-cal'], ['squared-fusion-gcal']);
    vm = initController();
    expect(vm.isEnabled).toBeTruthy();
    expect(vm.services.calendarExchange.enabled).toBeTruthy();
    expect(vm.services.calendarExchange.entitled).toBeFalsy();
    expect(vm.services.calendarGoogle).toBeNull();
    expect(vm.services.hasCalendarService()).toBeTruthy();

    // "Check" only the calendar entitlement box first
    vm.services.calendarEntitled = true;
    vm.setEntitlements();
    $scope.$apply();
    expect(vm.services.calendarExchange.entitled).toBeTruthy();
    expect(vm.entitlements.length).toBe(1);
    expectEntitlementActive(vm.entitlements, 'squaredFusionCal');
  });

  it('should behave as expected with the whole lot enabled', function () {
    initMockServices(['squared-fusion-cal', 'squared-fusion-gcal', 'squared-fusion-uc', 'squared-fusion-ec'], []);
    vm = initController();
    expect(vm.isEnabled).toBeTruthy();
    expect(vm.services.calendarExchange.enabled).toBeTruthy();
    expect(vm.services.calendarExchange.entitled).toBeFalsy();
    expect(vm.services.calendarGoogle.setup).toBeTruthy();
    expect(vm.services.calendarGoogle.entitled).toBeFalsy();
    expect(vm.services.callServiceAware.enabled).toBeTruthy();
    expect(vm.services.callServiceAware.entitled).toBeFalsy();
    expect(vm.services.callServiceConnect.enabled).toBeTruthy();
    expect(vm.services.callServiceConnect.entitled).toBeFalsy();
    expect(vm.services.hasCalendarService()).toBeTruthy();
    expect(vm.services.hasCallService()).toBeTruthy();

    // "Check" the calendar entitlement box first
    vm.services.calendarEntitled = true;
    vm.setEntitlements();
    $scope.$apply();
    expect(vm.services.selectedCalendarType).toBe('squared-fusion-cal');
    expect(vm.services.calendarExchange.entitled).toBeTruthy();
    expect(vm.services.calendarGoogle.entitled).toBeFalsy();
    expect(vm.entitlements.length).toBe(1);
    expectEntitlementActive(vm.entitlements, 'squaredFusionCal');

    // Change to google instead of exchange (the radio buttons)
    vm.services.selectedCalendarType = 'squared-fusion-gcal';
    vm.setEntitlements();
    $scope.$apply();
    expect(vm.services.selectedCalendarType).toBe('squared-fusion-gcal');
    expect(vm.services.calendarExchange.entitled).toBeFalsy();
    expect(vm.services.calendarGoogle.entitled).toBeTruthy();
    expect(vm.entitlements.length).toBe(1);
    expectEntitlementActive(vm.entitlements, 'squaredFusionGCal');

    // Change back to exchange (the radio buttons)
    vm.services.selectedCalendarType = 'squared-fusion-cal';
    vm.setEntitlements();
    $scope.$apply();
    expect(vm.services.selectedCalendarType).toBe('squared-fusion-cal');
    expect(vm.services.calendarExchange.entitled).toBeTruthy();
    expect(vm.services.calendarGoogle.entitled).toBeFalsy();
    expect(vm.entitlements.length).toBe(1);
    expectEntitlementActive(vm.entitlements, 'squaredFusionCal');
  });

  it('should not add hybrid call services if huron is enabled', function () {
    OnboardService.huronCallEntitlement = true;
    initMockServices(['squared-fusion-uc', 'squared-fusion-ec'], []);
    vm = initController();
    expect(vm.isEnabled).toBeTruthy();
    expect(vm.services.callServiceAware.enabled).toBeTruthy();
    expect(vm.services.callServiceAware.entitled).toBeFalsy();
    expect(vm.services.callServiceConnect.enabled).toBeTruthy();
    expect(vm.services.callServiceConnect.entitled).toBeFalsy();
    expect(vm.services.hasCallService()).toBeTruthy();

    vm.services.callServiceAware.entitled = true;
    vm.services.callServiceConnect.entitled = true;
    vm.setEntitlements();
    $scope.$apply();
    expect(vm.services.callServiceAware.entitled).toBeFalsy();
    expect(vm.services.callServiceConnect.entitled).toBeFalsy();
    expect(vm.entitlements.length).toBe(0);
  });

  it('should not show any hybrid message info if the org is not feature toggled', function () {
    FeatureToggleService.supports.and.returnValue($q.resolve(false));
    initMockServices(['spark-hybrid-impinterop'], []);
    vm = initController();
    expect(vm.services.hybridMessage).toBe(null);
  });

  it('should show hybrid message info if the org is feature toggled', function () {
    FeatureToggleService.supports.and.returnValue($q.resolve(true));
    initMockServices(['spark-hybrid-impinterop'], []);
    vm = initController();
    expect(vm.services.hasHybridMessageService()).toBe(true);
    expect(vm.services.hybridMessage.enabled).toBe(true);
  });

  it('should use the callback with an empty entitlement list when a user no longer has a paid license', function () {
    initMockServices(['squared-fusion-uc', 'squared-fusion-ec'], []);
    vm = initController();
    vm.entitlementsCallback = jasmine.createSpy('entitlementsCallback');
    vm.$onChanges({
      userIsLicensed: {
        previousValue: true,
        currentValue: false,
        isFirstChange: function () {
          return false;
        },
      },
    });

    expect(vm.entitlementsCallback).toHaveBeenCalledWith({
      entitlements: [],
    });
    expect(vm.entitlementsCallback.calls.count()).toBe(1);
  });
});
