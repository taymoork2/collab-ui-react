export class OnboardSummaryForAutoAssignModalController implements ng.IComponentController {
  private dismiss: Function;
  private stateData: any;  // TODO: better type
  private userList: any; // TODO: better type
  public saveLoading = false;

  /* @ngInject */
  constructor(
    private $state: ng.ui.IStateService,
    private Analytics,
    private Notification,
    private Userservice,
  ) {}

  public $onInit(): void {
    this.stateData = _.get(this.$state, 'params.stateData');
    this.userList = _.get(this.$state, 'params.userList');
  }

  public dismissModal(): void {
    this.Analytics.trackAddUsers(this.Analytics.eventNames.CANCEL_MODAL);
    this.dismiss();
  }

  public back(): void {
    this.$state.go('users.add.manual', {
      stateData: this.stateData,
    });
  }

  public save(): void {
    this.saveLoading = true;
    const licenses = [];
    const userEntitlements = [];

    // TODO: transition to onboard summary state instead of notifying success and jumping to 'users.list'
    this.Userservice.onboardUsersV2({
      users: this.userList,
      licenses: licenses,
      userEntitlements: userEntitlements,
    })
      .then(() => {
        // TODO: rm this
        this.Notification.success('userManage.autoAssignTemplate.editSummary.saveSuccess');
      })
      .finally(() => {
        this.saveLoading = false;
        // TODO: change jump target to onboard results summary state
        this.$state.go('users.list');
      });
  }
}

export class OnboardSummaryForAutoAssignModalComponent implements ng.IComponentOptions {
  public controller = OnboardSummaryForAutoAssignModalController;
  public template = require('./onboard-summary-for-auto-assign-modal.html');
  public bindings = {
    dismiss: '&?',
  };
}
