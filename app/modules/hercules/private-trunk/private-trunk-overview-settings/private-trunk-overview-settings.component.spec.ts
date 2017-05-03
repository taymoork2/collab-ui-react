import privateTrunkOverviewSettingsModule from './index';
describe('Component: PrivateTrunkOverviewSettings component', () => {
  beforeEach(function() {
    this.initModules(privateTrunkOverviewSettingsModule);
    this.injectDependencies(
      '$state',
      'PrivateTrunkCertificateService',
      'PrivateTrunkService',
      '$q',
      '$scope',
    );
    spyOn(this.$state, 'go');

    spyOn(this.PrivateTrunkCertificateService, 'readCerts').and.returnValue(this.$q.resolve({}));
    spyOn(this.PrivateTrunkCertificateService, 'uploadCertificate').and.returnValue({});
    spyOn(this.PrivateTrunkCertificateService, 'deleteCert').and.returnValue({});
    spyOn(this.PrivateTrunkService, 'getPrivateTrunk').and.returnValue(this.$q.resolve({}));
    this.compileComponent('privateTrunkOverviewSettings', {
    });
  });

  it('should go to the Services Overview page if you do not have the feature toggle', function () {
  });

});
