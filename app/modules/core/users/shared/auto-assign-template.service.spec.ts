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

  describe('primary behaviors:', () => {
    it('should initialize its "autoAssignTemplateUrl" property', function () {
      spyOn(this.UrlConfig, 'getAdminServiceUrl').and.returnValue('fake-admin-service-url');
      spyOn(this.Authinfo, 'getOrgId').and.returnValue('fake-org-id');
      this.injectDependencies('AutoAssignTemplateService');
      expect(this.AutoAssignTemplateService.autoAssignTemplateUrl).toBe('fake-admin-service-url/organizations/fake-org-id/templates');
    });
  });

  describe('save():', () => {
    it('should POST to the internal endpoint url with the given payload', function () {
      spyOn(this.$http, 'post').and.returnValue(this.$q.resolve());
      this.injectDependencies('AutoAssignTemplateService');
      this.AutoAssignTemplateService.autoAssignTemplateUrl = 'internal-endpoint-url';
      this.AutoAssignTemplateService.save({ foo: 'bar' });
      expect(this.$http.post).toHaveBeenCalledWith('internal-endpoint-url', { foo: 'bar' });
    });
  });
});

