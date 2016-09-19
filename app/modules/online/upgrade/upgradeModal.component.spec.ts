import onlineUpgradeModule from './index';

describe('Component: upgradeModal', () => {
  const CANCEL_BUTTON = '.btn.btn--default';

  beforeEach(function () {
    this.initModules(onlineUpgradeModule);
    this.injectDependencies(
      '$q',
      '$state',
      'Notification',
      'OnlineUpgradeService'
    );

    spyOn(this.$state, 'go');
    spyOn(this.Notification, 'success');
    spyOn(this.OnlineUpgradeService, 'getSubscriptionId').and.returnValue('123');
    spyOn(this.OnlineUpgradeService, 'cancelSubscriptions').and.returnValue(this.$q.resolve());
    spyOn(this.OnlineUpgradeService, 'dismissModal');

    this.compileComponent('onlineUpgradeModal');
  });

  it('should have a subscriptionId', function () {
    expect(this.controller.subscriptionId).toEqual('123');
  });

  it('should successfuly cancel subscriptions', function () {
    this.view.find(CANCEL_BUTTON).click();

    expect(this.OnlineUpgradeService.cancelSubscriptions).toHaveBeenCalled();
    expect(this.Notification.success).toHaveBeenCalledWith('onlineUpgradeModal.cancelSuccess');
    expect(this.OnlineUpgradeService.dismissModal).toHaveBeenCalled();
    expect(this.$state.go).toHaveBeenCalledWith('login', {
      reauthorize: true,
    }, {
      reload: true,
    });
  });

  it('should not dismiss modal when cancel subscriptions has errors', function () {
    this.OnlineUpgradeService.cancelSubscriptions.and.returnValue(this.$q.reject());
    this.view.find(CANCEL_BUTTON).click();

    expect(this.OnlineUpgradeService.cancelSubscriptions).toHaveBeenCalled();
    expect(this.OnlineUpgradeService.dismissModal).not.toHaveBeenCalled();
    expect(this.$state.go).not.toHaveBeenCalled();
  });
});
