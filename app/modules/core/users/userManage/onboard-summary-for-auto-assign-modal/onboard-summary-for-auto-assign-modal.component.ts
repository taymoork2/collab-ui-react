import { IOnboardedUsersAggregateResult, IUserNameAndEmail } from 'modules/core/users/shared/onboard.interfaces';
import OnboardService from 'modules/core/users/userAdd/shared/onboard.service';

export class OnboardSummaryForAutoAssignModalController implements ng.IComponentController {
  public dismiss: Function;
  public autoAssignTemplateData: any;  // TODO: better type
  public userList: IUserNameAndEmail[];
  public saveLoading = false;

  /* @ngInject */
  constructor(
    private $q: ng.IQService,
    private $state: ng.ui.IStateService,
    private Analytics,
    private Notification,
    private OnboardService: OnboardService,
  ) {}

  public dismissModal(): void {
    this.Analytics.trackAddUsers(this.Analytics.eventNames.CANCEL_MODAL);
    this.dismiss();
  }

  public back(): void {
    this.$state.go('users.add.manual', {
      autoAssignTemplateData: this.autoAssignTemplateData,
    });
  }

  public save(): void {
    this.saveLoading = true;
    const licenses = [];
    const userEntitlements = [];

    this.OnboardService.onboardUsersInChunks(this.userList, userEntitlements, licenses)
      .catch((rejectedResponse) => {
        // notes:
        // - potentially multiple 'Userservice.onboardUsersLegacy()' calls could have been made
        // - if any calls reject (or in the case of multiple calls, the first one rejects), we
        //   error notify and re-reject
        this.Notification.errorResponse(rejectedResponse);
        return this.$q.reject();
      })
      .then((aggregateResult: IOnboardedUsersAggregateResult) => {
        this.$state.go('users.add.results', aggregateResult);
      });
  }
}

export class OnboardSummaryForAutoAssignModalComponent implements ng.IComponentOptions {
  public controller = OnboardSummaryForAutoAssignModalController;
  public template = require('./onboard-summary-for-auto-assign-modal.html');
  public bindings = {
    dismiss: '&',
    autoAssignTemplateData: '<',
    userList: '<',
  };
}
