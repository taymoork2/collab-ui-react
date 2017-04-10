describe('Component: callParkMember', () => {
  const TYPEAHEAD_LARGE: string = '.typeahead-large';
  const TYPEAHEAD: string = '.typeahead';

  beforeEach(function() {
    this.initModules('huron.call-park-member');
    this.injectDependencies(
      '$scope',
      '$timeout',
    );
    this.$scope.onChangeFn = jasmine.createSpy('onChangeFn');
    this.$scope.onKeyPressFn = jasmine.createSpy('onKeyPressFn');
  });

  function initComponent() {
    this.compileComponent('ucCallParkMember', {
      members: 'members',
      isNew: 'isNew',
      onChangeFn: 'onChangeFn(members)',
      onKeyPressFn: 'onKeyPressFn',
    });
  }

  describe('', () => {
    beforeEach(initComponent);
    beforeEach(function() {
      this.$scope.members = [];
      this.$scope.isNew = true;
      this.$scope.$apply();
    });

    it('should show typeahead-large input when isNew = true', function() {
      expect(this.view).toContainElement(TYPEAHEAD_LARGE);
      expect(this.view).not.toContainElement(TYPEAHEAD);
    });

  });
});
