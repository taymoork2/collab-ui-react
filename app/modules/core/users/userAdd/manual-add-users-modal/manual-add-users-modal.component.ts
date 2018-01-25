import { AutoAssignTemplateModel, AutoAssignTemplateService } from 'modules/core/users/shared/auto-assign-template';
import { IOnboardScopeForUsersAdd, OnboardCtrlBoundUIStates } from 'modules/core/users/userAdd/shared/onboard.store';
import OnboardService from 'modules/core/users/userAdd/shared/onboard.service';
import OnboardStore from 'modules/core/users/userAdd/shared/onboard.store';

export class ManualAddUsersModalController implements ng.IComponentController {
  public isDirSyncEnabled: boolean;
  public maxUsersInManual: number;
  public model: any;
  private dismiss?: Function;
  private scopeData: IOnboardScopeForUsersAdd;
  public stateData: any;  // TODO: better type

  /* @ngInject */
  constructor(
    private $q: ng.IQService,
    private $state: ng.ui.IStateService,
    private Analytics,
    private AutoAssignTemplateModel: AutoAssignTemplateModel,
    private AutoAssignTemplateService: AutoAssignTemplateService,
    private DirSyncService,
    public Notification,
    private OnboardService: OnboardService,
    private OnboardStore: OnboardStore,
  ) {
  }

  public $onInit(): void {
    // TODO: rm use of 'OnboardStore' once shared references in '$scope' in 'OnboardCtrl' are removed
    this.scopeData = this.OnboardStore[OnboardCtrlBoundUIStates.USERS_ADD_MANUAL];
    this.isDirSyncEnabled = this.DirSyncService.isDirSyncEnabled();
    this.model = this.scopeData.model;
    this.maxUsersInManual = this.OnboardService.maxUsersInManual;

    // early-out if state data provided through input binding (ie. passed from another step)
    if (this.useDefaultAutoAssignTemplate) {
      return;
    }

    // otherwise initialize state data
    this.$q.all({
      defaultAutoAssignTemplate: this.AutoAssignTemplateService.getDefaultTemplate(),
      subscriptions: this.AutoAssignTemplateService.getSortedSubscriptions(),
    }).then((results) => {
      if (!results.defaultAutoAssignTemplate) {
        return;
      }
      this.stateData = this.AutoAssignTemplateService.toStateData(results.defaultAutoAssignTemplate, results.subscriptions);
    });
  }

  public get useDefaultAutoAssignTemplate(): boolean {
    return !_.isEmpty(this.stateData) && this.AutoAssignTemplateModel.isDefaultAutoAssignTemplateActivated;
  }

  public dismissModal(): void {
    this.Analytics.trackAddUsers(this.Analytics.eventNames.CANCEL_MODAL);
    if (_.isFunction(this.dismiss)) {
      this.dismiss();
    }
  }

  public back(state?): void {
    // notes:
    // - as of 2018-01-11, stepping back from the 'users.add.manual' state should always go to 'users.manage.picker'
    // - contact @mipark2 if edge-cases exist that require otherwise
    const rootState = 'users.manage.picker';
    const goToState = state || rootState;
    this.Analytics.trackAddUsers(this.Analytics.eventNames.BACK, this.Analytics.sections.ADD_USERS.uploadMethods.MANUAL, { emailEntryMethod: this.Analytics.sections.ADD_USERS.manualMethods[this.model.userInputOption.toString()] });
    this.$state.go(goToState);
  }

  private getUsersList() {
    return this.OnboardService.parseUsersList(this.model.userList);
  }

  private goToNextState(useDefaultAutoAssignTemplate): void {
    if (!useDefaultAutoAssignTemplate) {
      this.$state.go('users.add.services');
      return;
    }
    this.$state.go('users.manage.onboard-summary-for-auto-assign-modal', {
      stateData: this.stateData,
      userList: this.getUsersList(),
    });
  }

  public validateTokensBtn(): void {
    const usersListLength = _.size(this.getUsersList());
    this.validateTokens().then(() => {
      // TODO (mipark2): cleanup unneeded logic
      if (this.scopeData.invalidcount === 0 && usersListLength > 0) {
        this.scopeData.currentUserCount = usersListLength;
        this.Analytics.trackAddUsers(this.Analytics.sections.ADD_USERS.eventNames.MANUAL_EMAIL,
          this.Analytics.sections.ADD_USERS.uploadMethods.MANUAL, {
            emailEntryMethod: this.Analytics.sections.ADD_USERS.manualMethods[this.model.userInputOption.toString()],
          },
        );
        this.goToNextState(this.useDefaultAutoAssignTemplate);
      } else if (usersListLength === 0) {
        this.Notification.error('usersPage.noUsersInput');
        this.Analytics.trackAddUsers(this.Analytics.sections.ADD_USERS.eventNames.MANUAL_EMAIL,
          this.Analytics.sections.ADD_USERS.uploadMethods.MANUAL, {
            emailEntryMethod: this.Analytics.sections.ADD_USERS.manualMethods[this.model.userInputOption.toString()],
            error: 'no users',
          },
        );
      } else {
        this.Analytics.trackAddUsers(this.Analytics.sections.ADD_USERS.eventNames.MANUAL_EMAIL,
          this.Analytics.sections.ADD_USERS.uploadMethods.MANUAL, {
            emailEntryMethod: this.Analytics.sections.ADD_USERS.manualMethods[this.model.userInputOption.toString()],
            error: 'invalid users',
          },
        );
        this.Notification.error('usersPage.validEmailInput');
      }
    });
  }

  private validateTokens(): ng.IPromise<void> {
    return this.OnboardService.validateTokens(this.scopeData);
  }

  public allowNext(): boolean {
    return (!_.isEmpty(this.model.userList) && !this.hasErrors());
  }

  public hasErrors(): boolean {
    return this.OnboardService.hasErrors(this.scopeData);
  }

  public getNumUsersInTokenField(): number {
    return this.OnboardService.getNumUsersInTokenField();
  }
}

export class ManualAddUsersModalComponent implements ng.IComponentOptions {
  public controller = ManualAddUsersModalController;
  public template = require('./manual-add-users-modal.html');
  public bindings = {
    dismiss: '&?',
    stateData: '<',
  };
}
