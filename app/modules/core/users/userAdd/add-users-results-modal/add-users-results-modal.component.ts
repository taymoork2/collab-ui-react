import { IOnboardedUsersResultsErrorsAndWarnings } from 'modules/core/users/shared/onboard.interfaces';
import OnboardService from 'modules/core/users/userAdd/shared/onboard.service';

export class AddUsersResultsModalController implements ng.IComponentController {
  private dismiss: Function;
  private results: IOnboardedUsersResultsErrorsAndWarnings;
  private numAddedUsers: number;
  private numUpdatedUsers: number;

  /* @ngInject */
  constructor(
    private $previousState,
    private $state: ng.ui.IStateService,
    private Analytics,
    private OnboardService: OnboardService,
  ) {}

  public $onInit(): void {
    this.dismiss = _.isFunction(this.dismiss) ? this.dismiss : _.noop;
  }

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

  public hasErrors(): boolean {
    return !_.isEmpty(this.results.errors);
  }
}

export class AddUsersResultsModalComponent implements ng.IComponentOptions {
  public controller = AddUsersResultsModalController;
  public template = require('./add-users-results-modal.html');
  public bindings = {
    dismiss: '&',
    numUpdatedUsers: '<',
    numAddedUsers: '<',
    results: '<',
  };
}
