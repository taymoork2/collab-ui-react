import moduleName from './index';

describe('Component: crServicesPanels:', () => {
  beforeEach(function () {
    this.initModules(moduleName);
    this.injectDependencies(
      '$modal',
      '$q',
      '$state',
      '$translate',
      'Authinfo',
      'ContextAdminAuthorizationService',
      'FeatureToggleService',
      'MessengerInteropService',
    );

    this.mock = {};
    this.mock.getConferenceServices = getJSONFixture('core/json/authInfo/confServices.json');
    this.mock.basicLicenses = require('./fake--OnboardCtrl--scope--basicLicenses.json');
    this.mock.advancedLicenses = require('./fake--OnboardCtrl--scope--advancedLicenses.json');
  });

  describe('primary behaviors (controller):', () => {
    beforeEach(function () {
      spyOn(this.FeatureToggleService, 'supports').and.returnValue(this.$q.resolve(false));
    });
    describe('hasAssignableMessageItems():', () => {
      it('should call through to MessengerInteropService.hasAssignableMessageItems()', function () {
        spyOn(this.MessengerInteropService, 'hasAssignableMessageItems');
        this.compileComponent('crServicesPanels');
        this.controller.hasAssignableMessageItems();
        expect(this.MessengerInteropService.hasAssignableMessageItems).toHaveBeenCalled();
      });
    });

    describe('checkMessageVisibility():', () => {
      beforeEach(function () {
        this.compileComponent('crServicesPanels');
      });

      it('should be false if "licenses" length is not equal to 1', function () {
        let licenses: Object[] = [];
        const selectedSubscription = 'fake-subscription-id';
        expect(this.controller.checkMessageVisibility(licenses, selectedSubscription)).toBe(false);
        licenses = [{}, {}];
        expect(this.controller.checkMessageVisibility(licenses, selectedSubscription)).toBe(false);
      });

      it('should be true if "selectedSubscription" is falsey', function () {
        const licenses = [{}];
        const selectedSubscription = undefined;
        expect(this.controller.checkMessageVisibility(licenses, selectedSubscription)).toBe(true);
      });

      it('otherwise should return comparison result of the single license\'s "billingServiceId" and "selectedSubscription"', function () {
        const licenses = [{
          billingServiceId: 'fake-subscription-id',
        }];
        let selectedSubscription = 'fake-subscription-id';
        expect(this.controller.checkMessageVisibility(licenses, selectedSubscription)).toBe(true);
        selectedSubscription = 'some-other-fake-subscription-id';
        expect(this.controller.checkMessageVisibility(licenses, selectedSubscription)).toBe(false);
      });
    });

    describe('disableCheckbox():', () => {
      beforeEach(function () {
        this.compileComponent('crServicesPanels');
      });

      it('should (if passed an array) return comparison result of first item\'s "status" and the string \'DISABLED\'', function () {
        const license: any = { status: 'DISABLED' };
        const licenses = [ license ];
        expect(this.controller.disableCheckbox(licenses)).toBe(true);
        license.status = 'foo';
        expect(this.controller.disableCheckbox(licenses)).toBe(false);
        license.status = null;
        expect(this.controller.disableCheckbox(licenses)).toBe(false);
        license.status = undefined;
        expect(this.controller.disableCheckbox(licenses)).toBe(false);
      });

      it('should (if passed a single item) return comparison result of the "status" and the string \'DISABLED\'', function () {
        const license: any = { status: 'DISABLED' };
        expect(this.controller.disableCheckbox(license)).toBe(true);
        license.status = 'foo';
        expect(this.controller.disableCheckbox(license)).toBe(false);
        license.status = null;
        expect(this.controller.disableCheckbox(license)).toBe(false);
        license.status = undefined;
        expect(this.controller.disableCheckbox(license)).toBe(false);
      });
    });

    describe('isSubscribeable():', () => {
      it('should return true only for a license with correct "status" and a positive "volume" count', function () {
        this.compileComponent('crServicesPanels');
        const fakeLicense = {
          status: 'ACTIVE',
          volume: 1,
        };

        expect(this.controller.isSubscribeable(fakeLicense)).toBe(true);
        fakeLicense.status = 'PENDING';
        expect(this.controller.isSubscribeable(fakeLicense)).toBe(true);

        fakeLicense.status = 'something-else';
        expect(this.controller.isSubscribeable(fakeLicense)).toBe(false);

        // status doesn't matter if volume is less than 1
        fakeLicense.volume = 0;
        fakeLicense.status = 'ACTIVE';
        expect(this.controller.isSubscribeable(fakeLicense)).toBe(false);
        fakeLicense.status = 'PENDING';
        expect(this.controller.isSubscribeable(fakeLicense)).toBe(false);
      });
    });

    describe('showMessengerInteropToggle():', () => {
      it('should always return false while in edit mode', function () {
        _.set(this, '$state.current.name', 'editService');
        spyOn(this.MessengerInteropService, 'hasAssignableMessageOrgEntitlement').and.returnValue(true);
        this.compileComponent('crServicesPanels');
        expect(this.controller.showMessengerInteropToggle()).toBe(false);
        this.MessengerInteropService.hasAssignableMessageOrgEntitlement.and.returnValue(false);
        expect(this.controller.showMessengerInteropToggle()).toBe(false);
      });

      it('should return the result of "MessengerInteropService.hasAssignableMessageOrgEntitlement()" while onboarding a user', function () {
        _.set(this, '$state.current.name', 'users.add.services');
        spyOn(this.MessengerInteropService, 'hasAssignableMessageOrgEntitlement').and.returnValue(true);
        this.compileComponent('crServicesPanels');
        expect(this.controller.showMessengerInteropToggle()).toBe(true);
        this.MessengerInteropService.hasAssignableMessageOrgEntitlement.and.returnValue(false);
        expect(this.controller.showMessengerInteropToggle()).toBe(false);
      });
    });

    describe('checkCMR():', () => {
      it('should should assign "cmrModel" of each item in "cmrLics" to "cfLic.confModel", if "cfLic.offerName" is \'MC\' or \'EE\'', function () {
        this.compileComponent('crServicesPanels');
        const cfLic = {
          offerName: 'MC',
          confModel: 'fake-confModel-value',
        };
        const cmrLics: any = [{}, {}];
        this.controller.checkCMR(cfLic, cmrLics);
        expect(cmrLics).toEqual([{
          cmrModel: 'fake-confModel-value',
        }, {
          cmrModel: 'fake-confModel-value',
        }]);

        cfLic.offerName = 'EE';
        cfLic.confModel = 'fake-confModel-value-2';
        this.controller.checkCMR(cfLic, cmrLics);
        expect(cmrLics).toEqual([{
          cmrModel: 'fake-confModel-value-2',
        }, {
          cmrModel: 'fake-confModel-value-2',
        }]);

        // any offer name other than 'MC' or 'EE' does nothing
        cfLic.offerName = 'foo';
        expect(cmrLics).toEqual([{
          cmrModel: 'fake-confModel-value-2',
        }, {
          cmrModel: 'fake-confModel-value-2',
        }]);
      });
    });

    describe('disableCommFeatureAssignment():', () => {
      it('should return false if "Authinfo.isSetupDone()" is true', function () {
        spyOn(this.Authinfo, 'isSetupDone').and.returnValue(true);
        this.compileComponent('crServicesPanels');
        expect(this.controller.disableCommFeatureAssignment()).toBe(false);
      });

      it('should (if "Authinfo.isSetupDone()" is false) return the negation of "$state.current.data.firstTimeSetup"', function () {
        spyOn(this.Authinfo, 'isSetupDone').and.returnValue(false);
        _.set(this, '$state.current.data.firstTimeSetup', false);
        this.compileComponent('crServicesPanels');
        expect(this.controller.disableCommFeatureAssignment()).toBe(true);
        _.set(this, '$state.current.data.firstTimeSetup', true);
        expect(this.controller.disableCommFeatureAssignment()).toBe(false);
      });
    });

    describe('confirmAdditionalServiceSetup():', () => {
      it('should call through to open a modal', function () {
        spyOn(this.$modal, 'open').and.callThrough();
        this.compileComponent('crServicesPanels');
        this.controller.confirmAdditionalServiceSetup();
        expect(this.$modal.open).toHaveBeenCalledWith({
          template: require('modules/core/users/userAdd/confirmLeavingDialog.tpl.html'),
          type: 'dialog',
        });
      });
    });

    describe('careTooltip():', () => {
      it('should return a string', function () {
        this.compileComponent('crServicesPanels');
        const expectedResult = '<div class="license-tooltip-html">firstTimeWizard.careTooltip</div>';
        expect(this.controller.careTooltip()).toBe(expectedResult);
      });
    });

    describe('selectedSubscriptionHasBasicLicenses():', () => {
      beforeEach(function () {
        spyOn(this.Authinfo, 'isInitialized').and.returnValue(true);
        spyOn(this.Authinfo, 'hasAccount').and.returnValue(true);
        spyOn(this.Authinfo, 'getConferenceServices').and.returnValue(this.mock.getConferenceServices);
        this.compileComponent('crServicesPanels', {
          basicLicenses: this.mock.basicLicenses,
        });
      });

      it('should return false for a subscription that does not have basic licenses', function () {
        const billingServiceId = 'Sub20161222115';
        const result = this.controller.selectedSubscriptionHasBasicLicenses(billingServiceId);
        expect(result).toBe(false);
      });

      it('should return true for a subscription that has basic licenses', function () {
        const billingServiceId = 'SubCt31test20161222111';
        const result = this.controller.selectedSubscriptionHasBasicLicenses(billingServiceId);
        expect(result).toBe(true);
      });

      it('should return true for a subscription that is a Trial and has basic licenses', function () {
        const billingServiceId = 'Trial';
        const result = this.controller.selectedSubscriptionHasBasicLicenses(billingServiceId);
        expect(result).toBe(true);
      });
    });

    describe('selectedSubscriptionHasAdvancedLicenses():', function () {
      beforeEach(function () {
        spyOn(this.Authinfo, 'isInitialized').and.returnValue(true);
        spyOn(this.Authinfo, 'hasAccount').and.returnValue(true);
        spyOn(this.Authinfo, 'getConferenceServices').and.returnValue(this.mock.getConferenceServices);
        this.compileComponent('crServicesPanels', {
          advancedLicenses: this.mock.advancedLicenses,
        });
      });

      it('should return false for a subscription that does not have advanced licenses', function () {
        const billingServiceId = 'Sub20161222111';
        const result = this.controller.selectedSubscriptionHasAdvancedLicenses(billingServiceId);
        expect(result).toBe(false);
      });

      it('should return true for a subscriptions that have advanced licenses', function () {
        const billingServiceId = 'SubCt31test20161222111';
        const result = this.controller.selectedSubscriptionHasAdvancedLicenses(billingServiceId);
        expect(result).toBe(true);
      });

      it('should return true for a subscriptions that are Trial and have advanced licenses', function () {
        const billingServiceId = 'Trial';
        const result = this.controller.selectedSubscriptionHasAdvancedLicenses(billingServiceId);
        expect(result).toBe(true);
      });
    });
  });

  describe('isContextServiceAdminAuthorized():', () => {
    describe('when feature toggle atlas-care-use-context-admin-authorization is enabled:', () => {
      beforeEach(function () {
        spyOn(this.FeatureToggleService, 'supports').and.returnValue(this.$q.resolve(true));
      });

      it('should set isContextServiceAdminAuthorized to true when the admin is authorized', function () {
        spyOn(this.ContextAdminAuthorizationService, 'isAdminAuthorized').and.returnValue(this.$q.resolve(true));
        this.compileComponent('crServicesPanels');
        expect(this.controller.isContextServiceAdminAuthorized).toBe(true);
      });

      it('should set isContextServiceAdminAuthorized to false when the admin is not authorized', function () {
        spyOn(this.ContextAdminAuthorizationService, 'isAdminAuthorized').and.returnValue(this.$q.resolve(false));
        this.compileComponent('crServicesPanels');
        expect(this.controller.isContextServiceAdminAuthorized).toBe(false);
      });
    });

    describe('when feature toggle atlas-care-use-context-admin-authorization is disabled:', () => {
      beforeEach(function () {
        spyOn(this.FeatureToggleService, 'supports').and.returnValue(this.$q.resolve(false));
      });

      it('should set isContextServiceAdminAuthorized to true when the feature is turned off', function () {
        this.compileComponent('crServicesPanels');
        expect(this.controller.isContextServiceAdminAuthorized).toBe(true);
      });
    });

    describe('isCareRadioFieldSetDisabled():', () => {
      it('should return true if message is not selected', function () {
        this.compileComponent('crServicesPanels', {
          radioStates: { msgRadio: false },
        });
        expect(this.controller.isCareRadioFieldSetDisabled()).toBe(true);
      });

      it('should return true if message is selected but admin is not authorized to context', function () {
        this.compileComponent('crServicesPanels', {
          radioStates: { msgRadio: true },
        });
        this.controller.isContextServiceAdminAuthorized = false;
        expect(this.controller.isCareRadioFieldSetDisabled()).toBe(true);
      });

      it('should return false if message is selected and admin is authorized to context', function () {
        this.compileComponent('crServicesPanels', {
          radioStates: { msgRadio: true },
        });
        this.controller.isContextServiceAdminAuthorized = true;
        expect(this.controller.isCareRadioFieldSetDisabled()).toBe(false);
      });
    });

    describe('showCareRadioTooltip():', () => {
      it('should return false if message is not selected', function () {
        this.compileComponent('crServicesPanels', {
          radioStates: { msgRadio: false },
        });
        expect(this.controller.showCareRadioTooltip()).toBe(false);
      });

      it('should return false if message is selected and admin is authorized to context', function () {
        this.compileComponent('crServicesPanels', {
          radioStates: { msgRadio: true },
        });
        this.controller.isContextServiceAdminAuthorized = true;
        expect(this.controller.showCareRadioTooltip()).toBe(false);
      });

      it('should return true if message is selected but admin is not authorized to context', function () {
        this.compileComponent('crServicesPanels', {
          radioStates: { msgRadio: true },
        });
        this.controller.isContextServiceAdminAuthorized = false;
        expect(this.controller.showCareRadioTooltip()).toBe(true);
      });
    });
  });
});
