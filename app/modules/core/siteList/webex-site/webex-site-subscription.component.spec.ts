import module from './index';
describe('Component: WebexSiteSubscription', function () {

  beforeEach(function () {
    this.initModules(module);
    this.injectDependencies('$componentController', '$scope', '$rootScope');
    this.$scope.fixtures = {
      currentSubscriptionId: 'sub123',
      subscriptions: [{ id: 'sub123', isPending: false } , { id: 'sub321', isPending: true }],
    };

    initSpies.apply(this);

    this.compileComponent('webexSiteSubscription', {
      subscriptions: 'fixtures.subscriptions',
      currentSubscriptionId: 'fixtures.currentSubscriptionId',
      onSubscriptionChange: 'onSubscriptionChangeFn(subId, needsSetup)',
      onValidationStatusChange: 'onValidationStatusChangeFn(isValid)',
    });
  });

  function initSpies() {
    this.$scope.onSubscriptionChangeFn = jasmine.createSpy('onSubscriptionChangeFn');
    this.$scope.onValidationStatusChangeFn = jasmine.createSpy('onValidationStatusChangeFn');
  }

  describe('When first opened', () => {
    it('should populate subscriptions list', function () {
      expect(_.includes(this.view.find('.select-options')[0].innerHTML, 'sub321')).toBeTruthy();
      expect(this.controller.subscriptions).toEqual(this.$scope.fixtures.subscriptions);
    });
  });
  describe('On selection change', () => {
    it('should, if subscription not pending, call the subscription change function with subscription id, and call validation change with TRUE', function () {
      this.controller.currentSubscription = this.$scope.fixtures.subscriptions[0];
      this.controller.setSubscription();
      expect(this.$scope.onSubscriptionChangeFn).toHaveBeenCalledWith('sub123', undefined);
      expect(this.$scope.onValidationStatusChangeFn).toHaveBeenCalledWith(true);
    });
    it('should, if subscription is pending, NOT call the subscription change function with subscription id, and call validation change with FALSE', function () {
      this.controller.currentSubscription = this.$scope.fixtures.subscriptions[1];
      this.controller.setSubscription();
      expect(this.$scope.onSubscriptionChangeFn).not.toHaveBeenCalled();
      expect(this.$scope.onValidationStatusChangeFn).toHaveBeenCalledWith(false);
    });
  });
  describe('On launchMeetingSetup', () => {
    it('should call the subscription change function with blank subscription id and TRUE as second param', function () {
      this.controller.launchMeetingSetup();
      expect(this.$scope.onSubscriptionChangeFn).toHaveBeenCalledWith('', true);
    });
  });
});

