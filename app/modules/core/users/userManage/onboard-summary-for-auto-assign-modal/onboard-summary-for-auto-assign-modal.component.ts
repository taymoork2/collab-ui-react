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
    this.$state.go('users.add', {
      stateData: this.stateData,
    });
  }

  public save(): void {
    this.saveLoading = true;
    const licenses = [];
    const userEntitlements = [];
    this.Userservice.onboardUsersV2(this.userList, licenses, userEntitlements)
      .then(() => {
        this.Notification.success('userManage.autoAssignTemplate.editSummary.saveSuccess');
        this.$state.go('users.list');
      })
      .catch((response) => {
        this.Notification.errorResponse(response, 'userManage.autoAssignTemplate.editSummary.saveError');
      })
      .finally(() => {
        this.saveLoading = false;
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
