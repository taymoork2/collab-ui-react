import testModule from './index';

describe('Directive: focusOn', () => {
  beforeEach(function () {
    this.initModules(testModule);
    this.injectDependencies(
      '$scope',
      '$timeout',
    );
  });

  describe('without conditional attribute', () => {
    beforeEach(function () {
      this.compileTemplate('<div><input type="text" focus-on></div>');
      document.body.appendChild(this.view[0]);
      this.$timeout.flush();
    });

    it('should immediately focus the input', function () {
      expect(this.view.find('input')).toBeFocused();
    });
  });

  describe('with conditional attribute', () => {
    beforeEach(function () {
      this.$scope.shouldFocus = false;
      this.compileTemplate('<div><input type="text" focus-on="shouldFocus"></div>');
      document.body.appendChild(this.view[0]);
      this.$timeout.flush();
    });

    it('should only focus the input when condition is truthy', function () {
      expect(this.view.find('input')).not.toBeFocused();

      this.$scope.shouldFocus = true;
      this.$scope.$apply();
      this.$timeout.flush();
      expect(this.view.find('input')).toBeFocused();
    });
  });
});
