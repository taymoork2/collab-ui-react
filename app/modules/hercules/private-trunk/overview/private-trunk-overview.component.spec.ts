'use strict';

describe('Component: PrivateTrunkOverview component', () => {
  beforeEach(function() {
    this.initModules('hercules.private-trunk-overview');
    this.injectDependencies(
      '$scope',
      '$modal',
      '$q',
    );
    spyOn(this.$modal, 'open').and.returnValue({ result: this.$q.resolve() });
    this.hasPrivateTrunkFeatureToggle = true;
    this.compileComponent('privateTrunkOverview', {
      hasPrivateTrunkFeatureToggle: true,
    });
  });
  it('should open privateTrunkSetup modal', function () {
    expect(this.$modal.open).toHaveBeenCalled();
  });

});
