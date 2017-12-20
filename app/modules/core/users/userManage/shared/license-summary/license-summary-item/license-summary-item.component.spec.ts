import moduleName from './index';

describe('Component: licenseSummaryItem:', () => {
  beforeEach(function() {
    this.initModules(moduleName);
    this.injectDependencies(
      '$scope',
    );
  });

  beforeEach(function () {
    this.$scope.fakeLabel = 'fakeLabel';
  });

  describe('primary behaviors (view):', () => {
    it('should render nothing', function () {
      this.compileComponent('licenseSummaryItem', {});
      expect(this.view.find('.license-summary-item').length).toBe(0);
    });

    it('should render given a title, usage and volume', function () {
      this.compileComponent('licenseSummaryItem', {
        totalUsage: 3,
        totalVolume: 3,
        l10nTitle: this.$scope.fakeLabel,
      });
      expect(this.view.find('cs-donut').length).toBe(1);
      expect(this.view.find('usage-line').length).toBe(1);
    });
  });

});
