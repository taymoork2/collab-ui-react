import reportBanner from './index';

describe('Component: reportCard', function () {
  beforeEach(function () {
    this.initModules(reportBanner);
    this.injectDependencies('$componentController', '$q', '$scope', 'Analytics', 'BmmpService', 'ProPackService');

    spyOn(this.Analytics, 'trackPremiumEvent');
    spyOn(this.BmmpService, 'init');
    spyOn(this.ProPackService, 'hasProPackEnabled').and.returnValue(this.$q.resolve(true));
    spyOn(this.ProPackService, 'hasProPackPurchased').and.returnValue(this.$q.resolve(false));

    this.initController = (): void => {
      this.controller = this.$componentController('reportBmmpBanner', { }, { });
      this.$scope.$apply();
    };
    this.initController();
  });

  it('should initialize with expected defaults', function () {
    expect(this.controller.isProPackEnabled).toBeTruthy();
    expect(this.controller.isProPackPurchased).toBeFalsy();
    expect(this.BmmpService.init).toHaveBeenCalled();

    this.BmmpService.init.calls.reset();
    this.ProPackService.hasProPackPurchased.and.returnValue(this.$q.resolve(true));
    this.initController();
    expect(this.controller.isProPackEnabled).toBeTruthy();
    expect(this.controller.isProPackPurchased).toBeTruthy();
    expect(this.BmmpService.init).not.toHaveBeenCalled();
  });

  it('should call Analytics with report Banner closure variables on callBannerCloseAnalytics', function () {
    this.controller.callBannerCloseAnalytics();
    expect(this.Analytics.trackPremiumEvent).toHaveBeenCalledWith(this.Analytics.sections.PREMIUM.eventNames.BMMP_DISMISSAL, 'reports_banner');
  });
});
