import { IOnboardScopeForUsersAdd, OnboardCtrlBoundUIStates } from 'modules/core/users/userAdd/shared/onboard.store';

export class ManualAddUsersModalController implements ng.IComponentController {
  public isDirSyncEnabled: boolean;
  public maxUsersInManual: number;
  public model: any;
  private dismiss: Function;
  private scopeData: IOnboardScopeForUsersAdd;

  /* @ngInject */
  constructor(
    private $previousState,
    private $state: ng.ui.IStateService,
    private $timeout: ng.ITimeoutService,
    private Analytics,
    public Notification,
    private OnboardService,
    private OnboardStore,
  ) {
    // TODO: rm use of 'OnboardStore' once shared references in '$scope' in 'OnboardCtrl' are removed
    this.scopeData = this.OnboardStore[OnboardCtrlBoundUIStates.USERS_ADD_MANUAL];
    this.isDirSyncEnabled = this.scopeData.isDirSyncEnabled;
    this.model = this.scopeData.model;

    this.maxUsersInManual = this.OnboardService.maxUsersInManual;
  }

  public dismissModal(): void {
    this.Analytics.trackAddUsers(this.Analytics.eventNames.CANCEL_MODAL);
    this.dismiss();
  }

  public back(state): void {
    let rootState = this.$previousState.get().state.name;
    if (rootState === 'users.manage.emailSuppress') {
      rootState = 'users.manage.picker';
    }
    const goToState = state || rootState;
    this.Analytics.trackAddUsers(this.Analytics.eventNames.BACK, this.Analytics.sections.ADD_USERS.uploadMethods.MANUAL, { emailEntryMethod: this.Analytics.sections.ADD_USERS.manualMethods[this.model.userInputOption.toString()] });
    this.$state.go(goToState);
  }

  public validateTokensBtn(): void {
    const usersListLength = angular.element('.token-label').length;
    this.validateTokens().then(() => {
      if (this.scopeData.invalidcount === 0 && usersListLength > 0) {
        this.scopeData.currentUserCount = usersListLength;
        this.Analytics.trackAddUsers(this.Analytics.sections.ADD_USERS.eventNames.MANUAL_EMAIL,
          this.Analytics.sections.ADD_USERS.uploadMethods.MANUAL, {
            emailEntryMethod: this.Analytics.sections.ADD_USERS.manualMethods[this.model.userInputOption.toString()],
          }
        );
        this.$state.go('users.add.services');
      } else if (usersListLength === 0) {
        this.Notification.error('usersPage.noUsersInput');
        this.Analytics.trackAddUsers(this.Analytics.sections.ADD_USERS.eventNames.MANUAL_EMAIL,
          this.Analytics.sections.ADD_USERS.uploadMethods.MANUAL, {
            emailEntryMethod: this.Analytics.sections.ADD_USERS.manualMethods[this.model.userInputOption.toString()],
            error: 'no users',
          }
        );
      } else {
        this.Analytics.trackAddUsers(this.Analytics.sections.ADD_USERS.eventNames.MANUAL_EMAIL,
          this.Analytics.sections.ADD_USERS.uploadMethods.MANUAL, {
            emailEntryMethod: this.Analytics.sections.ADD_USERS.manualMethods[this.model.userInputOption.toString()],
            error: 'invalid users',
          }
        );
        this.Notification.error('usersPage.validEmailInput');
      }
    });
  }

  private validateTokens(): ng.IPromise<void> {
    // TODO (f3745): rm this if determined not-needed
    // this.wizardNextText();

    return this.$timeout(() => {
      //reset the invalid count
      this.scopeData.invalidcount = 0;
      (angular.element('#usersfield') as any).tokenfield('setTokens', this.model.userList);
    }, 100);
  }

  public allowNext(): boolean {
    return (!_.isEmpty(this.model.userList) && !this.hasErrors());
  }

  public hasErrors(): boolean {
    let haserr = (this.scopeData.invalidcount > 0);
    if (this.getNumUsersInTokenField() >= this.maxUsersInManual) {
      haserr = true;
    }
    return haserr;
  }

  public getNumUsersInTokenField(): number {
    return (angular.element('#usersfield') as any).tokenfield('getTokens').length;
  }
}

export class ManualAddUsersModalComponent implements ng.IComponentOptions {
  public controller = ManualAddUsersModalController;
  public template = require('./manual-add-users-modal.html');
  public bindings = {
    dismiss: '&?',
  };
}
