import onlineUpgradeModule from './index';
import { IProdInst } from 'modules/online/upgrade/shared/upgrade.service';

describe('Component: upgradeModal', () => {
  const MORE_OPTIONS_BUTTON = '#moreOptionsButton';
  const BUY_BUTTON = '#buyButton';
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
      '$modal',
      '$scope',
      'Analytics',
      'Auth',
      'Authinfo',
      'Notification',
      'OnlineUpgradeService',
      'OrganizationDeleteService',
    );

    spyOn(this.$modal, 'open');
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

    it('should open the second Account Expired dialog when the More Options button is clicked', function () {
      this.view.find(MORE_OPTIONS_BUTTON).click();

      expect(this.$modal.open).toHaveBeenCalledWith({
        template: '<account-expired-modal dismiss="$dismiss()"></account-expired-modal>',
        backdrop: 'static',
        keyboard: false,
      });
    });

    // the child element bmmp click event will still occur and do whatever it should
    it('should logout when Buy button is clicked', function () {
      this.view.find(BUY_BUTTON).click();

      expect(this.Auth.logout).toHaveBeenCalled();
    });
  });

  describe('With a freemium subscription in deletable org', () => {
    beforeEach(function () {
      spyOn(this.OnlineUpgradeService, 'isPending').and.returnValue(false);
      spyOn(this.OnlineUpgradeService, 'isFreemium').and.returnValue(true);
      spyOn(this.OnlineUpgradeService, 'getProductInstances').and.returnValue(this.$q.resolve(freemiumInstanceResponse));
      spyOn(this.OrganizationDeleteService, 'canOnlineOrgBeDeleted').and.returnValue(this.$q.resolve(true));
      this.compileComponent('onlineUpgradeModal');
      this.$scope.$apply();
    });

    it('should have a subscriptionId', function () {
      expect(this.controller.bmmpAttr.subscriptionId).toBe(subscriptionId);
      expect(this.controller.bmmpAttr.productInstanceId).toBe(productInstanceId);
    });

    it('should have a More Options button', function () {
      expect(this.view.find(MORE_OPTIONS_BUTTON)).toExist();
    });

    it('should have a Buy button', function () {
      expect(this.view.find(BUY_BUTTON)).toExist();
    });
  });

  describe('With a freemium subscription in non-deletable org', () => {
    beforeEach(function () {
      spyOn(this.OnlineUpgradeService, 'isPending').and.returnValue(false);
      spyOn(this.OnlineUpgradeService, 'isFreemium').and.returnValue(true);
      spyOn(this.OnlineUpgradeService, 'getProductInstances').and.returnValue(this.$q.resolve(freemiumInstanceResponse));
      spyOn(this.OrganizationDeleteService, 'canOnlineOrgBeDeleted').and.returnValue(this.$q.resolve(false));
      this.compileComponent('onlineUpgradeModal');
      this.$scope.$apply();
    });

    it('should not have a More Options button', function () {
      expect(this.view.find(MORE_OPTIONS_BUTTON)).not.toExist();
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

    it('should not have a More Options button', function () {
      expect(this.view.find(MORE_OPTIONS_BUTTON)).not.toExist();
    });

    it('should not have a Buy button', function () {
      expect(this.view.find(BUY_BUTTON)).not.toExist();
    });
  });

});
