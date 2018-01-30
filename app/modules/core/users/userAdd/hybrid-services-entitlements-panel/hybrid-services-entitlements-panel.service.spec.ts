import { IHybridServices } from './hybrid-services-entitlements-panel.service';
import { UserEntitlementName, UserEntitlementState } from 'modules/core/users/shared/onboard/onboard.interfaces';
import moduleName from './index';

describe('HybridServicesEntitlementsPanelService:', () => {
  beforeEach(function () {
    this.initModules(moduleName);
    this.injectDependencies(
      'HybridServicesEntitlementsPanelService',
      'OnboardService',
    );
  });

  beforeEach(function () {
    this.fakeHybridServices = {} as IHybridServices;
    this.fakeHybridServices.setSelectedCalendarEntitlement = jasmine.createSpy('setSelectedCalendarEntitlement');
    spyOn(this.OnboardService, 'toEntitlementItem');
  });

  describe('getEntitlements():', () => {
    it('should add an entitlement if either exchange option is present and entitled', function () {
      _.set(this.fakeHybridServices, 'calendarEntitled', true);
      _.set(this.fakeHybridServices, 'calendarExchangeOrOffice365.entitled', true);
      const result = this.HybridServicesEntitlementsPanelService.getEntitlements(this.fakeHybridServices);
      expect(result.length).toBe(1);
      expect(this.OnboardService.toEntitlementItem).toHaveBeenCalledWith(UserEntitlementName.SQUARED_FUSION_CAL, true);
    });

    it('should add an entitlement if either google calendar option is present and entitled', function () {
      _.set(this.fakeHybridServices, 'calendarEntitled', true);
      _.set(this.fakeHybridServices, 'calendarGoogle.entitled', true);
      const result = this.HybridServicesEntitlementsPanelService.getEntitlements(this.fakeHybridServices);
      expect(result.length).toBe(1);
      expect(this.OnboardService.toEntitlementItem).toHaveBeenCalledWith(UserEntitlementName.SQUARED_FUSION_GCAL, true);
    });

    it('should add entitlements for both calendar options if present (but 1 is entitled, the other not)', function () {
      _.set(this.fakeHybridServices, 'calendarEntitled', true);
      _.set(this.fakeHybridServices, 'calendarExchangeOrOffice365.entitled', true);
      _.set(this.fakeHybridServices, 'calendarGoogle.entitled', false);
      const result = this.HybridServicesEntitlementsPanelService.getEntitlements(this.fakeHybridServices);
      expect(result.length).toBe(2);
      expect(this.OnboardService.toEntitlementItem.calls.argsFor(0)).toEqual([UserEntitlementName.SQUARED_FUSION_CAL, true]);
      expect(this.OnboardService.toEntitlementItem.calls.argsFor(1)).toEqual([UserEntitlementName.SQUARED_FUSION_GCAL, false]);
    });

    it('should set internal "selectedCalendarType" member to "null" if neither calendar option is entitled', function () {
      _.set(this.fakeHybridServices, 'calendarEntitled', false);
      this.HybridServicesEntitlementsPanelService.getEntitlements(this.fakeHybridServices);
      expect(this.fakeHybridServices.selectedCalendarType).toBe(null);
    });

    it('should add an entitlement if huron call is not entitled and call service aware is entitled', function () {
      spyOn(this.HybridServicesEntitlementsPanelService, 'hasHuronCallEntitlement').and.returnValue(false);
      _.set(this.fakeHybridServices, 'callServiceAware.entitled', true);
      const result = this.HybridServicesEntitlementsPanelService.getEntitlements(this.fakeHybridServices);
      expect(result.length).toBe(1);
      expect(this.OnboardService.toEntitlementItem).toHaveBeenCalledWith(UserEntitlementName.SQUARED_FUSION_UC, true);
    });

    it('should add 2 entitlements if huron call is not entitled and both call service aware and call service connect are entitled', function () {
      spyOn(this.HybridServicesEntitlementsPanelService, 'hasHuronCallEntitlement').and.returnValue(false);
      _.set(this.fakeHybridServices, 'callServiceAware.entitled', true);
      _.set(this.fakeHybridServices, 'callServiceConnect.entitled', true);
      const result = this.HybridServicesEntitlementsPanelService.getEntitlements(this.fakeHybridServices);
      expect(result.length).toBe(2);
      expect(this.OnboardService.toEntitlementItem.calls.argsFor(0)).toEqual([UserEntitlementName.SQUARED_FUSION_UC, true]);
      expect(this.OnboardService.toEntitlementItem.calls.argsFor(1)).toEqual([UserEntitlementName.SQUARED_FUSION_EC, true]);
    });

    it('should add an entitlement hybrid message is present and entitled', function () {
      _.set(this.fakeHybridServices, 'hybridMessage.entitled', true);
      const result = this.HybridServicesEntitlementsPanelService.getEntitlements(this.fakeHybridServices);
      expect(result.length).toBe(1);
      expect(this.OnboardService.toEntitlementItem).toHaveBeenCalledWith(UserEntitlementName.SPARK_HYBRID_IMP_INTEROP, true);
    });

    it('should by default, disallow entitlements that are set to "INACTIVE"', function () {
      // exchange calendar entitled + hybrid message disabled (1 "ACTIVE", 1 "INACTIVE")
      _.set(this.fakeHybridServices, 'calendarEntitled', true);
      _.set(this.fakeHybridServices, 'calendarExchangeOrOffice365.entitled', true);
      _.set(this.fakeHybridServices, 'hybridMessage.entitled', false);
      this.OnboardService.toEntitlementItem.and.callThrough();
      const result = this.HybridServicesEntitlementsPanelService.getEntitlements(this.fakeHybridServices);
      expect(_.size(_.filter(result, { entitlementState: UserEntitlementState.ACTIVE }))).toBe(1);
      expect(_.size(_.filter(result, { entitlementState: UserEntitlementState.INACTIVE }))).toBe(0);
    });

    it('should allow entitlements that are set to "INACTIVE" if an appropriate option is passed in', function () {
      // exchange calendar entitled + hybrid message disabled (1 "ACTIVE", 1 "INACTIVE")
      _.set(this.fakeHybridServices, 'calendarEntitled', true);
      _.set(this.fakeHybridServices, 'calendarExchangeOrOffice365.entitled', true);
      _.set(this.fakeHybridServices, 'hybridMessage.entitled', false);
      this.OnboardService.toEntitlementItem.and.callThrough();
      const result = this.HybridServicesEntitlementsPanelService.getEntitlements(this.fakeHybridServices, { allowRemove: true });
      expect(_.size(_.filter(result, { entitlementState: UserEntitlementState.ACTIVE }))).toBe(1);
      expect(_.size(_.filter(result, { entitlementState: UserEntitlementState.INACTIVE }))).toBe(1);
    });
  });
});
