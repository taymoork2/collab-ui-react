import { FeatureToggleService } from 'modules/core/featureToggle';

class SupportMeetingController implements ng.IComponentController {

  /* @ngInject */
  public constructor(
    private $state: ng.ui.IStateService,
    private FeatureToggleService: FeatureToggleService,
  ) {
    this.FeatureToggleService.supports(this.FeatureToggleService.features.diagnosticF8193UX3)
      .then((isSupport: boolean) => {
        if (!isSupport) {
          this.$state.go('support.status');
        }
      });
  }
}

export class SupportMeetingComponent implements ng.IComponentOptions {
  public controller = SupportMeetingController;
  public template = require('./support-meeting.html');
}
