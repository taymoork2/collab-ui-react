import overviewBanner from './index';

describe('service: LearnMoreBannerService', function () {
  beforeEach(function () {
    this.initModules(overviewBanner);
    this.injectDependencies('LearnMoreBannerService');

    this.location = 'reports';
    this.is = jasmine.createSpy('is').and.callFake((): boolean => { return true; });
    spyOn(angular, 'element').and.callFake((elementName: string): any => {
      expect(elementName === this.LearnMoreBannerService.CLOSE_ELEMENTS[this.location]);
      return {
        is: this.is,
      };
    });
  });

  it('isElementVisible should return whether element is visible or not', function () {
    this.LearnMoreBannerService.isElementVisible(this.location);
    expect(angular.element).toHaveBeenCalledTimes(1);
    expect(this.is).toHaveBeenCalledTimes(1);
  });
});
