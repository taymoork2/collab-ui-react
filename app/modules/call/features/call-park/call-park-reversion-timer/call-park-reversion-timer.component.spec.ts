import callParkReversionTimerModule from './index';

describe('Component: callParkReversionTimer', () => {
  const TIMER_SELECT = '.csSelect-container[name="fallbackTimer"]';
  const DROPDOWN_OPTIONS = '.dropdown-menu ul li';

  beforeEach(function() {
    this.initModules(callParkReversionTimerModule);
    this.injectDependencies(
      '$scope',
    );
    this.$scope.onChangeFn = jasmine.createSpy('onChangeFn');
  });

  function initComponent() {
    this.compileComponent('ucCallParkReversionTimer', {
      fallbackTimer: 'fallbackTimer',
      onChangeFn: 'onChangeFn(seconds)',
    });
  }

  describe('Reversion timer initial setting', () => {
    beforeEach(initComponent);
    beforeEach(function() {
      this.$scope.fallbackTimer = 120;
      this.$scope.$apply();
    });

    it('should have a select box', function() {
      expect(this.view).toContainElement(TIMER_SELECT);
    });

    it('should have 30, 45, 60, 120, 180, 300, 600, 900 as options', function() {
      expect(this.view.find(TIMER_SELECT).find(DROPDOWN_OPTIONS).get(0)).toHaveText('30');
      expect(this.view.find(TIMER_SELECT).find(DROPDOWN_OPTIONS).get(1)).toHaveText('45');
      expect(this.view.find(TIMER_SELECT).find(DROPDOWN_OPTIONS).get(2)).toHaveText('60');
      expect(this.view.find(TIMER_SELECT).find(DROPDOWN_OPTIONS).get(3)).toHaveText('120');
      expect(this.view.find(TIMER_SELECT).find(DROPDOWN_OPTIONS).get(4)).toHaveText('180');
      expect(this.view.find(TIMER_SELECT).find(DROPDOWN_OPTIONS).get(5)).toHaveText('300');
      expect(this.view.find(TIMER_SELECT).find(DROPDOWN_OPTIONS).get(6)).toHaveText('600');
      expect(this.view.find(TIMER_SELECT).find(DROPDOWN_OPTIONS).get(7)).toHaveText('900');
    });

    it('should invoke onChangeFn when an option is clicked', function() {
      this.view.find(TIMER_SELECT).find(DROPDOWN_OPTIONS).get(6).click();
      expect(this.$scope.onChangeFn).toHaveBeenCalledWith(600);
    });
  });
});
