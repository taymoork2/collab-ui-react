import routingPrefixLengthModalModule from './index';

describe('Component: extensionPrefix', () => {
  const PREFIX_INPUT = 'input#routingPrefix';
  const INPUT_TEXT_CLASS = 'div.cs-input-group.cs-input-text';
  const ERROR = 'error';

  beforeEach(function() {
    this.initModules(routingPrefixLengthModalModule);
    this.injectDependencies(
      '$scope',
    );

    this.compileComponent('ucRoutingPrefixLengthModal', {
      newRoutingPrefixLength: 'newRoutingPrefixLength',
      oldRoutingPrefixLength: 'oldRoutingPrefixLength',
      close: 'close()',
      dismiss: 'dismiss()',
    });
  });

  describe('increase extension length from 3 to 7', () => {
    beforeEach(function() {
      this.$scope.oldRoutingPrefixLength = '3';
      this.$scope.newRoutingPrefixLength = '7';
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
