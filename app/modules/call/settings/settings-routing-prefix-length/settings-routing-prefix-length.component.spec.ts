import routingPrefixLengthModule from './index';

describe('Component: extensionLength', () => {
  const ROUTING_PREFIX_LENGTH_SELECT = '.csSelect-container[name="routingPrefixLength"]';
  const DROPDOWN_OPTIONS = '.dropdown-menu ul li a';
  const ROUTING_PREFIX_LENGTH_FOUR = '4444';

  beforeEach(function() {
    this.initModules(routingPrefixLengthModule);
    this.injectDependencies(
      '$scope',
    );
  });

  function initComponent() {
    this.compileComponent('ucRoutingPrefixLength', {
      settingsData: 'settingsData',
      routingPrefixLengthSavedFn: 'routingPrefixLengthSavedFn()',
    });
  }

  describe('On initialization, default location with routing prefix', () => {
    beforeEach(function() {
      this.$scope.settingsData = {
        defaultLocation: {
          routingPrefix: ROUTING_PREFIX_LENGTH_FOUR,
        },
      };
      this.$scope.$apply();
    });
    beforeEach(initComponent);

    it('should have a select box with options', function() {
      expect(this.view).toContainElement(ROUTING_PREFIX_LENGTH_SELECT);
      expect(this.view.find(ROUTING_PREFIX_LENGTH_SELECT).find(DROPDOWN_OPTIONS).get(0)).toHaveText('4');
      expect(this.view.find(ROUTING_PREFIX_LENGTH_SELECT).find(DROPDOWN_OPTIONS).get(1)).toHaveText('5');
      expect(this.view.find(ROUTING_PREFIX_LENGTH_SELECT).find(DROPDOWN_OPTIONS).get(2)).toHaveText('6');
      expect(this.view.find(ROUTING_PREFIX_LENGTH_SELECT).find(DROPDOWN_OPTIONS).get(3)).toHaveText('7');
    });
  });

  describe('On initialization, no routing prefix', () => {
    beforeEach(function() {
      this.$scope.settingsData = {};
      this.$scope.$apply();
    });
    beforeEach(initComponent);

    it('should have a select box with all options', function() {
      expect(this.view).toContainElement(ROUTING_PREFIX_LENGTH_SELECT);
      expect(this.view.find(ROUTING_PREFIX_LENGTH_SELECT).find(DROPDOWN_OPTIONS).get(0)).toHaveText('0');
      expect(this.view.find(ROUTING_PREFIX_LENGTH_SELECT).find(DROPDOWN_OPTIONS).get(1)).toHaveText('1');
      expect(this.view.find(ROUTING_PREFIX_LENGTH_SELECT).find(DROPDOWN_OPTIONS).get(2)).toHaveText('2');
      expect(this.view.find(ROUTING_PREFIX_LENGTH_SELECT).find(DROPDOWN_OPTIONS).get(3)).toHaveText('3');
      expect(this.view.find(ROUTING_PREFIX_LENGTH_SELECT).find(DROPDOWN_OPTIONS).get(4)).toHaveText('4');
      expect(this.view.find(ROUTING_PREFIX_LENGTH_SELECT).find(DROPDOWN_OPTIONS).get(5)).toHaveText('5');
      expect(this.view.find(ROUTING_PREFIX_LENGTH_SELECT).find(DROPDOWN_OPTIONS).get(6)).toHaveText('6');
      expect(this.view.find(ROUTING_PREFIX_LENGTH_SELECT).find(DROPDOWN_OPTIONS).get(7)).toHaveText('7');
    });
  });
});
