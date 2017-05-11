import subscriptionModule from './index';

describe('Controller: SubscriptionHeaderCtrl', function () {
  beforeEach(function () {
    this.initModules(subscriptionModule);
    this.injectDependencies('$controller', '$rootScope', '$scope');

    this.controller = this.$controller('SubscriptionHeaderCtrl', {
      $scope: this.$scope,
    });
    this.$scope.$apply();
  });

  it('should default to all false or undefined', function () {
    expect(this.controller.isTrial).toBeFalsy();
    expect(this.controller.isOnline).toBeFalsy();
    expect(this.controller.upgradeUrl).toBe(undefined);
  });

  it('should update on broadcast with one subscription', function () {
    this.$rootScope.$broadcast('SUBSCRIPTION::upgradeData', {
      isOnline: true,
      isTrial: true,
      productInstanceId: 'productInstanceId',
      upgradeTrialUrl: 'Url',
      numSubscriptions: 1,
    });
    expect(this.controller.isTrial).toBeTruthy();
    expect(this.controller.isOnline).toBeTruthy();
    expect(this.controller.productInstanceId).toBe('productInstanceId');
    expect(this.controller.upgradeTrialUrl).toBe('Url');
  });

  it('should not update on broadcast with multiple subscriptions', function () {
    this.$rootScope.$broadcast('SUBSCRIPTION::upgradeData', {
      isOnline: true,
      isTrial: true,
      productInstanceId: 'productInstanceId',
      upgradeTrialUrl: 'Url',
      numSubscriptions: 2,
    });
    expect(this.controller.isTrial).toBeFalsy();
    expect(this.controller.isOnline).toBeFalsy();
  });
});
