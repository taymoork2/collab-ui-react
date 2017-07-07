describe('Component: lineLabel', () => {
  const LINE_LABEL_INPUT = 'input#lineLabel';

  const lineLabel = '1234 - someone@some.com';

  beforeEach(function() {
    this.initModules('huron.line-label');
    this.injectDependencies(
      '$q',
      'FeatureToggleService',
      '$scope',
    );
    spyOn(this.FeatureToggleService, 'supports').and.returnValue(this.$q.resolve(true));
  });

  function initComponent() {
    this.compileComponent('ucLineLabel', {
      lineLabel: 'lineLabel',
    });

    this.$scope.lineLabel = lineLabel;
    this.$scope.$apply();
  }

  describe('exists line label', () => {
    beforeEach(initComponent);

    it('should show line lable input field', function() {
      expect(this.view.find(LINE_LABEL_INPUT)).toExist();
      expect(this.view.find(LINE_LABEL_INPUT).val()).toEqual('1234 - someone@some.com');
    });
  });
});
