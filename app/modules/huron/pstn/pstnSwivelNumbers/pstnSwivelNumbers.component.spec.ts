describe('Component: pstn-swivelNumbers', () => {

  beforeEach(function () {
    this.initModules('huron.pstn-swivelNumbers');
    this.injectDependencies(
      '$scope',
      '$timeout',
    );
  });

  function initComponent() {
    this.compileComponent('ucPstnSwivelNumbers', {
      numbers: 'numbers',
    });
    spyOn(this.controller, 'setSwivelNumberTokens');
  }

  describe('init', () => {
    beforeEach(initComponent);

    it('should be initialized', function () {
      this.$timeout.flush();
      expect(this.controller.setSwivelNumberTokens).toHaveBeenCalled();
    });

  });
});
