import learnMore from './index';

describe('Component: learnMore', function () {
  beforeEach(function () {
    this.initModules(learnMore);
    this.injectDependencies('$componentController', '$scope', '$window', 'Analytics');

    this.location = 'global-subheader';
    this.type = 'link';
    spyOn(this.$window, 'open');
    spyOn(this.Analytics, 'trackPremiumEvent');

    this.initController = (): void => {
      this.controller = this.$componentController('learnMore', {
        Analytics: this.Analytics,
      }, {
        location: this.location,
        type: this.type,
      });
      this.$scope.$apply();
    };
  });

  it('should call Analytics when clickLink is called', function () {
    this.initController();
    this.controller.clickLink();
    expect(this.Analytics.trackPremiumEvent).toHaveBeenCalledWith(this.Analytics.sections.PREMIUM.eventNames.LEARN_MORE, this.location);
    expect(this.$window.open).toHaveBeenCalledWith('http://www.cisco.com/go/pro-pack', '_blank');
  });

  describe('isButton: ', function () {
    it('should return false when type is not "button"', function () {
      this.initController();
      expect(this.controller.isButton()).toBeFalsy();
    });

    it('should return true when type is "button"', function () {
      this.type = 'button';
      this.initController();
      expect(this.controller.isButton()).toBeTruthy();
    });
  });
});
