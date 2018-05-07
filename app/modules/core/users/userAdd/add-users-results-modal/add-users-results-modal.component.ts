import { IOnboardedUsersResultsErrorsAndWarnings } from 'modules/core/users/shared/onboard/onboard.interfaces';
import OnboardService from 'modules/core/users/shared/onboard/onboard.service';

export class AddUsersResultsModalController implements ng.IComponentController {
  public convertUsersFlow: boolean;
  public dismiss: Function;
  public numAddedUsers: number;
  public numUpdatedUsers: number;
  public convertedUsers: string[];
  public pendingUsers: string[];
  public results: IOnboardedUsersResultsErrorsAndWarnings;

  /* @ngInject */
  constructor(
    private $previousState,
    private $state: ng.ui.IStateService,
    private Analytics,
    private OnboardService: OnboardService,
  ) {}

  public dismissModal(): void {
    this.Analytics.trackAddUsers(this.Analytics.eventNames.CANCEL_MODAL);
    this.dismiss();
  }

  public goToUsersPage(): void {
    this.$previousState.forget('modalMemo');
    // FIXME (mipark2): understand original intent here and fix
    const servicesSelected = {};
    const analyticsProps = this.OnboardService.createPropertiesForAnalytics(this.numUpdatedUsers, this.numAddedUsers, _.size(this.results.errors), servicesSelected);
    this.Analytics.trackAddUsers(this.Analytics.sections.ADD_USERS.eventNames.FINISH, null, analyticsProps);
    this.$state.go('users.list');
  }

  public get customFinishL10nLabel(): string {
    if (this.convertUsersFlow) {
      return 'common.finish';
    }
    return this.hasErrors() ? 'usersPage.skipErrorsAndFinish' : 'common.finish';
  }

  public hasErrors(): boolean {
    return !_.isEmpty(this.results.errors);
  }
}

export class AddUsersResultsModalComponent implements ng.IComponentOptions {
  public controller = AddUsersResultsModalController;
  public template = require('./add-users-results-modal.html');
  public bindings = {
    convertUsersFlow: '<',
    dismiss: '&',
    numUpdatedUsers: '<',
    numAddedUsers: '<',
    convertedUsers: '<',
    pendingUsers: '<',
    results: '<',
  };
}
