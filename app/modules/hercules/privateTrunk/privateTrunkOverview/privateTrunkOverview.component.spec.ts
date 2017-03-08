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
    this.compileComponent('privateTrunkOverview', {});
  });
  it('should open privateTrunkSetup modal', function () {
    expect(this.$modal.open).toHaveBeenCalled();
  });

});
