import { ManageType } from './user-manage.keys';
import { OnboardCtrlBoundUIStates } from 'modules/core/users/shared/onboard/onboard.store';
import { AutoAssignTemplateModel } from 'modules/core/users/shared/auto-assign-template';

enum State {
  USERS_ADD_MANUAL = 'users.add.manual',
  USERS_AUTO_ASSIGN_TEMPLATE = 'users.manage.edit-auto-assign-template-modal',
  USERS_CONVERT = 'users.convert',
  USERS_CSV = 'users.csv',
  USERS_DIR_SYNC_INSTALL = 'users.manage.dir-sync.add.ob.installConnector',
  USERS_DIR_SYNC_LICENSE_SUMMARY = 'users.manage.dir-sync.add.ob.autoAssignLicenseSummary',
  USERS_DIR_SYNC_STATUS = 'users.manage.dir-sync.add.ob.syncStatus',
  USERS_EMAIL_SUPPRESS = 'users.manage.emailSuppress',
  USERS_MANAGE_ORG = 'users.manage.org',
}

export class UserManageService {
  /* @ngInject */
  constructor(
    private $q: ng.IQService,
    private $state: ng.ui.IStateService,
    private Analytics,
    private AutoAssignTemplateModel: AutoAssignTemplateModel,
    private FeatureToggleService,
  ) {}

  public gotoNextStateForManageType(manageType: ManageType): void {
    this.featureTogglePromises.then(features => {
      if (features.atlasEmailSuppress && !this.canSkipEmailSuppressState(manageType)) {
        return this.gotoEmailSuppressStateForType(manageType);
      }
      return this.gotoStateForType(manageType);
    });
  }

  public gotoNextStateForManageTypeAfterEmailSuppress(manageType: ManageType): void {
    return this.gotoStateForType(manageType);
  }

  private get featureTogglePromises(): ng.IPromise<{atlasEmailSuppress: boolean}> {
    return this.$q.all({
      // TODO remove GA feature toggle?
      atlasEmailSuppress: this.FeatureToggleService.atlasEmailSuppressGetStatus(),
    });
  }

  private canSkipEmailSuppressState(manageType: ManageType): boolean {
    return manageType === ManageType.AUTO_ASSIGN_TEMPLATE;
  }

  private gotoStateForType(manageType: ManageType): void {
    switch (manageType) {
      case ManageType.MANUAL:
        this.Analytics.trackAddUsers(this.Analytics.eventNames.NEXT, this.Analytics.sections.ADD_USERS.uploadMethods.MANUAL);
        this.$state.go(State.USERS_ADD_MANUAL, {
          resetOnboardStoreStates: OnboardCtrlBoundUIStates.ALL,
        });
        break;

      case ManageType.BULK:
        this.Analytics.trackAddUsers(this.Analytics.sections.ADD_USERS.eventNames.CSV_UPLOAD, this.Analytics.sections.ADD_USERS.uploadMethods.CSV);
        this.$state.go(State.USERS_CSV);
        break;

      case ManageType.ADVANCED_NO_DS:
        if (this.AutoAssignTemplateModel.isDefaultAutoAssignTemplateActivated) {
          this.$state.go(State.USERS_DIR_SYNC_LICENSE_SUMMARY);
        } else {
          this.Analytics.trackAddUsers(this.Analytics.sections.ADD_USERS.eventNames.INSTALL_CONNECTOR, this.Analytics.sections.ADD_USERS.uploadMethods.SYNC);
          this.$state.go(State.USERS_DIR_SYNC_INSTALL);
        }
        break;

      case ManageType.CONVERT:
        this.$state.go(State.USERS_CONVERT, {
          manageUsers: true,
          isDefaultAutoAssignTemplateActivated: this.AutoAssignTemplateModel.isDefaultAutoAssignTemplateActivated,
          resetOnboardStoreStates: OnboardCtrlBoundUIStates.ALL,
        });
        break;

      case ManageType.ADVANCED_DS:
        this.$state.go(State.USERS_DIR_SYNC_STATUS);
        break;

      case ManageType.AUTO_ASSIGN_TEMPLATE:
        this.$state.go(State.USERS_AUTO_ASSIGN_TEMPLATE, {
          prevState: State.USERS_MANAGE_ORG,
        });
        break;
    }
  }

  private gotoEmailSuppressStateForType(manageType: ManageType): void {
    this.$state.go(State.USERS_EMAIL_SUPPRESS, {
      manageType: manageType,
      prevState: State.USERS_MANAGE_ORG,
    });
  }
}
