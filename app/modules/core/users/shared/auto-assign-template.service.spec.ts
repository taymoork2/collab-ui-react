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
});

