import notificationTimerModule from './index';

describe('Component: callPickupNotificationTimer', () => {
  const NOTIFICATION_TIMER = 'input[name="notificationTimer"]';
  beforeEach(function () {
    this.initModules(notificationTimerModule);
    this.injectDependencies(
      '$scope',
    );
    this.$scope.onChangeFn = jasmine.createSpy('onChangeFn');
  });

  function initComponent() {
    this.compileComponent('ucCallPickupNotificationTimer', {
      notificationTimer: 'notificationTimer',
      onChangeFn: 'onChangeFn(notificationTimer)',
    });
    this.$scope.$apply();
  }

  describe('change notification settings', () => {
    beforeEach(initComponent);

    it('should change notification timer if input value is changed', function() {
      this.view.find(NOTIFICATION_TIMER).val(10).change();
      expect(this.$scope.onChangeFn).toHaveBeenCalledWith(10);
      this.view.find(NOTIFICATION_TIMER).val(130).change();
      expect(this.controller.isError).toBeTruthy();
    });

    it('should validate the notification timer', function() {
      this.controller.notificationTimer = 121;
      expect(this.controller.validate()).toBeFalsy();
      this.controller.notificationTimer = -1;
      expect(this.controller.validate()).toBeFalsy();
      this.controller.notificationTimer = 114;
      expect(this.controller.validate()).toBeTruthy();
    });
  });
});
