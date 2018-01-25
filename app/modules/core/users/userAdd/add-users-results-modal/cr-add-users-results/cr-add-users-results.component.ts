import { IOnboardedUsersResultsErrorsAndWarnings } from 'modules/core/users/shared/onboard.interfaces';
import OnboardService from 'modules/core/users/userAdd/shared/onboard.service';

export class CrAddUsersResultsController implements ng.IComponentController {

  public numAddedUsers: number;
  public numUpdatedUsers: number;
  public results: IOnboardedUsersResultsErrorsAndWarnings;

  /* @ngInject */
  constructor(
    private $state: ng.ui.IStateService,
    private Analytics,
    private OnboardService: OnboardService,
  ) {
  }

  public fixBulkErrors() {
    // TODO (mipark2): this should no longer be needed, rm after confirmation
    // if (this.isFtw) {
    //   this.wizard.goToStep('manualEntry');
    // } else {
    //   this.Analytics.trackAddUsers(this.Analytics.sections.ADD_USERS.eventNames.GO_BACK_FIX, null, this.createPropertiesForAnalytics());
    //   this.$state.go('users.add.manual');
    // }
    const analyticsProps = this.OnboardService.createPropertiesForAnalytics(this.numUpdatedUsers, this.numAddedUsers, _.size(this.results.errors));
    this.Analytics.trackAddUsers(this.Analytics.sections.ADD_USERS.eventNames.GO_BACK_FIX, null, analyticsProps);
    this.$state.go('users.add.manual');
  }
}

export class CrAddUsersResultsComponent implements ng.IComponentOptions {
  public controller = CrAddUsersResultsController;
  public template = require('./cr-add-users-results.html');
  public bindings = {
    numAddedUsers: '<',
    numUpdatedUsers: '<',
    results: '<',
  };
}
