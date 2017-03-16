import testModule from './index';

describe('Directive: selectOn', () => {
  beforeEach(function () {
    this.initModules(testModule);
    this.injectDependencies(
      '$scope',
      '$timeout',
    );
  });

  describe('without conditional attribute', () => {
    beforeEach(function () {
      this.compileTemplate('<div><input type="text" value="my text" select-on></div>');
      document.body.appendChild(this.view[0]);
      // should flush without error
      expect(this.$timeout.flush).not.toThrow();
    });

    it('should immediately select the input text', function () {
      expect(window.getSelection().toString()).toBe('my text');
    });
  });

  describe('with conditional attribute', () => {
    beforeEach(function () {
      this.$scope.shouldSelect = false;
      this.compileTemplate('<div><input type="text" value="my text" select-on="shouldSelect"></div>');
      document.body.appendChild(this.view[0]);
      // TODO: should throw error because nothing to flush yet,
      // but there is a queued deferred from `$state` injection
      // https://github.com/angular-ui/ui-router/issues/3365
      // https://github.com/angular/angular.js/issues/14336
      _.attempt(this.$timeout.flush);
    });

    it('should only select the input text when condition is truthy', function () {
      expect(window.getSelection().toString()).toBe('');

      this.$scope.shouldSelect = true;
      this.$scope.$apply();
      this.$timeout.flush();
      expect(window.getSelection().toString()).toBe('my text');
    });
  });
});
