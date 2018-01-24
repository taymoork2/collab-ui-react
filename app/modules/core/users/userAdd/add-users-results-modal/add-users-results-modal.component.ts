import { IOnboardedUsersResultsErrorsAndWarnings } from 'modules/core/users/shared/onboard.interfaces';
import OnboardService from 'modules/core/users/userAdd/shared/onboard.service';
import OnboardStore from 'modules/core/users/userAdd/shared/onboard.store';

export class AddUsersResultsModalController implements ng.IComponentController {
  private convertPending: boolean;
  private convertUsersFlow: boolean;
  private dismiss: Function;
  private numAddedUsers: number;
  private numUpdatedUsers: number;
  private results: IOnboardedUsersResultsErrorsAndWarnings;

  /* @ngInject */
  constructor(
    private $previousState,
    private $state: ng.ui.IStateService,
    private Analytics,
    private OnboardService: OnboardService,
    private OnboardStore: OnboardStore,
  ) {}

  public $onInit(): void {
    this.dismiss = _.isFunction(this.dismiss) ? this.dismiss : _.noop;
  }

  public dismissModal(): void {
    if (!this.convertUsersFlow) {
      this.Analytics.trackAddUsers(this.Analytics.eventNames.CANCEL_MODAL);
      this.dismiss();
    }

    // TODO (mipark2): understand original intent of 'convertPending' and 'convertCancelled' booleans and update
    if (this.convertPending === true) {
      this.OnboardStore['users.convert'].convertCancelled = true;
    } else {
      this.dismiss();
    }
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
    convertPending: '<',
    convertUsersFlow: '<',
    dismiss: '&',
    numUpdatedUsers: '<',
    numAddedUsers: '<',
    results: '<',
  };
}
