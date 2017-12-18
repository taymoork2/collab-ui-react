import moduleName from './index';

describe('Service: AutoAssignTemplateService:', () => {
  beforeEach(function() {
    this.initModules(moduleName);
    this.injectDependencies(
      '$http',
      '$q',
      'Authinfo',
      'UrlConfig',
    );
    this.endpointUrl = 'fake-admin-service-url/organizations/fake-org-id/templates';
  });

  beforeEach(function () {
    spyOn(this.UrlConfig, 'getAdminServiceUrl').and.returnValue('fake-admin-service-url/');
    spyOn(this.Authinfo, 'getOrgId').and.returnValue('fake-org-id');
    spyOn(this.$http, 'get').and.returnValue(this.$q.resolve());
    spyOn(this.$http, 'post').and.returnValue(this.$q.resolve());
    spyOn(this.$http, 'patch').and.returnValue(this.$q.resolve());
    spyOn(this.$http, 'delete').and.returnValue(this.$q.resolve());
  });

  describe('primary behaviors:', () => {
    it('should initialize its "autoAssignTemplateUrl" property', function () {
      this.injectDependencies('AutoAssignTemplateService');
      expect(this.AutoAssignTemplateService.autoAssignTemplateUrl).toBe(this.endpointUrl);
    });
  });

  describe('getTemplates():', () => {
    it('should call GET on the internal endpoint url', function () {
      this.injectDependencies('AutoAssignTemplateService');
      this.AutoAssignTemplateService.getTemplates();
      expect(this.$http.get).toHaveBeenCalledWith(this.endpointUrl);
    });
  });

  describe('saveTemplate():', () => {
    it('should call POST on the internal endpoint url with the given payload', function () {
      this.injectDependencies('AutoAssignTemplateService');
      this.AutoAssignTemplateService.saveTemplate({ foo: 'bar' });
      expect(this.$http.post).toHaveBeenCalledWith(this.endpointUrl, { foo: 'bar' });
    });
  });

  describe('updateTemplate():', () => {
    it('should call PATCH on the internal endpoint url with the given payload', function () {
      this.injectDependencies('AutoAssignTemplateService');
      this.AutoAssignTemplateService.updateTemplate({ foo: 'bar' });
      expect(this.$http.patch).toHaveBeenCalledWith(this.endpointUrl, { foo: 'bar' });
    });
  });

  describe('deleteTemplate():', () => {
    it('should call DELETE on the internal endpoint url with the given payload', function () {
      this.injectDependencies('AutoAssignTemplateService');
      this.AutoAssignTemplateService.deleteTemplate('fake-template-id-1');
      expect(this.$http.delete).toHaveBeenCalledWith(`${this.endpointUrl}/fake-template-id-1`);
    });
  });

  describe('mkPayload():', function () {
    it('should return a payload composed of a license payload, and a user-entitlements payload', function () {
      this.injectDependencies('AutoAssignTemplateService');
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
      this.injectDependencies('AutoAssignTemplateService');
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

