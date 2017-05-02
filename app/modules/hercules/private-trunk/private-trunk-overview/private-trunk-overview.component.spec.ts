import privateTrunkOverviewModule from './index';
describe('Component: PrivateTrunkOverview component', () => {
  beforeEach(function() {
    this.initModules(privateTrunkOverviewModule);
    this.injectDependencies(
      '$state',
    );
    spyOn(this.$state, 'go');
    this.compileComponent('privateTrunkOverview', {
      hasPrivateTrunkFeatureToggle: false,
    });
  });

  it('should go to the Services Overview page if you do not have the feature toggle', function () {
    const backState = 'services-overview';
    expect(this.$state.go).toHaveBeenCalledWith(backState);
  });

});
