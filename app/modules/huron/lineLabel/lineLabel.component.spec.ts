describe('Component: lineLabel', () => {
  const LINE_LABEL_INPUT = 'input#lineLabel';

  beforeEach(function() {
    this.initModules('huron.line-label');
    this.injectDependencies(
      '$q',
      'FeatureToggleService',
    );
    spyOn(this.FeatureToggleService, 'supports').and.returnValue(this.$q.resolve(true));
  });

  function initComponent() {
    this.compileComponent('ucLineLabel', {
      lineLabel: 'lineLabel',
    });
  }

  describe('exists line label', () => {
    beforeEach(initComponent);

    it('should show line lable input field', function() {
      expect(this.view.find(LINE_LABEL_INPUT)).toExist();
    });
  });
});
