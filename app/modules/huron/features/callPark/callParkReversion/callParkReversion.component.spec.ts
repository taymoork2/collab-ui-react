import { FallbackDestination } from 'modules/huron/features/callPark/services';

describe('Component: callParkReversion', () => {
  const REVERT_TO_PARKER_RADIO = 'input#radioParker';
  const REVERT_TO_DEST_RADIO = 'input#radioParkDestination';

  beforeEach(function() {
    this.initModules('huron.call-park-reversion');
    this.injectDependencies(
      '$scope'
    );
    this.$scope.onMemberRemovedFn = jasmine.createSpy('onMemberRemovedFn');
    this.$scope.onChangeFn = jasmine.createSpy('onChangeFn');
  });

  function initComponent() {
    this.compileComponent('ucCallParkReversion', {
      fallbackDestination: 'fallbackDestination',
      onMemberRemovedFn: 'onMemberRemovedFn',
      onChangeFn: 'onChangeFn(fallbackDestination)',
    });
  }

  describe('Call Revert to person who parked the call', () => {
    beforeEach(initComponent);
    beforeEach(function () {
      this.$scope.fallbackDestination = new FallbackDestination();
      this.$scope.$apply();
    });

    it('should have a Revert to parker radio button', function() {
      expect(this.view).toContainElement(REVERT_TO_PARKER_RADIO);
    });

    it('should have a Revert to destination radio button', function() {
      expect(this.view).toContainElement(REVERT_TO_DEST_RADIO);
    });

    it('should have Revert to parker checked initially', function() {
      expect(this.view.find(REVERT_TO_PARKER_RADIO)).toBeChecked();
      expect(this.view.find(REVERT_TO_DEST_RADIO)).not.toBeChecked();
    });

  });
});
