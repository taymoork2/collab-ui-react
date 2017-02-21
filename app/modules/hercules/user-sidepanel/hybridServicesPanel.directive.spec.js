'use strict';

describe('Directive Controller: hybridServicesPanelCtrl', function () {
  beforeEach(angular.mock.module('Hercules'));

  var vm, $scope, $rootScope, $controller, $q, FeatureToggleService, $translate, OnboardService, ServiceDescriptor, CloudConnectorService, Authinfo;

  beforeEach(inject(function (_$rootScope_, _$controller_, _OnboardService_, _ServiceDescriptor_, _CloudConnectorService_, _Authinfo_, _$q_, _FeatureToggleService_, _$translate_) {
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();
    $controller = _$controller_;
    $q = _$q_;
    FeatureToggleService = _FeatureToggleService_;
    $translate = _$translate_;
    OnboardService = _OnboardService_;
    ServiceDescriptor = _ServiceDescriptor_;
    CloudConnectorService = _CloudConnectorService_;
    Authinfo = _Authinfo_;

    OnboardService.huronCallEntitlement = false;
    spyOn(CloudConnectorService, 'getService').and.returnValue($q.resolve({ setup: false }));
    spyOn(Authinfo, 'isEntitled').and.returnValue(false);
    spyOn(ServiceDescriptor, 'getServices').and.returnValue($q.resolve([]));
    spyOn(FeatureToggleService, 'supports').and.returnValue($q.resolve(false));
  }));

  function initController() {
    var controller = $controller('hybridServicesPanelCtrl', {
      $scope: $scope,
      $q: $q,
      $translate: $translate,
      OnboardService: OnboardService,
      FeatureToggleService: FeatureToggleService,
      ServiceDescriptor: ServiceDescriptor,
      Authinfo: Authinfo,
      CloudConnectorService: CloudConnectorService,
    });
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
    ServiceDescriptor.getServices.and.returnValue($q.resolve(servicesResponse));
    if (_.includes(enabledServiceIds, 'squared-fusion-gcal' || _.includes(disabledServiceIds, 'squared-fusion-gcal'))) {
      CloudConnectorService.getService.and.returnValue($q.resolve({ setup: _.includes(enabledServiceIds, 'squared-fusion-gcal') }));
      Authinfo.isEntitled.and.returnValue(true);
      FeatureToggleService.supports.and.returnValue($q.resolve(true));
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

});
