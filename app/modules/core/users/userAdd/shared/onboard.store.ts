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
  isDirSyncEnabled: boolean;
  model: {
    emailAddress?: string;
    firstName?: any;
    lastName?: any;
    uploadProgress: number;
    userForm?: ng.IFormController;
    userInfoValid?: boolean;
    userInputOption: number;
    userList?: any[];
  },
  strEmailAddress: string;
  strFirstName: string;
  strLastName: string;
  strNameAndEmailAdress: string;
  tokenfieldid: string;
  tokenoptions: any;
  tokenplaceholder: string;
  userInputOptions?: any;
}

export enum OnboardCtrlBoundUIStates {
  USERS_ADD_MANUAL = 'users.add.manual',
}

export default class OnboardStore {

  public 'users.add.manual': IOnboardScopeForUsersAdd;

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private DirSyncService,
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
      isDirSyncEnabled: this.DirSyncService.isDirSyncEnabled(),
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
      strFirstName: this.$translate.instant('usersPage.firstNamePlaceHolder'),
      strLastName: this.$translate.instant('usersPage.lastNamePlaceHolder'),
      strEmailAddress: this.$translate.instant('usersPage.emailAddressPlaceHolder'),
      strNameAndEmailAdress: this.$translate.instant('usersPage.nameAndEmailAddress'),
      tokenfieldid: 'usersfield',
      // TODO (mipark2): port from 'OnboardCtrl'
      tokenmethods: undefined,
      tokenoptions: {
        delimiter: [',', ','],
        createTokensOnBlur: true,
      },
      tokenplaceholder: this.$translate.instant('usersPage.userInput'),
    };

    result.userInputOptions = [{
      label: result.strEmailAddress,
      value: 0,
      name: 'radioOption',
      id: 'radioEmail',
    }, {
      label: result.strNameAndEmailAdress,
      value: 1,
      name: 'radioOption',
      id: 'radioNamesAndEmail',
    }];

    return result;
  }
}
