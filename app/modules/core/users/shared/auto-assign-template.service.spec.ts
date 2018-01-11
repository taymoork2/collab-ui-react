import moduleName from './index';

describe('Service: AutoAssignTemplateService:', () => {
  beforeEach(function() {
    this.initModules(moduleName);
    this.injectDependencies(
      '$http',
      '$q',
      '$scope',
      'Authinfo',
      'AutoAssignTemplateService',
      'Orgservice',
      'UrlConfig',
    );
    this.endpointUrl = 'fake-admin-service-url/organizations/fake-org-id/templates';
    this.settingsUrl = 'fake-admin-service-url/organizations/fake-org-id/settings/autoLicenseAssignment';
    this.fixtures = {};
    this.fixtures.fakeLicenseUsage = [{
      subscriptionId: 'fake-subscriptionId-2',
    }, {
      subscriptionId: 'fake-subscriptionId-3',
    }, {
      subscriptionId: 'fake-subscriptionId-1',
    }];
    this.stateData = {};
    _.set(this.stateData, 'subscriptions', undefined);
    _.set(this.stateData, 'LICENSE', { subscriptionId: 'fake-subscriptionId-1' });
    _.set(this.stateData, 'USER_ENTITLEMENTS_PAYLOAD', undefined);
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
      this.$httpBackend.expectGET(this.endpointUrl);
      this.AutoAssignTemplateService.getTemplates();
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

  describe('isEnabled():', () => {
    it('should reflect the status of orgSettings.autoLicenseAssignment', function (done) {
      this.$httpBackend.expectGET(this.settingsUrl).respond({
        autoLicenseAssignment: true,
      });
      this.AutoAssignTemplateService.isEnabled().then(isEnabled => {
        expect(isEnabled).toBe(true);
        _.defer(done);
      });
      this.$httpBackend.flush();
    });
  });

  describe('saveTemplate():', () => {
    it('should call POST on the internal endpoint url with the given payload', function () {
      this.$httpBackend.expectPOST(this.endpointUrl, { foo: 'bar' });
      this.AutoAssignTemplateService.saveTemplate({ foo: 'bar' });
    });
  });

  describe('updateTemplate():', () => {
    it('should call PATCH on the internal endpoint url with the given payload', function () {
      this.$httpBackend.expectPATCH(this.endpointUrl, { foo: 'bar' });
      this.AutoAssignTemplateService.updateTemplate({ foo: 'bar' });
    });
  });

  describe('activateTemplate():', () => {
    it('should call POST on the internal settings url with an empty payload and enabled=true', function () {
      this.$httpBackend.expectPOST(`${this.settingsUrl}?enabled=true`);
      this.AutoAssignTemplateService.activateTemplate();
    });
  });

  describe('deactivateTemplate():', () => {
    it('should call POST on the internal settings url with an empty payload and enabled=false', function () {
      this.$httpBackend.expectPOST(`${this.settingsUrl}?enabled=false`);
      this.AutoAssignTemplateService.deactivateTemplate();
    });
  });

  describe('deleteTemplate():', () => {
    it('should call DELETE on the internal endpoint url with the given payload', function () {
      this.$httpBackend.expectDELETE(`${this.endpointUrl}/fake-template-id-1`);
      this.AutoAssignTemplateService.deleteTemplate('fake-template-id-1');
    });
  });

  describe('convertDefaultTemplateToStateData():', () => {
    it('should convert state data given the default template payload', function () {
      spyOn(this.AutoAssignTemplateService, 'convertDefaultTemplateToStateData').and.returnValue(this.stateData);
      expect(_.get(this.AutoAssignTemplateService.convertDefaultTemplateToStateData(), 'LICENSE')).toEqual({ subscriptionId: 'fake-subscriptionId-1' });
      expect(_.get(this.AutoAssignTemplateService.convertDefaultTemplateToStateData(), 'USER_ENTITLEMENTS_PAYLOAD')).toBe(undefined);
      expect(_.get(this.AutoAssignTemplateService.convertDefaultTemplateToStateData(), 'subscriptions')).toBe(undefined);
    });
  });

  describe('getSortedSubscriptions():', () => {
    it('should initialize "sortedSubscription" property', function (done) {
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

  describe('mkPayload():', function () {
    it('should return a payload composed of a license payload, and a user-entitlements payload', function () {
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

  describe('mkLicensesPayload():', function () {
    it('should filter only selected licenses from "stateData" property', function () {
      const stateData = {
        LICENSE: {
          'fake-license-id-1': {
            isSelected: true,
            license: {
              licenseId: 'fake-license-id-1',
            },
          },
          'fake-license-id-2': {
            isSelected: true,
            license: {
              licenseId: 'fake-license-id-2',
            },
          },
          'fake-license-id-3': {
            isSelected: false,
            license: {
              licenseId: 'fake-license-id-3',
            },
          },
        },
      };
      expect(this.AutoAssignTemplateService.mkLicensesPayload(stateData)).toEqual([{
        id: 'fake-license-id-1',
        idOperation: 'ADD',
        properties: {},
      }, {
        id: 'fake-license-id-2',
        idOperation: 'ADD',
        properties: {},
      }]);
    });
  });
});

