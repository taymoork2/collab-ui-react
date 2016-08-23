import simultaneousCallsModule from './simultaneousCalls.component';

describe('Component: simultaneousCalls', () => {
  const TWO = 2;
  const EIGHT = 8;
  const SIM_CALLS_TWO_RADIO = 'input#simultaneousTwo';
  const SIM_CALLS_EIGHT_RADIO = 'input#simultaneousEight';

  beforeEach(function () {
    this.initModules(simultaneousCallsModule);
    this.injectDependencies(
      '$scope'
    );
    this.$scope.incomingCallMaximum = 2;
    this.$scope.onChangeFn = jasmine.createSpy('onChangeFn');
  })

  function initComponent() {
    this.compileComponent('ucSimultaneousCalls', {
      incomingCallMaximum: 'incomingCallMaximum',
      onChangeFn: 'onChangeFn(incomingCallMaximum)',
    });
  }

  describe('Simultaneous Calls (initial state)', () => {
    beforeEach(initComponent);

    it('should have a 2 radio button', function() {
      expect(this.view).toContainElement(SIM_CALLS_TWO_RADIO);
    });

    it('should have an 8 radio button', function() {
      expect(this.view).toContainElement(SIM_CALLS_EIGHT_RADIO);
    });

    it('should have the 2 radio button checked initially', function() {
      expect(this.view.find(SIM_CALLS_TWO_RADIO)).toBeChecked();
      expect(this.view.find(SIM_CALLS_EIGHT_RADIO)).not.toBeChecked();
    });
  });

  describe('Change Simultaneous Calls from 2 to 8', () => {
    beforeEach(initComponent);

    it('should invoke `onChangeFn` when SIM_CALLS_EIGHT_RADIO is clicked', function () {
      this.view.find(SIM_CALLS_EIGHT_RADIO).click().click();
      expect(this.$scope.onChangeFn).toHaveBeenCalledWith(EIGHT);
    });
  });

  describe('Change Simultaneous Calls from 8 to 2', () => {
    beforeEach(function () {
      this.$scope.incomingCallMaximum = EIGHT;
    });
    beforeEach(initComponent);

    it('should invoke `onChangeFn` when SIM_CALLS_TWO_RADIO is clicked', function () {
      this.view.find(SIM_CALLS_TWO_RADIO).click().click();
      expect(this.$scope.onChangeFn).toHaveBeenCalledWith(TWO);
    });
  });
});