import extensionLengthModule from './index';

describe('Component: extensionLength', () => {
  const EXTENSION_LENGTH_SELECT = '.csSelect-container[name="extensionLength"]';
  const DROPDOWN_OPTIONS = '.dropdown-menu ul li a';
  const SELECT_TOGGLE = '.select-toggle';
  const EXTENSION_LENGTH_THREE = '3';
  const EXTENSION_LENGTH_TEN = '10';

  beforeEach(function() {
    this.initModules(extensionLengthModule);
    this.injectDependencies(
      '$scope',
    );

    this.$scope.onChangeFn = jasmine.createSpy('onChangeFn');

    this.compileComponent('ucExtensionLength', {
      firstTimeSetup: 'firstTimeSetup',
      extensionLength: 'extensionLength',
      onChangeFn: 'onChangeFn(extensionLength)',
    });

    this.$scope.extensionLength = EXTENSION_LENGTH_THREE;
  });

  describe('firstTimeSetup = true', () => {
    beforeEach(function() {
      this.$scope.firstTimeSetup = true;
      this.$scope.$apply();
    });

    it('should have a select box with options', function() {
      expect(this.view).toContainElement(EXTENSION_LENGTH_SELECT);
      expect(this.view.find(EXTENSION_LENGTH_SELECT).find(DROPDOWN_OPTIONS).get(0)).toHaveText('3');
      expect(this.view.find(EXTENSION_LENGTH_SELECT).find(DROPDOWN_OPTIONS).get(1)).toHaveText('4');
      expect(this.view.find(EXTENSION_LENGTH_SELECT).find(DROPDOWN_OPTIONS).get(2)).toHaveText('5');
      expect(this.view.find(EXTENSION_LENGTH_SELECT).find(DROPDOWN_OPTIONS).get(3)).toHaveText('6');
      expect(this.view.find(EXTENSION_LENGTH_SELECT).find(DROPDOWN_OPTIONS).get(4)).toHaveText('7');
      expect(this.view.find(EXTENSION_LENGTH_SELECT).find(DROPDOWN_OPTIONS).get(5)).toHaveText('8');
      expect(this.view.find(EXTENSION_LENGTH_SELECT).find(DROPDOWN_OPTIONS).get(6)).toHaveText('9');
      expect(this.view.find(EXTENSION_LENGTH_SELECT).find(DROPDOWN_OPTIONS).get(7)).toHaveText('10');
    });

    it('should not be disabled when firstTimeSetup = true', function() {
      expect(this.view.find(EXTENSION_LENGTH_SELECT).find(SELECT_TOGGLE)).not.toHaveClass('disabled');
    });

    it('should invoke onChangeFn when an extension length is chosen', function() {
      this.view.find(EXTENSION_LENGTH_SELECT).find(DROPDOWN_OPTIONS).get(7).click();
      expect(this.$scope.onChangeFn).toHaveBeenCalledWith(EXTENSION_LENGTH_TEN);
    });
  });

  describe('firstTimeSetup = false', () => {
    beforeEach(function() {
      this.$scope.firstTimeSetup = false;
      this.$scope.$apply();
    });

    it('should be disabled when firstTimeSetup = false', function() {
      expect(this.view.find(EXTENSION_LENGTH_SELECT).find(SELECT_TOGGLE)).toHaveClass('disabled');
    });
  });

});
