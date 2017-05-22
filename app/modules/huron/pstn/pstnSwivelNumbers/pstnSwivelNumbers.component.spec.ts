import pstnSwivelNumbers from './index';

describe('Component: PstnSwivelNumbersComponent', () => {

  beforeEach(function () {
    this.initModules(pstnSwivelNumbers);
    this.injectDependencies(
      '$scope',
      '$timeout',
      '$q',
      'FeatureToggleService',
    );

    spyOn(this.FeatureToggleService, 'supports').and.returnValue(this.$q.resolve(true));
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
      expect(_.get(this.controller.tokenoptions, 'limit')).toEqual(250);
    });

  });
});
