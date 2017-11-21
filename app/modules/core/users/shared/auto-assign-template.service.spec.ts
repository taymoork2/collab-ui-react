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
  });

  beforeEach(function () {
    spyOn(this.UrlConfig, 'getAdminServiceUrl').and.returnValue('fake-admin-service-url/');
    spyOn(this.Authinfo, 'getOrgId').and.returnValue('fake-org-id');
  });

  describe('primary behaviors:', () => {
    it('should initialize its "autoAssignTemplateUrl" property', function () {
      this.injectDependencies('AutoAssignTemplateService');
      expect(this.AutoAssignTemplateService.autoAssignTemplateUrl).toBe('fake-admin-service-url/organizations/fake-org-id/templates');
    });
  });

  describe('save():', () => {
    it('should POST to the internal endpoint url with the given payload', function () {
      spyOn(this.$http, 'post').and.returnValue(this.$q.resolve());
      this.injectDependencies('AutoAssignTemplateService');
      this.AutoAssignTemplateService.save({ foo: 'bar' });
      const endpointUrl = 'fake-admin-service-url/organizations/fake-org-id/templates';
      expect(this.$http.post).toHaveBeenCalledWith(endpointUrl, { foo: 'bar' });
    });
  });
});

