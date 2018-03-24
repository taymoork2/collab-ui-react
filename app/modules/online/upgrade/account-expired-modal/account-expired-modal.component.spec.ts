import moduleName from './index';
import { IProdInst } from 'modules/online/upgrade/shared/upgrade.service';

describe('Component: accountExpiredModal:', () => {
  const DELETE_BUTTON = '#deleteButton';
  const FREE_BUTTON = '#freeButton';
  const productInstanceId: string = '123';
  const subscriptionId: string = '789';
  const productName: string = 'productName';
  const productInstanceResponse: IProdInst[] = [{
    productInstanceId: productInstanceId,
    subscriptionId: subscriptionId,
    name: productName,
    autoBilling: true,
  }];

  const freemium: string = 'Free';
  const freemiumInstanceResponse: IProdInst[] = [{
    productInstanceId: productInstanceId,
    subscriptionId: subscriptionId,
    name: freemium,
    autoBilling: true,
  }];

  beforeEach(function () {
    this.initModules(moduleName);
    this.injectDependencies(
      '$q',
      '$scope',
      'Analytics',
      'Auth',
      'Notification',
      'OnlineUpgradeService',
      'OrganizationDeleteService',
    );

    spyOn(this.Analytics, 'trackEvent');
    spyOn(this.Auth, 'logout');
    spyOn(this.Notification, 'success');
    spyOn(this.Notification, 'errorWithTrackingId');
    spyOn(this.OnlineUpgradeService, 'dismissModal');
    spyOn(this.OnlineUpgradeService, 'getSubscriptionId').and.returnValue(subscriptionId);
    spyOn(this.OrganizationDeleteService, 'openOrgDeleteModal');
  });

  describe('Subscription has already been downgraded to freemium', () => {
    beforeEach(function () {
      spyOn(this.OnlineUpgradeService, 'isPending').and.returnValue(false);
      spyOn(this.OnlineUpgradeService, 'hasFreemiumSubscription').and.returnValue(true);
      spyOn(this.OnlineUpgradeService, 'getProductInstances').and.returnValue(this.$q.resolve(freemiumInstanceResponse));

      this.compileComponent('accountExpiredModal', {});
      this.$scope.$apply();
    });

    it('should not display the Free button', function () {
      expect(this.view.find(FREE_BUTTON)).not.toExist();
    });
  });

  describe('Subscription can be downgraded to freemium', () => {
    beforeEach(function () {
      spyOn(this.OnlineUpgradeService, 'isPending').and.returnValue(false);
      spyOn(this.OnlineUpgradeService, 'hasFreemiumSubscription').and.returnValue(false);
      spyOn(this.OnlineUpgradeService, 'getProductInstances').and.returnValue(this.$q.resolve(productInstanceResponse));
    });

    it('should downgrade and log out when Free button is clicked', function () {
      spyOn(this.OnlineUpgradeService, 'cancelSubscriptions').and.returnValue(this.$q.resolve());
      this.compileComponent('accountExpiredModal', {});
      this.$scope.$apply();

      this.view.find(FREE_BUTTON).click();

      expect(this.OnlineUpgradeService.cancelSubscriptions).toHaveBeenCalled();
      expect(this.Analytics.trackEvent).toHaveBeenCalled();
      expect(this.Notification.success).toHaveBeenCalledWith('onlineUpgradeModal.cancelSuccess');
      expect(this.OnlineUpgradeService.dismissModal).toHaveBeenCalled();
      expect(this.Auth.logout).toHaveBeenCalled();
    });

    it('should not dismiss modal and not log out when downgrade has errors', function () {
      spyOn(this.OnlineUpgradeService, 'cancelSubscriptions').and.returnValue(this.$q.reject());
      this.compileComponent('accountExpiredModal', {});
      this.$scope.$apply();

      this.view.find(FREE_BUTTON).click();

      expect(this.OnlineUpgradeService.cancelSubscriptions).toHaveBeenCalled();
      expect(this.OnlineUpgradeService.dismissModal).not.toHaveBeenCalled();
      expect(this.Auth.logout).not.toHaveBeenCalled();
    });
  });

  describe('Org can be deleted', () => {
    beforeEach(function () {
      spyOn(this.OrganizationDeleteService, 'canOnlineOrgBeDeleted').and.returnValue(this.$q.resolve(true));

      this.compileComponent('accountExpiredModal', {});
      this.$scope.$apply();
    });

    it('should open the Delete Org modal when Delete button is clicked', function () {
      this.view.find(DELETE_BUTTON).click();

      expect(this.OrganizationDeleteService.openOrgDeleteModal).toHaveBeenCalledWith('organizationDeleteModal.title.accountExpired');
    });
  });

  describe('Org cannot be deleted', () => {
    beforeEach(function () {
      spyOn(this.OrganizationDeleteService, 'canOnlineOrgBeDeleted').and.returnValue(this.$q.resolve(false));

      this.compileComponent('accountExpiredModal', {});
      this.$scope.$apply();
    });

    it('should not display a Delete button', function () {
      expect(this.view.find(DELETE_BUTTON)).not.toExist();
    });
  });
});
