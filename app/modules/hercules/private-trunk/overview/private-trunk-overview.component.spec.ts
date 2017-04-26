import privateTrunkOverviewModule from './index';
describe('Component: PrivateTrunkOverview component', () => {
  beforeEach(function() {
    this.initModules(privateTrunkOverviewModule);
    this.injectDependencies(
      '$state',
      'PrivateTrunkCertificateService',
      '$q',
      '$scope',
    );
    spyOn(this.$state, 'go');
    spyOn(this.PrivateTrunkCertificateService, 'readCerts').and.returnValue(this.$q.resolve({}));
    spyOn(this.PrivateTrunkCertificateService, 'uploadCertificate').and.returnValue({});
    spyOn(this.PrivateTrunkCertificateService, 'deleteCert').and.returnValue({});

    this.compileComponent('privateTrunkOverview', {
      hasPrivateTrunkFeatureToggle: false,
    });
  });

  it('should go to the Services Overview page if you do not have the feature toggle', function () {
    const backState = 'services-overview';
    expect(this.$state.go).toHaveBeenCalledWith(backState);
  });

});
