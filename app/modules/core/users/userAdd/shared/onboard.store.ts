// notes:
// - this is a singleton class for the purpose of migrating '$scope.*' properties away from the
//   over-crowded 'OnboardCtrl'
// IMPORTANT:
// - this is a TEMPORARY MEASURE ONLY, do not continue dumping properties onto this singleton unless
//   it is part of a plan to eliminate '$scope.*' properties altogether

export interface IOnboardScopeForUsersAdd {
  currentUserCount: number;
  invalidcount: number;
  invalidDirSyncUsersCount: number;
  model: {
    emailAddress?: string;
    firstName?: any;
    lastName?: any;
    uploadProgress: number;
    userForm?: ng.IFormController;
    userInfoValid?: boolean;
    userInputOption: number;
    userList?: any[];
  };
}

export enum OnboardCtrlBoundUIStates {
  USERS_ADD_MANUAL = 'users.add.manual',
}

export default class OnboardStore {

  public 'users.add.manual': IOnboardScopeForUsersAdd;

  /* @ngInject */
  constructor(
  ) {
    this.resetForState(OnboardCtrlBoundUIStates.USERS_ADD_MANUAL);
  }

  public resetForState(uiStateName: OnboardCtrlBoundUIStates): void {
    if (uiStateName === OnboardCtrlBoundUIStates.USERS_ADD_MANUAL) {
      this[uiStateName] = this.initUsersAdd();
    }
  }

  public initUsersAdd(): IOnboardScopeForUsersAdd {
    const result: IOnboardScopeForUsersAdd = {
      currentUserCount: 0,
      invalidcount: 0,
      invalidDirSyncUsersCount: 0,
      model: {
        emailAddress: undefined,
        firstName: undefined,
        lastName: undefined,
        uploadProgress: 0,
        userForm: undefined,
        userInfoValid: false,
        userInputOption: 0,
        userList: [],
      },
    };

    return result;
  }
}
