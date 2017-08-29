import callPickupNotifications from './index';

describe('Component: callPickupNotifications', () => {
  const PLAY_SOUND = 'input#playSound';
  const DISPLAY_CALLED = 'input#displayCalledParty';
  const DISPLAY_CALLING = 'input#displayCallingParty';
  beforeEach(function () {
    this.initModules(callPickupNotifications);
    this.injectDependencies(
      '$scope',
    );
    this.$scope.onChangeFn = jasmine.createSpy('onChangeFn');
  });

  function initComponent() {
    this.compileComponent('ucCallPickupNotifications', {
      onChangeFn: 'onChangeFn(playSound, displayCalledParty, displayCallingParty)',
      displayCallingParty: 'displayCallingParty',
      displayCalledParty: 'displayCalledParty',
      playSound: 'playSound',
    });
    this.$scope.$apply();
  }

  describe('change notification settings', () => {
    beforeEach(initComponent);

    it('should change notification settings if play sound input is changed', function() {
      this.view.find(PLAY_SOUND).click();
      this.view.find(DISPLAY_CALLED).click();
      this.view.find(DISPLAY_CALLED).click();
      this.view.find(DISPLAY_CALLING).click();
      expect(this.$scope.onChangeFn).toHaveBeenCalledTimes(4);
      expect(this.$scope.onChangeFn).toHaveBeenCalledWith(true, false, true);
    });
  });
});
