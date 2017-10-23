import privateTrunkOverviewSettingsModule from './index';
describe('Component: PrivateTrunkOverviewSettings component', () => {
  beforeEach(function() {
    this.initModules(privateTrunkOverviewSettingsModule);
    this.injectDependencies(
      '$state',
      'CiscoCollaborationCloudCertificateService',
      'PrivateTrunkService',
      'PrivateTrunkPrereqService',
      '$q',
      '$scope',
      'Authinfo',
      'Notification',
      '$httpBackend',
    );
    spyOn(this.$state, 'go');
    this.$state.current.name = 'services-overview';

    spyOn(this.Authinfo, 'getOrgId').and.returnValue('1234');
    this.$httpBackend.whenGET('https://identity.webex.com/identity/scim/1234/v1/Users/me').respond(200);

    spyOn(this.PrivateTrunkPrereqService, 'getVerifiedDomains').and.returnValue(this.$q.resolve([]));
    spyOn(this.CiscoCollaborationCloudCertificateService, 'readCerts').and.returnValue(this.$q.resolve({}));
    spyOn(this.CiscoCollaborationCloudCertificateService, 'uploadCertificate').and.returnValue({});
    spyOn(this.CiscoCollaborationCloudCertificateService, 'deleteCert').and.returnValue({});
    spyOn(this.PrivateTrunkService, 'getPrivateTrunk').and.returnValue(this.$q.resolve({}));
    spyOn(this.PrivateTrunkService, 'setPrivateTrunk').and.returnValue(this.$q.resolve({}));
    this.compileComponent('privateTrunkOverviewSettings', {
      hasPrivateTrunkFeatureToggle: false,
    });
  });

  it('should go to the Services Overview page if feature toggle not enabled', function () {
    const backState = 'services-overview';
    expect(this.$state.go).toHaveBeenCalledWith(backState);
  });

});
