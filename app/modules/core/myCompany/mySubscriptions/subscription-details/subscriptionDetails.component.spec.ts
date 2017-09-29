import subscriptionModule from 'modules/core/myCompany/mySubscriptions/index';

describe('Component: subscription details', function () {
  beforeEach(function () {
    this.initModules(subscriptionModule);
    this.injectDependencies('$componentController', '$q', '$scope', '$translate', 'ProPackService');

    spyOn(this.ProPackService, 'hasProPackPurchased').and.returnValue(this.$q.resolve(true));
    spyOn(this.$translate, 'instant').and.callThrough();

    this.subscription = _.cloneDeep(getJSONFixture('core/json/myCompany/subscriptionData.json')).premiumSubscription[0];

    this.initController = (): void => {
      this.controller = this.$componentController('subscriptionDetails', {}, {
        subscription: this.subscription,
      });
      this.controller.$onInit();
      this.$scope.$apply();
    };
    this.initController();
  });

  it('should return proPack status for getProPackStatus', function () {
    expect(this.controller.getProPackStatus()).toBeTruthy();
  });

  it('should return string for getUsage', function () {
    expect(this.controller.getUsage(this.subscription.proPack)).toEqual('8/100');
  });

  it('getView and toggleView should return/control viewAll', function () {
    expect(this.controller.getView()).toBeFalsy();

    this.controller.toggleView();
    expect(this.controller.getView()).toBeTruthy();
  });

  it('getWarning should return true only when usage is greater than volume', function () {
    expect(this.controller.getWarning(this.subscription.proPack)).toBeFalsy();
    expect(this.controller.getWarning({
      usage: 100,
      volume: 50,
    })).toBeTruthy();
  });

  it('getQuantity should return the number of license types displayed', function () {
    expect(this.controller.getQuantity()).toEqual(2);

    this.ProPackService.hasProPackPurchased.and.returnValue(this.$q.resolve(false));
    this.initController();
    expect(this.controller.getQuantity()).toEqual(1);
  });

  it('getLicenseName should return the $translated name', function () {
    const offerName: string = `subscriptions.licenseTypes.${this.subscription.proPack.offerName}`;
    expect(this.controller.getLicenseName(this.subscription.proPack.offerName)).toEqual(offerName);
    expect(this.$translate.instant).toHaveBeenCalledWith(offerName);
  });

  it('isTotalUsage and isUsage should return true/false depending on which one has been set', function () {
    const totalUsage = { totalUsage: 2 };
    const usage = { usage: 2 };

    expect(this.controller.isTotalUsage(totalUsage)).toBeTruthy();
    expect(this.controller.isTotalUsage(usage)).toBeFalsy();

    expect(this.controller.isUsage(totalUsage)).toBeFalsy();
    expect(this.controller.isUsage(usage)).toBeTruthy();
  });
});
