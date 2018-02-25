import moduleName from './index';

import { UserEntitlementName } from 'modules/core/users/shared/onboard/onboard.interfaces';
import { OfferName } from 'modules/core/shared';

describe('Component: autoAssignTemplateSummary:', () => {
  beforeEach(function() {
    this.initModules(moduleName);
    this.injectDependencies(
      '$scope',
      'LicenseUsageUtilService',
    );
    this.$scope.fakeAutoAssignTemplateData = {
      viewData: {
        LICENSE: {},
        USER_ENTITLEMENT: {},
      },
    };

    this.emptyLicenses = function() {
      _.set(this.$scope.fakeAutoAssignTemplateData, 'viewData.LICENSE', {});
    };

    this.emptyUserEntitlements = function() {
      _.set(this.$scope.fakeAutoAssignTemplateData, 'viewData.USER_ENTITLEMENT', {});
    };

    this.setFakeLicenseOffer = function(offerName: OfferName, licenseId: string = 'foo', isSelected: boolean = true) {
      _.set(this.$scope.fakeAutoAssignTemplateData, `viewData.LICENSE.${licenseId}.isSelected`, isSelected);
      _.set(this.$scope.fakeAutoAssignTemplateData, `viewData.LICENSE.${licenseId}.license.offerName`, offerName);
    };

    this.setFakeUserEntitlement = function(entitlementName: UserEntitlementName, isSelected: boolean = true) {
      _.set(this.$scope.fakeAutoAssignTemplateData, `viewData.USER_ENTITLEMENT.${entitlementName}.isSelected`, isSelected);
    };

    this.recompileComponent = function() {
      this.compileComponent('autoAssignTemplateSummary', {
        autoAssignTemplateData: 'fakeAutoAssignTemplateData',
      });
    };
  });

  describe('primary behaviors (view):', () => {
    describe('no selections:', () => {
      it('should render an empty table if there is no selected licenses or user-entitlements', function () {
        this.recompileComponent();
        expect(this.view.find('.summary__group').length).toBe(0);
      });
    });

    describe('message row:', () => {
      it('should render row if at least 1 message license ("MS" offer name) is selected, or jabber interop is selected', function () {
        this.setFakeLicenseOffer(OfferName.MS);
        this.recompileComponent();
        expect(this.view.find('.message.summary__group').length).toBe(1);

        // empty out licenses, set jabber interop user-entitlement
        this.emptyLicenses();
        this.setFakeUserEntitlement(UserEntitlementName.MESSENGER_INTEROP);
        this.recompileComponent();
        expect(this.view.find('.message.summary__group').length).toBe(1);
      });

      it('should render up to 2 cells, 1 for the "MS" offer name licenses, 1 for jabber interop', function () {
        // start with message license
        this.setFakeLicenseOffer(OfferName.MS);
        this.recompileComponent();
        expect(this.view.find('.message.summary__group .summary__group-item').length).toBe(1);

        // add jabber interop
        this.setFakeUserEntitlement(UserEntitlementName.MESSENGER_INTEROP);
        this.recompileComponent();
        expect(this.view.find('.message.summary__group .summary__group-item').length).toBe(2);
      });
    });

    describe('meeting row:', () => {
      it('should render row if at least 1 basic meeting license ("CF" offer name) or 1 advanced meeting license ("CMR", "EC", "EE", "MC", or "TC" offer name) is selected', function () {
        _.forEach([
          OfferName.CF,
          OfferName.CMR,
          OfferName.EC,
          OfferName.EE,
          OfferName.MC,
          OfferName.TC,
        ], (offerName) => {
          this.emptyLicenses();
          this.setFakeLicenseOffer(offerName);
          this.recompileComponent();
          expect(this.view.find('.meeting.summary__group').length).toBe(1);
        });
      });

      it('should conditionally render 1 column container for basic meetings, and 1 for advanced meetings', function () {
        this.emptyLicenses();
        this.recompileComponent();
        expect(this.view.find('.meeting.summary__group .summary__subgroup--1-col').length).toBe(0);

        this.setFakeLicenseOffer(OfferName.CF, 'fake-license-id-1');
        this.recompileComponent();
        expect(this.view.find('.meeting.summary__group .summary__subgroup--1-col').length).toBe(1);
        expect(this.view.find('.basic-meeting.summary__subgroup--1-col').length).toBe(1);

        this.setFakeLicenseOffer(OfferName.MC, 'fake-license-id-2');
        this.recompileComponent();
        expect(this.view.find('.meeting.summary__group .summary__subgroup--1-col').length).toBe(2);
        expect(this.view.find('.advanced-meeting.summary__subgroup--1-col').length).toBe(1);
      });
    });

    describe('call row:', () => {
      it('should render row if at least 1 call license ("CO" offer name) is selected', function () {
        this.setFakeLicenseOffer(OfferName.CO);
        this.recompileComponent();
        expect(this.view.find('.call.summary__group').length).toBe(1);
      });
    });

    describe('care row:', () => {
      it('should render row if at least 1 care license ("CDC" or "CVC" offer name) is selected', function () {
        this.setFakeLicenseOffer(OfferName.CDC);
        this.recompileComponent();
        expect(this.view.find('.care.summary__group').length).toBe(1);

        this.emptyLicenses();
        this.setFakeLicenseOffer(OfferName.CVC);
        this.recompileComponent();
        expect(this.view.find('.care.summary__group').length).toBe(1);
      });
    });

    describe('hybrid services entitlements row:', () => {
      it('should render row if at least 1 hybrid service entitlement is selected ("sparkHybridImpInterop", "squaredFusionCal", "squaredFusionGCal", "squaredFusionUC", or "squaredFusionEC")', function () {
        _.forEach([
          UserEntitlementName.SPARK_HYBRID_IMP_INTEROP,
          UserEntitlementName.SQUARED_FUSION_CAL,
          UserEntitlementName.SQUARED_FUSION_GCAL,
          UserEntitlementName.SQUARED_FUSION_UC,
          UserEntitlementName.SQUARED_FUSION_EC,
        ], (userEntitlementName) => {
          this.emptyUserEntitlements();
          this.setFakeUserEntitlement(userEntitlementName);
          this.recompileComponent();
          expect(this.view.find('.hybrid-services-entitlements.summary__group').length).toBe(1);
        });
      });

      it('should conditionally render 1 cell for each hybrid service entitlement that is selected', function () {
        this.emptyLicenses();
        this.recompileComponent();
        expect(this.view.find('.hybrid-services-entitlements.summary__group .summary__group-item').length).toBe(0);

        this.setFakeUserEntitlement(UserEntitlementName.SPARK_HYBRID_IMP_INTEROP);
        this.recompileComponent();
        expect(this.view.find('.hybrid-services-entitlements.summary__group .summary__group-item').length).toBe(1);

        this.setFakeUserEntitlement(UserEntitlementName.SQUARED_FUSION_CAL);
        this.recompileComponent();
        expect(this.view.find('.hybrid-services-entitlements.summary__group .summary__group-item').length).toBe(2);

        // notes:
        // - either 'squaredFusionCal' or 'squaredFusionGCal' can be selected, not both
        // - so we manually ensure this logic here
        this.setFakeUserEntitlement(UserEntitlementName.SQUARED_FUSION_CAL, false);
        this.setFakeUserEntitlement(UserEntitlementName.SQUARED_FUSION_GCAL);
        this.recompileComponent();
        expect(this.view.find('.hybrid-services-entitlements.summary__group .summary__group-item').length).toBe(2);

        this.setFakeUserEntitlement(UserEntitlementName.SQUARED_FUSION_UC);
        this.recompileComponent();
        expect(this.view.find('.hybrid-services-entitlements.summary__group .summary__group-item').length).toBe(3);

        this.setFakeUserEntitlement(UserEntitlementName.SQUARED_FUSION_EC);
        this.recompileComponent();
        expect(this.view.find('.hybrid-services-entitlements.summary__group .summary__group-item').length).toBe(4);
      });
    });
  });

  describe('primary behaviors (controller):', () => {
    it('should pass through its calls to respective LicenseUsageUtilService methods', function () {
      this.$scope.fakeAutoAssignTemplateData = {
        viewData: {
          LICENSE: {
            CF_4f4253ad: {
              isSelected: true,
              license: {
                offerName: 'CF',
                usage: 3,
                volume: 500,
              },
            },
          },
        },
      };
      spyOn(this.LicenseUsageUtilService, 'getTotalLicenseUsage');
      spyOn(this.LicenseUsageUtilService, 'getTotalLicenseVolume');
      this.compileComponent('autoAssignTemplateSummary', {
        autoAssignTemplateData: 'fakeAutoAssignTemplateData',
      });

      this.controller.getTotalLicenseUsage('CF');
      expect(this.LicenseUsageUtilService.getTotalLicenseUsage).toHaveBeenCalled();

      this.controller.getTotalLicenseVolume('CF');
      expect(this.LicenseUsageUtilService.getTotalLicenseVolume).toHaveBeenCalled();
    });

    describe('getUserEntitlements', () => {
      it('should find the appropriate hybrid service user entitlements', function () {
        this.$scope.fakeAutoAssignTemplateData = {
          viewData: {
            USER_ENTITLEMENT: {
              squaredFusionCal: {
                isSelected: true,
              },
            },
          },
        };
        this.compileComponent('autoAssignTemplateSummary', {
          autoAssignTemplateData: 'fakeAutoAssignTemplateData',
        });
        expect(this.controller.getUserEntitlements()).toEqual({
          squaredFusionCal: {
            isSelected: true,
          },
        });
      });
    });

    describe('hasUserEntitlement', () => {
      it('should find the appropriate hybrid service user entitlements', function () {
        this.$scope.fakeAutoAssignTemplateData = {
          viewData: {
            USER_ENTITLEMENT: {
              squaredFusionCal: {
                isSelected: true,
              },
            },
          },
        };
        this.compileComponent('autoAssignTemplateSummary', {
          autoAssignTemplateData: 'fakeAutoAssignTemplateData',
        });
        spyOn(this.controller, 'getUserEntitlements').and.returnValue({
          squaredFusionCal: {
            isSelected: true,
          },
        });
        expect(this.controller.hasUserEntitlement('squaredFusionCal')).toBe(true);
      });
    });
  });
});
