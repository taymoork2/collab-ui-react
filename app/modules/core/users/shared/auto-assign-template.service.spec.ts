import moduleName from './index';

describe('Service: AutoAssignTemplateService:', () => {
  beforeEach(function() {
    this.initModules(moduleName);
    this.injectDependencies(
      '$http',
      '$q',
      'Authinfo',
      'AutoAssignTemplateService',
      'UrlConfig',
    );
    this.endpointUrl = 'fake-admin-service-url/organizations/fake-org-id/templates';
    this.settingsUrl = 'fake-admin-service-url/organizations/fake-org-id/settings/autoLicenseAssignment';
  });

  beforeEach(function () {
    spyOn(this.UrlConfig, 'getAdminServiceUrl').and.returnValue('fake-admin-service-url/');
    spyOn(this.Authinfo, 'getOrgId').and.returnValue('fake-org-id');
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

