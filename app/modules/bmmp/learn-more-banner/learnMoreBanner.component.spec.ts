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
    spyOn(this.Authinfo, 'isReadOnlyAdmin').and.returnValue(false);
    spyOn(this.BmmpService, 'init');
    spyOn(this.ProPackService, 'hasProPackEnabledAndNotPurchased').and.returnValue(this.$q.resolve(true));
    spyOn(this.LearnMoreBannerService, 'isElementVisible').and.returnValue(true);

    this.location = 'reports';
    this.$state.current = { name: this.location };

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

    this.initController = (): void => {
      this.controller = this.$componentController('learnMoreBanner', { $element: this.$element }, { location: this.location });
      this.controller.$onInit();
      this.$scope.$apply();
    };
    this.initController();
  });

  it('should initialize with expected defaults', function () {
    expect(this.controller.isReadOnly).toBeFalsy();
    expect(this.controller.location).toEqual(this.location);
    expect(this.controller.show()).toBeTruthy();
    expect(this.BmmpService.init).toHaveBeenCalled();

    this.BmmpService.init.calls.reset();
    this.Authinfo.isReadOnlyAdmin.and.returnValue(true);
    this.ProPackService.hasProPackEnabledAndNotPurchased.and.returnValue(this.$q.resolve(false));
    this.initController();

    expect(this.controller.isReadOnly).toBeTruthy();
    expect(this.controller.show()).toBeFalsy();
    expect(this.BmmpService.init).not.toHaveBeenCalled();
  });
});
