import onlineUpgradeModule from './index';
import { IProdInst } from 'modules/online/upgrade/upgrade.service';

describe('Component: upgradeModal', () => {
  const CANCEL_BUTTON = '.btn.btn--default';
  const BUY_BUTTON = '.btn.btn--primary';
  const productInstanceId: string = '123';
  const subscriptionId: string = '789';
  const productName: string = 'productName';
  const productInstanceResponse: IProdInst[] = [{
    productInstanceId: productInstanceId,
    subscriptionId: subscriptionId,
    name: productName,
    autoBilling: true,
  }];

  beforeEach(function () {
    this.initModules(onlineUpgradeModule);
    this.injectDependencies(
      '$q',
      '$scope',
      '$state',
      'Auth',
      'FeatureToggleService',
      'Notification',
      'OnlineUpgradeService',
    );

    spyOn(this.$state, 'go');
    spyOn(this.Auth, 'logout');
    spyOn(this.Notification, 'success');
    spyOn(this.FeatureToggleService, 'atlas2017NameChangeGetStatus').and.returnValue(this.$q.resolve(false));
    spyOn(this.OnlineUpgradeService, 'getSubscriptionId').and.returnValue(subscriptionId);
    spyOn(this.OnlineUpgradeService, 'getProductInstances').and.returnValue(this.$q.resolve(productInstanceResponse));
    spyOn(this.OnlineUpgradeService, 'cancelSubscriptions').and.returnValue(this.$q.resolve());
    spyOn(this.OnlineUpgradeService, 'dismissModal');

    this.compileComponent('onlineUpgradeModal');
    this.$scope.$apply();
  });

  it('should have a subscriptionId', function () {
    expect(this.controller.bmmpAttr.subscriptionId).toEqual(subscriptionId);
    expect(this.controller.bmmpAttr.productInstanceId).toEqual(productInstanceId);
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

  // the child element bmmp click event will still occur and do whatever it should
  it('should logout when bmmp upgrade button is clicked', function () {
    this.view.find(BUY_BUTTON).click();

    expect(this.Auth.logout).toHaveBeenCalled();
  });

  // 2017 name change
  describe('atlas2017NameChangeGetStatus - ', function () {
    it('should have base name when toggle is false', function () {
      expect(this.view.text()).toContain('onlineUpgradeModal.cancelBody');
      expect(this.view.text()).not.toContain('onlineUpgradeModal.cancelBodyNew');
    });

    it('should have the new name when toggle is true', function () {
      this.FeatureToggleService.atlas2017NameChangeGetStatus.and.returnValue(this.$q.resolve(true));
      this.compileComponent('onlineUpgradeModal');
      this.$scope.$apply();
      expect(this.view.text()).toContain('onlineUpgradeModal.cancelBodyNew');
    });
  });
});
