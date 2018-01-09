import { IOnboardScopeForUsersAdd, OnboardCtrlBoundUIStates } from 'modules/core/users/userAdd/shared/onboard.store';
import { KeyCodes } from 'modules/core/accessibility';

// notes:
// - this is a port of 'onboardUsers.directive.js + 'onboardUsers.tpl.html' + 'onboard.controller.js'
// - minimal attempt has been made to clean up the logic or variable names:
//   - added typescript return types for functions
//   - added types to satisfy typescript compiler
//   - added 'this.' prefix for instance-methods
// TODO (mipark2):
// - rm use of 'OnboardStore'
// - add output binding(s)
export class CrOnboardUsersController implements ng.IComponentController {

  public isDirSyncEnabled: boolean;
  public model: any;
  public strEmailAddress: string;
  public strFirstName: string;
  public strLastName: string;
  public strNameAndEmailAdress: string;
  public tokenfieldid: string;
  public tokenoptions: any;
  public tokenmethods: any;
  public tokenplaceholder: string;
  public userInputOptions: any;
  private scopeData: IOnboardScopeForUsersAdd;

  // TODO: port 'user.service.js' to typescript, and export 'NAME_DELIMITER' as a constant
  private readonly NAME_DELIMITER = ' \u000B';

  /* @ngInject */
  constructor(
    private $timeout: ng.ITimeoutService,
    private $translate: ng.translate.ITranslateService,
    private OnboardService,
    private OnboardStore,
    private UserListService,
  ) {
    // TODO: rm use of 'OnboardStore' once shared references in '$scope' in 'OnboardCtrl' are removed
    this.scopeData = this.OnboardStore[OnboardCtrlBoundUIStates.USERS_ADD_MANUAL];
    this.isDirSyncEnabled = this.scopeData.isDirSyncEnabled;
    this.model = this.scopeData.model;
    this.strFirstName = this.$translate.instant('usersPage.firstNamePlaceHolder');
    this.strLastName = this.$translate.instant('usersPage.lastNamePlaceHolder');
    this.strEmailAddress = this.$translate.instant('usersPage.emailAddressPlaceHolder');
    this.strNameAndEmailAdress = this.$translate.instant('usersPage.nameAndEmailAddress');
    this.tokenfieldid = 'usersfield';
    // TODO (mipark2): port from 'OnboardCtrl'
    this.tokenmethods = undefined;
    this.tokenoptions = {
      delimiter: [',', ','],
      createTokensOnBlur: true,
    };
    this.tokenplaceholder = this.$translate.instant('usersPage.userInput');
    this.userInputOptions = [{
      label: this.strEmailAddress,
      value: 0,
      name: 'radioOption',
      id: 'radioEmail',
    }, {
      label: this.strNameAndEmailAdress,
      value: 1,
      name: 'radioOption',
      id: 'radioNamesAndEmail',
    }];
  }

  // TODO: refactor - mv this to 'OnboardService'
  public hasErrors(): boolean {
    let haserr = (this.scopeData.invalidcount > 0);
    if (this.getNumUsersInTokenField() >= this.OnboardService.maxUsersInManual) {
      haserr = true;
    }
    return haserr;
  }

  // TODO: refactor - mv this to 'OnboardService'
  public getNumUsersInTokenField(): number {
    return (angular.element('#usersfield') as any).tokenfield('getTokens').length;
  }

  // TODO: refactor - mv this to 'OnboardService'
  public validateTokens(): ng.IPromise<void> {
    // TODO (f3745): rm this if determined not-needed
    // wizardNextText();

    return this.$timeout(() => {
      //reset the invalid count
      this.scopeData.invalidcount = 0;
      (angular.element('#usersfield') as any).tokenfield('setTokens', this.model.userList);
    }, 100);
  }

  public clearPanel(): void {
    this.resetUsersfield();
    // TODO (f3745): rm this if determined not-needed
    //initResults();
  };

  private resetUsersfield(): void {
    (angular.element('#usersfield') as any).tokenfield('setTokens', ' ');
    this.model.userList = '';
    this.checkPlaceholder();
    this.scopeData.invalidcount = 0;
    this.scopeData.invalidDirSyncUsersCount = 0;
  };

  private checkPlaceholder(): void {
    return this.OnboardService.checkPlaceholder();
  }

  public onEnterKey(keyEvent: { which: KeyCodes }): void {
    if (keyEvent.which === KeyCodes.ENTER) {
      this.addToUsersfield();
    }
  }

  public addToUsersfield(): void {
    if (this.model.userForm.$valid && this.model.userInfoValid) {
      const userInfo = this.model.firstName + this.NAME_DELIMITER + this.model.lastName + ' ' + this.model.emailAddress;
      (angular.element('#usersfield') as any).tokenfield('createToken', userInfo);
      this.clearNameAndEmailFields();
      angular.element('#firstName').focus();
    }
  }

  private clearNameAndEmailFields(): void {
    this.model.firstName = '';
    this.model.lastName = '';
    this.model.emailAddress = '';
    this.model.userInfoValid = false;
  }

  public validateEmailField(): void {
    if (this.model.emailAddress) {
      this.model.userInfoValid = this.OnboardService.validateEmail(this.model.emailAddress);
    } else {
      this.model.userInfoValid = false;
    }
  }

  // notes:
  // - implementation (and comments) migrated from 'onboard.controller.js'
  //
  // sort the token list so that error tokens appear first in the list
  public sortTokens() {
    // this is just a sh*tty way of sorting this.  The only info we have
    // if a token has an error is if it has an 'invalid' class on the element.
    // the model.userList SHOULD contain this info, but it doesn't.  So,
    // in order to sort all of the invalid tokens to the front of the list,
    // we need to do this in the DOM directly. Thankfully, tokenfield doesn't
    // break when we do this.
    const start = $(angular.element('.tokenfield input[type=text]')[0]);
    if (start.length > 0) {
      const tokens = start.siblings('.token');
      (tokens as any).sort(function (a, b) {
        const ainvalid = $(a).hasClass('invalid');
        const binvalid = $(b).hasClass('invalid');
        if (ainvalid && !binvalid) {
          return -1;
        } else if (!ainvalid && binvalid) {
          return 1;
        } else {
          return 0;
        }
      });

      tokens.detach().insertAfter(start);
    }
  }

  public setInvalidToken(token): void {
    angular.element(token.relatedTarget).addClass('invalid');
    this.scopeData.invalidcount++;
  }

  public validateDirSyncUser(e): void {
    if (this.isDirSyncEnabled) {
      this.UserListService.queryUser(e.attrs.value)
        .catch(() => {
          this.setInvalidToken(e);
          this.sortTokens();
          this.scopeData.invalidDirSyncUsersCount++;
        });
    }
  }
}

export class CrOnboardUsersComponent implements ng.IComponentOptions {
  public controller = CrOnboardUsersController;
  public template = require('./cr-onboard-users.html');
  public bindings = {};
}
