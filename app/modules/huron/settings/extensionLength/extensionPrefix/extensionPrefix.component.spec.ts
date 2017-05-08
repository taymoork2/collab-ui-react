import extensionPrefixModule from './index';

describe('Component: extensionPrefix', () => {
  const PREFIX_INPUT = 'input#extensionPrefix';
  const INPUT_TEXT_CLASS = 'div.cs-input-group.cs-input-text';
  const ERROR = 'error';

  beforeEach(function() {
    this.initModules(extensionPrefixModule);
    this.injectDependencies(
      '$scope',
    );

    this.$scope.onChangeFn = jasmine.createSpy('close');
    this.$scope.onChangeFn = jasmine.createSpy('dismiss');

    this.compileComponent('ucExtensionPrefixModal', {
      newExtensionLength: 'newExtensionLength',
      oldExtensionLength: 'oldExtensionLength',
      close: 'close()',
      dismiss: 'dismiss()',
    });
  });

  describe('increase extension length from 3 to 7', () => {
    beforeEach(function() {
      this.$scope.oldExtensionLength = '3';
      this.$scope.newExtensionLength = '7';
      this.$scope.$apply();
    });

    it('should have an input box', function() {
      expect(this.view).toContainElement(PREFIX_INPUT);
    });

    it('should display an error when less than 4 digits are entered', function() {
      this.view.find(PREFIX_INPUT).val('2').change().blur();
      expect(this.view.find(INPUT_TEXT_CLASS).first()).toHaveClass(ERROR);
    });

  });

});
