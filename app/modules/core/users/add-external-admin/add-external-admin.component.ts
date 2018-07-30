import { Notification } from 'modules/core/notifications/notification.service';

export class AddExternalAdminController implements ng.IComponentController {
  public readonly roles = {
    FULL_ADMIN: 'fullAdmin',
    READ_ONLY: 'readOnlyAdmin',
  };

  public component = this;
  public dismiss: Function;
  public form: ng.IFormController;
  public emailAddress: string;
  public confirmEmailAddress: string;
  public role: string = this.roles.FULL_ADMIN;
  public loading: boolean = false;
  public errorMsg: string;

  /* @ngInject */
  constructor(private $rootScope: ng.IRootScopeService,
              private $timeout: ng.ITimeoutService,
              private $translate: ng.translate.ITranslateService,
              private Notification: Notification,
              private Userservice) {
    this.addSuccess = this.addSuccess.bind(this);
    this.addError = this.addError.bind(this);
    this.close = this.close.bind(this);
    this.refreshUserList = this.refreshUserList.bind(this);
    this.stopLoading = this.stopLoading.bind(this);
  }

  public close(): void {
    this.dismiss();
  }

  public handleAdd(): void {
    this.loading = true;
    this.addAdmin()
      .then(() => this.addSuccess()
        .then(() => this.close()))
      .catch((response) => this.addError(response))
      .finally(() => this.stopLoading());
  }

  public verifyConfirmEmailAddress(): void {
    this.form.emailAddress.$setValidity('addError', true);
    if (!_.isEmpty(this.emailAddress) && !_.isEmpty(this.confirmEmailAddress)) {
      const isMatched = _.isEqual(this.confirmEmailAddress.toLowerCase(), this.emailAddress.toLowerCase());
      this.form.confirmEmailAddress.$setValidity('emailsDoNotMatch', isMatched);
    }
  }

  private addAdmin(): ng.IPromise<void> {
    const request = {
      email: this.emailAddress,
      role: this.role,
    };

    return this.Userservice.addExternalAdmin(request);
  }

  private addSuccess(): ng.IPromise<void> {
    this.Notification.success('usersPage.addExternalAdminSuccess', {});

    return this.$timeout(() => {
      this.refreshUserList();
    }, 500);
  }

  private addError(response): void {
    if (_.get(response, 'status') === 400) {
      const errorCode = _.get(response.data, 'errorCode');
      let errorKey;
      switch (errorCode) {
        case 400082: {
          errorKey = 'usersPage.addExternamAdminNoCi';
          break;
        }
        case 400132: {
          errorKey = 'usersPage.addExternamAdminConsumer';
          break;
        }
        case 400133: {
          errorKey = 'usersPage.addExternamAdminUser';
          break;
        }
        case 400134: {
          errorKey = 'usersPage.addExternamAdminAdmin';
          break;
        }
        case 400135: {
          errorKey = 'usersPage.addExternamAdminPartner';
          break;
        }
      }
      if (errorKey) {
        this.errorMsg = this.$translate.instant(errorKey);
        this.form.emailAddress.$setValidity('addError', false);
        return;
      }
    }
    this.Notification.errorResponse(response, 'usersPage.addExternalAdminError');
  }

  private refreshUserList(): void {
    this.$rootScope.$broadcast('USER_LIST_UPDATED');
  }

  private stopLoading(): void {
    this.loading = false;
  }
}

export class AddExternalAdminComponent implements ng.IComponentOptions {
  public controller = AddExternalAdminController;
  public template = require('./add-external-admin.html');
  public bindings = {
    dismiss: '&',
  };
}
