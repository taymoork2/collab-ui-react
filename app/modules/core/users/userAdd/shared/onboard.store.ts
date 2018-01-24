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

export interface IOnboardScopeForUsersConvert {
  convertCancelled: boolean;
}

export enum OnboardCtrlBoundUIStates {
  USERS_ADD_MANUAL = 'users.add.manual',
  USERS_CONVERT = 'users.convert',
}

export default class OnboardStore {

  public 'users.add.manual': IOnboardScopeForUsersAdd;
  public 'users.convert': IOnboardScopeForUsersConvert;

  /* @ngInject */
  constructor(
  ) {
    this.resetForState(OnboardCtrlBoundUIStates.USERS_ADD_MANUAL);
    this.resetForState(OnboardCtrlBoundUIStates.USERS_CONVERT);
  }

  public resetForState(uiStateName: OnboardCtrlBoundUIStates): void {
    switch (uiStateName) {
      case OnboardCtrlBoundUIStates.USERS_ADD_MANUAL:
        this[uiStateName] = this.initUsersAdd();
        return;
      case OnboardCtrlBoundUIStates.USERS_CONVERT:
        this[uiStateName] = this.initUsersConvert();
        return;
      default:
        return;
    }
  }

  private initUsersAdd(): IOnboardScopeForUsersAdd {
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

  private initUsersConvert(): IOnboardScopeForUsersConvert {
    return {
      convertCancelled: false,
    };
  }
}
