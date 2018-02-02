import moduleName from './index';

import { IAutoAssignTemplateData } from 'modules/core/users/shared/auto-assign-template/auto-assign-template.interfaces';
import { IUserEntitlementRequestItem } from 'modules/core/users/shared/onboard/onboard.interfaces';
import { IAssignableLicenseCheckboxState } from 'modules/core/users/userAdd/assignable-services/shared/license-usage-util.interfaces';

describe('Service: AutoAssignTemplateService:', () => {
  beforeEach(function() {
    this.initModules(moduleName);
    this.injectDependencies(
      '$http',
      '$q',
      '$scope',
      'Authinfo',
      'AutoAssignTemplateService',
      'MessengerInteropService',
      'Orgservice',
      'UrlConfig',
    );
    this.endpointUrl = 'fake-admin-service-url/organizations/fake-org-id/templates';
    this.settingsUrl = 'fake-admin-service-url/organizations/fake-org-id/settings/autoLicenseAssignment';
    this.fixtures = {};
    this.fixtures.fakeLicenseUsage = [{
      subscriptionId: 'fake-subscriptionId-2',
      licenses: [{ offerName: 'foo' }],
    }, {
      subscriptionId: 'fake-subscriptionId-3',
      licenses: [{ offerName: 'foo' }],
    }, {
      subscriptionId: 'fake-subscriptionId-1',
      licenses: [{ offerName: 'foo' }],
    }];
    this.autoAssignTemplateData = {};
    _.set(this.autoAssignTemplateData, 'subscriptions', undefined);
    _.set(this.autoAssignTemplateData, 'LICENSE', { subscriptionId: 'fake-subscriptionId-1' });
    _.set(this.autoAssignTemplateData, 'USER_ENTITLEMENTS_PAYLOAD', undefined);
  });

  beforeEach(function () {
    spyOn(this.UrlConfig, 'getAdminServiceUrl').and.returnValue('fake-admin-service-url/');
    spyOn(this.Authinfo, 'getOrgId').and.returnValue('fake-org-id');
    spyOn(this.Orgservice, 'getLicensesUsage').and.returnValue(this.$q.resolve(this.fixtures.fakeLicenseUsage));
  });

  afterEach(function () {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  describe('primary behaviors:', () => {
    it('should initialize its "autoAssignTemplateUrl" property', function () {
      expect(this.AutoAssignTemplateService.autoAssignTemplateUrl).toBe(this.endpointUrl);
    });
  });

  describe('getTemplates():', () => {
    it('should call GET on the internal endpoint url', function () {
      this.$httpBackend.expectGET(this.endpointUrl).respond(200);
      this.AutoAssignTemplateService.getTemplates();
      this.$httpBackend.flush();
    });
  });

  describe('getDefaultTemplate():', () => {
    it('should call "getTemplates()" and return the default template', function (done) {
      const fakeValidResponse = [{
        name: 'Default',
      }];
      spyOn(this.AutoAssignTemplateService, 'getTemplates').and.returnValue(this.$q.resolve(fakeValidResponse));
      this.AutoAssignTemplateService.getDefaultTemplate().then(template => {
        expect(template).toEqual({
          name: 'Default',
        });
      });
      this.$scope.$apply();

      this.AutoAssignTemplateService.getTemplates.and.returnValue(this.$q.reject({ status: 404 }));
      this.AutoAssignTemplateService.getDefaultTemplate().then(template => {
        expect(template).toBe(undefined);
        _.defer(done);
      });
      this.$scope.$apply();
    });
  });

  describe('isEnabledForOrg():', () => {
    it('should reflect the status of orgSettings.autoLicenseAssignment', function (done) {
      this.$httpBackend.expectGET(this.settingsUrl).respond({
        autoLicenseAssignment: true,
      });
      this.AutoAssignTemplateService.isEnabledForOrg().then(isEnabled => {
        expect(isEnabled).toBe(true);
        _.defer(done);
      });
      this.$httpBackend.flush();
    });
  });

  describe('createTemplate():', () => {
    it('should call POST on the internal endpoint url with the given payload', function () {
      this.$httpBackend.expectPOST(this.endpointUrl, { foo: 'bar' }).respond(200);
      this.AutoAssignTemplateService.createTemplate({ foo: 'bar' });
      this.$httpBackend.flush();
    });
  });

  describe('updateTemplate():', () => {
    it('should call PATCH on the internal endpoint url with the given payload', function () {
      this.$httpBackend.expectPATCH(`${this.endpointUrl}/fake-template-id-1`, { foo: 'bar' }).respond(200);
      this.AutoAssignTemplateService.updateTemplate('fake-template-id-1', { foo: 'bar' });
      this.$httpBackend.flush();
    });
  });

  describe('activateTemplate():', () => {
    it('should call POST on the internal settings url with an empty payload and enabled=true', function () {
      this.$httpBackend.expectPOST(`${this.settingsUrl}?enabled=true`).respond(200);
      this.AutoAssignTemplateService.activateTemplate();
      this.$httpBackend.flush();
    });
  });

  describe('deactivateTemplate():', () => {
    it('should call POST on the internal settings url with an empty payload and enabled=false', function () {
      this.$httpBackend.expectPOST(`${this.settingsUrl}?enabled=false`).respond(200);
      this.AutoAssignTemplateService.deactivateTemplate();
      this.$httpBackend.flush();
    });
  });

  describe('deleteTemplate():', () => {
    it('should call DELETE on the internal endpoint url with the given payload', function () {
      this.$httpBackend.expectDELETE(`${this.endpointUrl}/fake-template-id-1`).respond(200);
      this.AutoAssignTemplateService.deleteTemplate('fake-template-id-1');
      this.$httpBackend.flush();
    });
  });

  describe('getAllLicenses():', () => {
    it('should compose a map of licenses keyed by their license ids', function () {
      const fakeSubscriptions = [{
        subscriptionId: 'fake-subscription-id-1',
        licenses: [
          { licenseId: 'fake-license-id-1' },
        ],
      }, {
        subscriptionId: 'fake-subscription-id-2',
        licenses: [
          { licenseId: 'fake-license-id-2a' },
          { licenseId: 'fake-license-id-2b' },
        ],
      }, {
        subscriptionId: 'fake-subscription-id-3',
        licenses: [
          { licenseId: 'fake-license-id-3a' },
          { licenseId: 'fake-license-id-3b' },
          { licenseId: 'fake-license-id-3c' },
        ],
      }];

      expect(this.AutoAssignTemplateService.getAllLicenses(fakeSubscriptions)).toEqual({
        'fake-license-id-1': { licenseId: 'fake-license-id-1' },
        'fake-license-id-2a': { licenseId: 'fake-license-id-2a' },
        'fake-license-id-2b': { licenseId: 'fake-license-id-2b' },
        'fake-license-id-3a': { licenseId: 'fake-license-id-3a' },
        'fake-license-id-3b': { licenseId: 'fake-license-id-3b' },
        'fake-license-id-3c': { licenseId: 'fake-license-id-3c' },
      });
    });
  });

  describe('mkLicenseEntries():', () => {
    it('should compose state data representing currently selected licenses', function () {
      const fakeAllLicenses = {
        'fake-license-id-1': { foo: 1 },
        'fake-license-id-2': { foo: 2 },
        'fake-license-id-3': { foo: 3 },
      };
      expect(this.AutoAssignTemplateService.mkLicenseEntries([{ id: 'fake-license-id-1' }], fakeAllLicenses)).toEqual({
        'fake-license-id-1': {
          isSelected: true,
          license: { foo: 1 },
        },
      });

      expect(this.AutoAssignTemplateService.mkLicenseEntries([
        { id: 'fake-license-id-1' },
        { id: 'fake-license-id-3' }],
        fakeAllLicenses)).toEqual({
          'fake-license-id-1': {
            isSelected: true,
            license: { foo: 1 },
          },
          'fake-license-id-3': {
            isSelected: true,
            license: { foo: 3 },
          },
        });
    });
  });

  describe('mkUserEntitlementEntries():', () => {
    it('should compose state data representing currently selected user-entitlements', function () {
      const fakeUserEntitlements = [] as IUserEntitlementRequestItem[];
      fakeUserEntitlements.push({
        entitlementName: 'fake-entitlement-1',
        entitlementState: 'ACTIVE',
      } as any);
      fakeUserEntitlements.push({
        entitlementName: 'fake-entitlement-2',
        entitlementState: 'ACTIVE',
      } as any);
      fakeUserEntitlements.push({
        entitlementName: 'fake-entitlement-3',
        entitlementState: 'INACTIVE',
      } as any);
      expect(this.AutoAssignTemplateService.mkUserEntitlementEntries()).toEqual({});
      expect(this.AutoAssignTemplateService.mkUserEntitlementEntries([])).toEqual({});
      expect(this.AutoAssignTemplateService.mkUserEntitlementEntries(fakeUserEntitlements)).toEqual({
        'fake-entitlement-1': {
          isSelected: true,
          isDisabled: false,
        },
        'fake-entitlement-2': {
          isSelected: true,
          isDisabled: false,
        },
        'fake-entitlement-3': {
          isSelected: false,
          isDisabled: false,
        },
      });
    });
  });

  describe('toAutoAssignTemplateData():', () => {
    it('should compose state data object with "apiData", "otherData", and "viewData" properties', function () {
      spyOn(this.AutoAssignTemplateService, 'getAllLicenses').and.returnValue('fake-allLicenses-result');
      spyOn(this.AutoAssignTemplateService, 'mkLicenseEntries').and.returnValue('fake-mkLicenseEntries-result');
      spyOn(this.AutoAssignTemplateService, 'mkUserEntitlementEntries').and.returnValue('fake-mkUserEntitlementEntries-result');
      spyOn(this.AutoAssignTemplateService, 'initAutoAssignTemplateData').and.callThrough();
      const fakeAutoAssignTemplate = {
        licenses: 'fake-template-licenses-arg',
        userEntitlements: 'fake-template-userEntitlements-arg',
      };
      const result = this.AutoAssignTemplateService.toAutoAssignTemplateData(fakeAutoAssignTemplate, 'fake-subscriptions-arg');

      expect(this.AutoAssignTemplateService.initAutoAssignTemplateData).toHaveBeenCalled();
      expect(this.AutoAssignTemplateService.getAllLicenses).toHaveBeenCalledWith('fake-subscriptions-arg');
      expect(this.AutoAssignTemplateService.mkLicenseEntries).toHaveBeenCalledWith('fake-template-licenses-arg', 'fake-allLicenses-result');
      expect(this.AutoAssignTemplateService.mkUserEntitlementEntries).toHaveBeenCalledWith('fake-template-userEntitlements-arg');
      expect(result.apiData).toEqual({
        subscriptions: 'fake-subscriptions-arg',
        template: fakeAutoAssignTemplate,
      });
      expect(result.viewData).toEqual({
        LICENSE: 'fake-mkLicenseEntries-result',
        USER_ENTITLEMENT: 'fake-mkUserEntitlementEntries-result',
      });
      expect(result.otherData).toEqual({});
    });
  });

  describe('getSortedSubscriptions():', () => {
    it('should resolve with a collection of subscriptions sorted by subscription id', function (done) {
      this.AutoAssignTemplateService.getSortedSubscriptions().then(sortedSubscriptions => {
        expect(sortedSubscriptions.length).toBe(3);
        expect(_.get(sortedSubscriptions[0], 'subscriptionId')).toBe('fake-subscriptionId-1');
        expect(_.get(sortedSubscriptions[1], 'subscriptionId')).toBe('fake-subscriptionId-2');
        expect(_.get(sortedSubscriptions[2], 'subscriptionId')).toBe('fake-subscriptionId-3');
        _.defer(done);
      });
      this.$scope.$apply();
    });

    it('should not containing subscriptions with only licenses of "MSGR" offer name', function (done) {
      expect(this.fixtures.fakeLicenseUsage.length).toBe(3);
      this.fixtures.fakeLicenseUsage.push({
        subscriptionId: 'fake-subscriptionId-4',
        licenses: [{ offerName: 'MSGR' }],
      });
      expect(this.fixtures.fakeLicenseUsage.length).toBe(4);
      this.AutoAssignTemplateService.getSortedSubscriptions().then(sortedSubscriptions => {
        expect(sortedSubscriptions.length).toBe(3);
        expect(_.get(sortedSubscriptions[0], 'subscriptionId')).toBe('fake-subscriptionId-1');
        expect(_.get(sortedSubscriptions[1], 'subscriptionId')).toBe('fake-subscriptionId-2');
        expect(_.get(sortedSubscriptions[2], 'subscriptionId')).toBe('fake-subscriptionId-3');
        _.defer(done);
      });
      this.$scope.$apply();
    });
  });

  describe('mkPayload():', () => {
    it('should return a payload composed of a licenses payload, and a user-entitlements payload', function () {
      spyOn(this.AutoAssignTemplateService, 'mkLicensesPayload').and.returnValue(['fake-licenses-payload']);
      spyOn(this.AutoAssignTemplateService, 'mkUserEntitlementsPayload').and.returnValue(['fake-user-entitlements-payload']);
      const payload = this.AutoAssignTemplateService.mkPayload({});
      expect(this.AutoAssignTemplateService.mkLicensesPayload).toHaveBeenCalled();
      expect(this.AutoAssignTemplateService.mkUserEntitlementsPayload).toHaveBeenCalled();
      expect(payload).toEqual({
        name: 'Default',
        licenses: ['fake-licenses-payload'],
        userEntitlements: ['fake-user-entitlements-payload'],
      });
    });
  });

  describe('mkLicensesPayload():', () => {
    it('should include "add" operations for each selected license entry found in "viewData.LICENSE"', function () {
      const autoAssignTemplateData = {} as IAutoAssignTemplateData;
      _.set(autoAssignTemplateData, `viewData.LICENSE['fake-license-id-1']`, {
        isSelected: true,
        license: {
          licenseId: 'fake-license-id-1',
        },
      });
      let result = this.AutoAssignTemplateService.mkLicensesPayload(autoAssignTemplateData);
      expect(result.length).toBe(1);
      expect(result[0]).toEqual({
        id: 'fake-license-id-1',
        idOperation: 'ADD',
        properties: {},
      });

      // add a second (selected) license to view data
      _.set(autoAssignTemplateData, `viewData.LICENSE['fake-license-id-2']`, {
        isSelected: true,
        license: {
          licenseId: 'fake-license-id-2',
        },
      });

      // now have a list of 2 "add" operations
      result = this.AutoAssignTemplateService.mkLicensesPayload(autoAssignTemplateData);
      expect(result.length).toBe(2);
      expect(_.map(result, 'id')).toEqual(['fake-license-id-1', 'fake-license-id-2']);
      expect(_.map(result, 'idOperation')).toEqual(['ADD', 'ADD']);

      // add a third (unselected) license to view data
      _.set(autoAssignTemplateData, `viewData.LICENSE['fake-license-id-3']`, {
        isSelected: false,
        license: {
          licenseId: 'fake-license-id-3',
        },
      });

      // list will still be 2 "add" operations
      result = this.AutoAssignTemplateService.mkLicensesPayload(autoAssignTemplateData);
      expect(result.length).toBe(2);
      expect(_.map(result, 'id')).toEqual(['fake-license-id-1', 'fake-license-id-2']);
      expect(_.map(result, 'idOperation')).toEqual(['ADD', 'ADD']);
    });

    it('should include "remove" operations for each unselected license entry found in "viewData.LICENSE"', function () {
      function mkFakeUnselectedLicenseEntry(licenseId): IAssignableLicenseCheckboxState {
        return <IAssignableLicenseCheckboxState>{
          isSelected: false,
          license: {
            licenseId: licenseId,
          },
        };
      }
      const autoAssignTemplateData = {} as IAutoAssignTemplateData;

      // an unselected license entry
      _.set(autoAssignTemplateData, `viewData.LICENSE['fake-license-id-1']`, mkFakeUnselectedLicenseEntry('fake-license-id-1'));
      _.set(autoAssignTemplateData, `apiData.template`, {
        licenses: [{
          id: 'fake-license-id-1', // ...which also happens to be present in the existing template
          idOperation: 'ADD',
        }, {
          id: 'fake-license-id-2',
          idOperation: 'ADD',
        }],
      });

      let result = this.AutoAssignTemplateService.mkLicensesPayload(autoAssignTemplateData);
      expect(result.length).toBe(1);

      expect(result[0]).toEqual({
        id: 'fake-license-id-1',
        idOperation: 'REMOVE', // ...translates into a "remove" operation
        properties: {},
      });

      // add a second unselected license entry (that is present in the existing template)
      _.set(autoAssignTemplateData, `viewData.LICENSE['fake-license-id-2']`, mkFakeUnselectedLicenseEntry('fake-license-id-2'));

      result = this.AutoAssignTemplateService.mkLicensesPayload(autoAssignTemplateData);
      expect(result.length).toBe(2);
      expect(_.map(result, 'id')).toEqual(['fake-license-id-1', 'fake-license-id-2']);
      expect(_.map(result, 'idOperation')).toEqual(['REMOVE', 'REMOVE']); // ...translates into both of them being "remove" operations

      // add another unselected license entry (that is NOT present in the existing template)
      _.set(autoAssignTemplateData, `viewData.LICENSE['foo']`, mkFakeUnselectedLicenseEntry('foo'));

      // ...and it is skipped (we disallow "remove" operation unless the license is present)
      result = this.AutoAssignTemplateService.mkLicensesPayload(autoAssignTemplateData);
      expect(result.length).toBe(2);
      expect(_.map(result, 'id')).toEqual(['fake-license-id-1', 'fake-license-id-2']);
      expect(_.map(result, 'idOperation')).toEqual(['REMOVE', 'REMOVE']);
    });
  });

  describe('mkUserEntitlementsPayload():', () => {
    it('should include "add" operations for each selected user-entitlement entry found in "viewData.USER_ENTITLEMENT"', function () {
      const autoAssignTemplateData = {} as IAutoAssignTemplateData;
      _.set(autoAssignTemplateData, `viewData.USER_ENTITLEMENT['fake-user-entitlement-1']`, { isSelected: true });
      let result = this.AutoAssignTemplateService.mkUserEntitlementsPayload(autoAssignTemplateData);
      expect(result.length).toBe(1);
      expect(result[0]).toEqual({
        entitlementName: 'fake-user-entitlement-1',
        entitlementState: 'ACTIVE',
      });

      // add a second (selected) user-entitlement to view data
      _.set(autoAssignTemplateData, `viewData.USER_ENTITLEMENT['fake-user-entitlement-2']`, { isSelected: true });

      // ...translates into a list of 2 "add" operations
      result = this.AutoAssignTemplateService.mkUserEntitlementsPayload(autoAssignTemplateData);
      expect(result.length).toBe(2);
      expect(_.map(result, 'entitlementName')).toEqual(['fake-user-entitlement-1', 'fake-user-entitlement-2']);
      expect(_.map(result, 'entitlementState')).toEqual(['ACTIVE', 'ACTIVE']);

      // add a third (unselected) user-entitlement to view data
      _.set(autoAssignTemplateData, `viewData.USER_ENTITLEMENT['fake-user-entitlement-3']`, { isSelected: false });

      // ...list will still be 2 "add" operations
      result = this.AutoAssignTemplateService.mkUserEntitlementsPayload(autoAssignTemplateData);
      expect(result.length).toBe(2);
      expect(_.map(result, 'entitlementName')).toEqual(['fake-user-entitlement-1', 'fake-user-entitlement-2']);
      expect(_.map(result, 'entitlementState')).toEqual(['ACTIVE', 'ACTIVE']);
    });

    it('should include "remove" operations for each unselected user-entitlement entry found in "viewData.USER_ENTITLEMENT"', function () {
      const autoAssignTemplateData = {} as IAutoAssignTemplateData;
        // an unselected user-entitlement entry
      _.set(autoAssignTemplateData, `viewData.USER_ENTITLEMENT['fake-user-entitlement-1']`, { isSelected: false });
      _.set(autoAssignTemplateData, 'apiData.template', {
        userEntitlements: [{
          entitlementName: 'fake-user-entitlement-1', // ...which also happens to be present in the existing template
          entitlementState: 'ACTIVE',
        }, {
          entitlementName: 'fake-user-entitlement-2',
          entitlementState: 'ACTIVE',
        }],
      });

      let result = this.AutoAssignTemplateService.mkUserEntitlementsPayload(autoAssignTemplateData);
      expect(result.length).toBe(1);
      expect(result[0]).toEqual({
        entitlementName: 'fake-user-entitlement-1',
        entitlementState: 'INACTIVE', // ...translates into a "remove" operation
      });

      // add a second unselected entry (that is present in the existing template)
      _.set(autoAssignTemplateData, `viewData.USER_ENTITLEMENT['fake-user-entitlement-2']`, { isSelected: false });

      result = this.AutoAssignTemplateService.mkUserEntitlementsPayload(autoAssignTemplateData);
      expect(result.length).toBe(2);
      expect(_.map(result, 'entitlementName')).toEqual(['fake-user-entitlement-1', 'fake-user-entitlement-2']);
      expect(_.map(result, 'entitlementState')).toEqual(['INACTIVE', 'INACTIVE']); // ...translates into both of them being "remove" operations

      // add another unselected entry (that is NOT present in the existing template)
      _.set(autoAssignTemplateData, `viewData.USER_ENTITLEMENT['foo']`, { isSelected: false });

      // ...and it is skipped (we disallow "remove" operation unless the user-entitlement is present)
      result = this.AutoAssignTemplateService.mkUserEntitlementsPayload(autoAssignTemplateData);
      expect(result.length).toBe(2);
      expect(_.map(result, 'entitlementName')).toEqual(['fake-user-entitlement-1', 'fake-user-entitlement-2']);
      expect(_.map(result, 'entitlementState')).toEqual(['INACTIVE', 'INACTIVE']);
    });
  });

  describe('isLicenseIdInTemplate():', () => {
    it('should return true if license id is present in the existing template, false otherwise', function () {
      const autoAssignTemplateData = {} as IAutoAssignTemplateData;
      _.set(autoAssignTemplateData, 'apiData.template.licenses', [
        { id: 'fake-license-id-1' },
        { id: 'fake-license-id-2' },
      ]);
      expect(this.AutoAssignTemplateService.isLicenseIdInTemplate('fake-license-id-1', autoAssignTemplateData)).toBe(true);
      expect(this.AutoAssignTemplateService.isLicenseIdInTemplate('fake-license-id-2', autoAssignTemplateData)).toBe(true);
      expect(this.AutoAssignTemplateService.isLicenseIdInTemplate('foo', autoAssignTemplateData)).toBe(false);
    });
  });

  describe('isUserEntitlementNameInTemplate():', () => {
    it('should return true if entitlement name is present in the existing template, false otherwise', function () {
      const autoAssignTemplateData = {} as IAutoAssignTemplateData;
      _.set(autoAssignTemplateData, 'apiData.template.userEntitlements', [
        { entitlementName: 'fake-user-entitlement-1' },
        { entitlementName: 'fake-user-entitlement-2' },
      ]);
      expect(this.AutoAssignTemplateService.isUserEntitlementNameInTemplate('fake-user-entitlement-1', autoAssignTemplateData)).toBe(true);
      expect(this.AutoAssignTemplateService.isUserEntitlementNameInTemplate('fake-user-entitlement-2', autoAssignTemplateData)).toBe(true);
      expect(this.AutoAssignTemplateService.isUserEntitlementNameInTemplate('foo', autoAssignTemplateData)).toBe(false);
    });
  });

  describe('isUserEntitlementNameInTemplate():', () => {
    it('should return a skeleton object suitable for populating auto-assign template data', function () {
      expect(this.AutoAssignTemplateService.initAutoAssignTemplateData()).toEqual({
        viewData: {},
        apiData: {},
        otherData: {},
      });
    });
  });
});

