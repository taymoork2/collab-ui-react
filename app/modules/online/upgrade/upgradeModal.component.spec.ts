import onlineUpgradeModule from './index';
import { IProdInst } from 'modules/online/upgrade/upgrade.service';

describe('Component: upgradeModal', () => {
  const CANCEL_BUTTON = '.btn.btn--default';
  const BUY_BUTTON = '.btn.btn--primary';
  const productInstanceId: string = '123';
  const subscriptionId: string = '789';
  const productName: string = 'productName';
  const freemium: string = 'Free';
  const productInstanceResponse: IProdInst[] = [{
    productInstanceId: productInstanceId,
    subscriptionId: subscriptionId,
    name: productName,
    autoBilling: true,
  }];

  const freemiumInstanceResponse: IProdInst[] = [{
    productInstanceId: productInstanceId,
    subscriptionId: subscriptionId,
    name: freemium,
    autoBilling: true,
  }];

  beforeEach(function () {
    this.initModules(onlineUpgradeModule);
    this.injectDependencies(
      '$q',
      '$scope',
      '$state',
      'Analytics',
      'Auth',
      'Authinfo',
      'Notification',
      'OnlineUpgradeService',
    );

    spyOn(this.$state, 'go');
    spyOn(this.Analytics, 'trackEvent');
    spyOn(this.Auth, 'logout');
    spyOn(this.Notification, 'success');
    spyOn(this.OnlineUpgradeService, 'getSubscriptionId').and.returnValue(subscriptionId);
    spyOn(this.OnlineUpgradeService, 'cancelSubscriptions').and.returnValue(this.$q.resolve());
    spyOn(this.OnlineUpgradeService, 'dismissModal');
  });

  describe('With a product subscriptions', () => {
    beforeEach(function () {
      spyOn(this.OnlineUpgradeService, 'getProductInstances').and.returnValue(this.$q.resolve(productInstanceResponse));
      spyOn(this.OnlineUpgradeService, 'isPending').and.returnValue(false);
      spyOn(this.OnlineUpgradeService, 'isFreemium').and.returnValue(false);
      this.compileComponent('onlineUpgradeModal');
      this.$scope.$apply();
    });

    it('should have a subscriptionId', function () {
      expect(this.controller.bmmpAttr.subscriptionId).toBe(subscriptionId);
      expect(this.controller.bmmpAttr.productInstanceId).toBe(productInstanceId);
    });

    it('should successfuly cancel subscriptions', function () {
      this.view.find(CANCEL_BUTTON).click();

      expect(this.Analytics.trackEvent).toHaveBeenCalled();
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
  });

  describe('With a freemium subscription', () => {
    beforeEach(function () {
      spyOn(this.OnlineUpgradeService, 'isPending').and.returnValue(false);
      spyOn(this.OnlineUpgradeService, 'isFreemium').and.returnValue(true);
      spyOn(this.OnlineUpgradeService, 'getProductInstances').and.returnValue(this.$q.resolve(freemiumInstanceResponse));
      this.compileComponent('onlineUpgradeModal');
      this.$scope.$apply();
    });

    it('should have a subscriptionId', function () {
      expect(this.controller.bmmpAttr.subscriptionId).toBe(subscriptionId);
      expect(this.controller.bmmpAttr.productInstanceId).toBe(productInstanceId);
    });

    it('should not have a Cancel button', function () {
      expect(this.view.find(CANCEL_BUTTON)).not.toExist();
    });

    it('should have a Buy button', function () {
      expect(this.view.find(BUY_BUTTON)).toExist();
    });
  });

  describe('With a pending subscription', () => {
    beforeEach(function () {
      spyOn(this.OnlineUpgradeService, 'isPending').and.returnValue(true);
      spyOn(this.OnlineUpgradeService, 'isFreemium').and.returnValue(false);
      this.compileComponent('onlineUpgradeModal');
      this.$scope.$apply();
    });

    it('should not have a Cancel button', function () {
      expect(this.view.find(CANCEL_BUTTON)).not.toExist();
    });

    it('should not have a Buy button', function () {
      expect(this.view.find(BUY_BUTTON)).not.toExist();
    });
  });

});
