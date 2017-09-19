import callFeatureNameModule from './index';

describe('Component: CallFeatureName', () => {
  const TITLE = 'div.title';
  const DESC = 'div.desc';
  const NAME_INPUT = 'input';

  beforeEach(function () {
    this.initModules(callFeatureNameModule);
    this.injectDependencies(
      '$scope',
    );
    this.$scope.onChangeFn = jasmine.createSpy('onChangeFn');
    this.$scope.onKeyPressFn = jasmine.createSpy('onKeyPressFn');
    this.$scope.onNameChange = jasmine.createSpy('onNameChange');
    this.$scope.name = '';
  });

  function initComponent() {
    this.compileComponent('ucCallFeatureName', {
      placeholderKey: 'callPark.namePlaceholder',
      nameHintKey: 'callPark.nameHint',
      name: 'name',
      isNew: 'true',
      onChangeFn: 'onChangeFn(value)',
      onKeyPressFn: 'onKeyPressFn(keyCode)',
    });
  }

  describe('Call Feature Name setup assistant mode', () => {
    beforeEach(initComponent);

    it('should have an input', function() {
      expect(this.view).toContainElement(TITLE);
    });

    it('should have placeholder text', function() {
      expect(this.view).toContainElement(TITLE);
      expect(this.view.find(TITLE).get(0).innerHTML).toEqual('callPark.namePlaceholder');
    });

    it('should have hint text', function() {
      expect(this.view).toContainElement(DESC);
      expect(this.view.find(DESC).get(0).innerHTML).toEqual('callPark.nameHint');
    });

    // TODO (jlowery): figure out why this doesn't trigger onChangeFn in UT.
    xit('should call onChangeFn when name field is changed', function() {
      this.view.find(NAME_INPUT).val('you done messed up a-a-ron').change();
      expect(this.$scope.onChangeFn).toHaveBeenCalledWith('you done messed up a-a-ron');
    });

  });
});
