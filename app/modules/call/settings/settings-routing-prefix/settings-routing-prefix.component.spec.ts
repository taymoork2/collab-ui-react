import routingPrefixModule from './index';

const NONE_RADIO = 'input#routingPrefixNone';
const RESERVE_RADIO = 'input#routingPrefixReserve';
const PREFIX_INPUT = 'input#dialingPrefix';
const ROUTING_PREFIX = '8100';

describe('Component: routingPrefix', () => {
  beforeEach(function() {
    this.initModules(routingPrefixModule);
    this.injectDependencies(
      '$scope',
    );

    this.$scope.onChangeFn = jasmine.createSpy('onChangeFn');

    this.compileComponent('ucRoutingPrefix', {
      routingPrefix: 'routingPrefix',
      onChangeFn: 'onChangeFn(routingPrefix)',
    });
  });

  describe('Initial state: Routing Prefix None', () => {
    beforeEach(function() {
      this.$scope.routingPrefix = null;
      this.$scope.$apply();
    });

    it('should have "None" and "Reserve" radio buttons', function() {
      expect(this.view).toContainElement(NONE_RADIO);
      expect(this.view).toContainElement(RESERVE_RADIO);
    });

    it('should have None selected by default', function() {
      expect(this.view).toContainElement(NONE_RADIO);
      expect(this.view.find(NONE_RADIO)).toBeChecked();
    });

    it('should not show prefix input box', function() {
      expect(this.view).not.toContainElement(PREFIX_INPUT);
    });
  });

  describe('Reserve a Prefix: Routing Prefix None', () => {
    beforeEach(function() {
      this.$scope.routingPrefix = null;
      this.$scope.$apply();
    });

    it('should have None radio selected by default', function() {
      expect(this.view).toContainElement(NONE_RADIO);
      expect(this.view).toContainElement(RESERVE_RADIO);
      expect(this.view.find(NONE_RADIO)).toBeChecked();
      expect(this.view.find(RESERVE_RADIO)).not.toBeChecked();
    });

    it('should show prefix input when Reserve a Prefix radio is clicked', function() {
      this.view.find(RESERVE_RADIO).click().click();
      expect(this.view).toContainElement(PREFIX_INPUT);
    });

    it('should call onChangeFn with prefix when a prefix is entered', function() {
      this.view.find(RESERVE_RADIO).click().click();
      this.view.find(PREFIX_INPUT).val(ROUTING_PREFIX).change();
      expect(this.$scope.onChangeFn).toHaveBeenCalledWith(ROUTING_PREFIX);
    });
  });

  describe('Initial state: Routing Prefix set', function() {
    beforeEach(function() {
      this.$scope.routingPrefix = ROUTING_PREFIX;
      this.$scope.$apply();
    });

    it('should have Reserve a Prefix radio selected', function() {
      expect(this.view).toContainElement(NONE_RADIO);
      expect(this.view).toContainElement(RESERVE_RADIO);
      expect(this.view.find(NONE_RADIO)).not.toBeChecked();
      expect(this.view.find(RESERVE_RADIO)).toBeChecked();
    });

    it('should show prefix input with routing prefix passed in', function() {
      expect(this.view).toContainElement(PREFIX_INPUT);
      expect(this.view.find(PREFIX_INPUT).val()).toEqual(ROUTING_PREFIX);
    });

    it('should not show prefix input when None is selected', function() {
      expect(this.view.find(RESERVE_RADIO)).toBeChecked();
      expect(this.view).toContainElement(PREFIX_INPUT);
      this.view.find(NONE_RADIO).click().click();
      expect(this.view.find(NONE_RADIO)).toBeChecked();
      expect(this.view.find(RESERVE_RADIO)).not.toBeChecked();
      expect(this.view).not.toContainElement(PREFIX_INPUT);
    });

    it('should call onChangeFn with null when None is selected', function() {
      expect(this.view.find(RESERVE_RADIO)).toBeChecked();
      expect(this.view).toContainElement(PREFIX_INPUT);
      this.view.find(NONE_RADIO).click().click();
      expect(this.$scope.onChangeFn).toHaveBeenCalledWith(null);
    });
  });

});
