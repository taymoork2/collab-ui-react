describe('Component: pgName', () => {
  const NAME_INPUT = 'input#nameInput';

  beforeEach(function () {
    this.initModules('huron.paging-group.name');
    this.injectDependencies(
      '$scope',
    );
    this.$scope.onUpdate = jasmine.createSpy('onUpdate');
  });

  function initComponent() {
    this.compileComponent('pgName', {
      onUpdate: 'onUpdate(name, isValid)',
      pagingGroupName: 'pagingGroupName',
    });

    this.$scope.pagingGroupName = '';
    this.$scope.$apply();
  }

  describe('update name', () => {
    beforeEach(initComponent);

    it('update name with correct string', function () {
      this.view.find(NAME_INPUT).val('abcd').change();
      expect(this.$scope.onUpdate).toHaveBeenCalledWith('abcd', true);
    });

    it('update name with incorrect string', function () {
      this.view.find(NAME_INPUT).val('abcd<>').change();
      expect(this.$scope.onUpdate).toHaveBeenCalledWith('abcd<>', false);
    });
  });
});
