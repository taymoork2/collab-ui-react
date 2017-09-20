export class LearnMoreCtrl {
  public location: string;
  public type: string;
  public isDisabled: boolean;

  /* @ngInject */
  constructor(
    private $window: ng.IWindowService,
    private Analytics,
  ) {}

  public clickLink(): void {
    if (_.isUndefined(this.isDisabled) || !this.isDisabled) {
      this.Analytics.trackPremiumEvent(this.Analytics.sections.PREMIUM.eventNames.LEARN_MORE, this.location);
      this.$window.open('http://www.cisco.com/go/pro-pack', '_blank');
    }
  }

  public isButton(): boolean {
    return !_.isEmpty(this.type) && this.type.toLowerCase() === 'button';
  }
}

export class LearnMoreComponent implements ng.IComponentOptions {
  public template = require('modules/core/learnMore/learnMore.tpl.html');
  public controller = LearnMoreCtrl;
  public bindings = {
    location: '@',
    type: '@',
    isDisabled: '<',
  };
}
