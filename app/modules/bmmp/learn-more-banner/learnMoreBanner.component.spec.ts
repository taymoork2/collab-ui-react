import overviewBanner from './index';

describe('Component: learnMoreBanner', function () {
  beforeEach(function () {
    this.initModules(overviewBanner);
    this.injectDependencies(
      '$componentController',
      '$q',
      '$scope',
      '$state',
      'Analytics',
      'Authinfo',
      'BmmpService',
      'ProPackService',
      'LearnMoreBannerService',
    );

    spyOn(this.Analytics, 'trackPremiumEvent');
    spyOn(this.Authinfo, 'isEnterpriseCustomer').and.returnValue(true);
    spyOn(this.BmmpService, 'init');
    spyOn(this.ProPackService, 'hasProPackEnabledAndNotPurchased').and.returnValue(this.$q.resolve(true));
    spyOn(this.LearnMoreBannerService, 'isElementVisible').and.returnValue(true);

    this.reportBanner = 'learnMoreReportBanner';
    this.overviewBanner = 'learnMoreOverviewBanner';

    this.$element = {
      find: jasmine.createSpy('find').and.callFake((elementName: string): any => {
        return {
          on: (event: string, callback: Function): void => {
            expect(event).toEqual('click');
            callback();
            if (elementName === this.LearnMoreBannerService.CLOSE_ELEMENTS[this.location]) {
              expect(this.Analytics.trackPremiumEvent).toHaveBeenCalledWith(this.Analytics.sections.PREMIUM.eventNames.BMMP_DISMISSAL, `${this.location}_banner`);
              this.Analytics.trackPremiumEvent.calls.reset();
            } else {
              expect(this.Analytics.trackPremiumEvent).toHaveBeenCalledWith(this.Analytics.sections.PREMIUM.eventNames.LEARN_MORE, `${this.location}_banner`);
              this.Analytics.trackPremiumEvent.calls.reset();
            }
          },
        };
      }),
    };

    this.initController = (banner): void => {
      this.controller = this.$componentController(banner, { $element: this.$element }, { });
      this.controller.$onInit();
      this.$scope.$apply();
    };
  });

  it('learnMoreReportBanner - should work as expected', function () {
    spyOn(this.Authinfo, 'isReadOnlyAdmin').and.returnValue(false);
    this.location = 'reports';
    this.$state.current = { name: 'reports.spark' };
    this.initController(this.reportBanner);

    expect(this.controller.isReadOnly).toBeFalsy();
    expect(this.controller.show()).toBeTruthy();
    expect(this.BmmpService.init).toHaveBeenCalled();

    this.BmmpService.init.calls.reset();
    this.Authinfo.isReadOnlyAdmin.and.returnValue(true);
    this.ProPackService.hasProPackEnabledAndNotPurchased.and.returnValue(this.$q.resolve(false));
    this.initController(this.reportBanner);

    expect(this.controller.isReadOnly).toBeTruthy();
    expect(this.controller.show()).toBeFalsy();
    expect(this.BmmpService.init).not.toHaveBeenCalled();
  });

  it('learnMoreOverviewBanner - should work as expected', function () {
    spyOn(this.Authinfo, 'isReadOnlyAdmin').and.returnValue(true);
    this.location = 'overview';
    this.$state.current = { name: this.location };
    this.initController(this.overviewBanner);

    expect(this.controller.isReadOnly).toBeTruthy();
    expect(this.controller.show()).toBeTruthy();
    expect(this.BmmpService.init).toHaveBeenCalled();

    this.BmmpService.init.calls.reset();
    this.Authinfo.isReadOnlyAdmin.and.returnValue(true);
    this.ProPackService.hasProPackEnabledAndNotPurchased.and.returnValue(this.$q.resolve(false));
    this.initController(this.overviewBanner);

    expect(this.controller.isReadOnly).toBeTruthy();
    expect(this.controller.show()).toBeFalsy();
    expect(this.BmmpService.init).not.toHaveBeenCalled();
  });
});
