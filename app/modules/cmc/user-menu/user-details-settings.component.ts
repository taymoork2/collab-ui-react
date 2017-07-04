import { CmcService } from './../cmc.service';
import { IUser } from 'modules/core/auth/user/user';
import { ICmcOrgStatusResponse, ICmcUserStatusResponse, ICmcUserData, ICmcUser, ICmcIssue } from './../cmc.interface';
import { Notification } from 'modules/core/notifications';

class CmcUserDetailsSettingsController implements ng.IComponentController {

  private user: ICmcUser;
  public entitled: boolean = false;
  public validDataChange: boolean = false;
  public mobileNumber: string;
  public invalid: boolean = false;
  public invalidMessage: string | null;
  public orgReady: boolean = false;
  public userReady: boolean = false;

  public issues: ICmcIssue[] | null = null;
  private orgIssues: ICmcIssue[] | null;
  public messages = {
    pattern: 'Invalid Mobile Number',
  };
  private oldCmcUserData: ICmcUserData;

  /* @ngInject */
  constructor(private $log: ng.ILogService,
              private $translate: ng.translate.ITranslateService,
              private CmcService: CmcService,
              private Notification: Notification) {
    this.$log.debug('CmcUserDetailsSettingsController');
  }

  public $onInit() {
    this.$log.debug('$onInit');
    this.extractCmcData();
    this.oldCmcUserData = <ICmcUserData> {
      mobileNumber: this.mobileNumber,
      entitled: this.entitled,
    };

    this.$log.warn('Current user:', this.user);
    if (this.isUserCmcEntitled(this.user)) {
      this.validateOrgAndUserContent(this.user);
    }
  }

  private isUserCmcEntitled(user: ICmcUser): boolean {
    return _.includes(user.entitlements, 'cmc');
  }

  private extractCmcData() {
    const persistedCmcData: ICmcUserData = this.CmcService.getUserData(this.user);
    this.entitled = persistedCmcData.entitled;
    this.mobileNumber = persistedCmcData.mobileNumber;
  }

  //TODO: Not supposed to happen.
  //      Are we sure that we handle things correctly when user changes
  //      while we're in the cmc settings page for the user.
  //      For example in the middle of a save dialog...
  // public $onChanges(changes: { [bindings: string]: ng.IChangesObject }): void {
  //   let userChanges = changes['user'];
  //   this.$log.warn('user changed unexpectedly:', userChanges);
  //   if (userChanges) {
  //     if (userChanges.currentValue) {
  //       this.user = <ICmcUser>userChanges.currentValue;
  //       this.extractCmcData();
  //     }
  //   }
  // }

  public save(): void {
    const newData: ICmcUserData = {
      mobileNumber: this.mobileNumber,
      entitled: this.entitled,
    };
    this.$log.warn('trying to set data', newData, ', id=', this.user.id);
    this.CmcService.setUserData(this.user, newData).then(() => {
      this.oldCmcUserData.entitled = this.entitled;
      this.oldCmcUserData.mobileNumber = this.mobileNumber;
      this.validDataChange = false;
    }).catch((error) => {
      if (error.data && error.data.Errors) {
        this.Notification.error('cmc.failures.saveFailure', { msg: error.data.Errors[0].description });
      } else if (error.data && error.data.message) {
        this.Notification.error('cmc.failures.saveFailure', { msg: error.data.message });
      }
    });
  }

  public cancel(): void {
    this.entitled = this.oldCmcUserData.entitled;
    this.mobileNumber = this.oldCmcUserData.mobileNumber;
    this.validDataChange = false;
    this.issues = this.orgIssues;
  }

  public dataChanged() {
    const valid: boolean = this.validate();
    this.$log.debug('invalid', !valid, this.mobileChanged(), this.enableChanged());
    this.invalid = !valid && (this.mobileChanged() || this.enableChanged());
    this.validDataChange = valid;
    this.invalidMessage = this.getInvalidMessage();
    if (!this.invalid && this.entitled) {
      this.validateOrgAndUserContent(this.user);
    } else {
      this.orgIssues = this.issues;
      this.issues = null;
    }
  }

  public entitle(toggleValue) {
    this.entitled = toggleValue;
    const valid: boolean = this.validate();
    this.$log.debug('invalid', !valid, this.mobileChanged(), this.enableChanged());
    this.invalid = !valid && (this.mobileChanged() || this.enableChanged());
    this.validDataChange = valid;
    this.invalidMessage = this.getInvalidMessage();
    if (!this.invalid && toggleValue) {
      this.validateOrgAndUserContent(this.user);
    } else {
      this.orgIssues = this.issues;
      this.issues = null;
    }
  }

  public validateOrgAndUserContent(user: IUser) {
    this.issues = [];
    this.orgReady = false;
    this.userReady = false;
    this.precheckOrg(user.meta.organizationID)
      .then((res: ICmcOrgStatusResponse) => {
        this.orgReady = (res.status === 'ok');
        this.precheckUser(user)
          .then((res: ICmcUserStatusResponse) => {
            this.userReady = (res.status === 'ok');
          });
      });
    // this.precheckUser(user)
    //   .then((res: ICmcUserStatusResponse) => {
    //     console.warn('res', res);
    //     this.userReady = (res.status === 'ok');
    //   });
  }

  private precheckUser(user: IUser): ng.IPromise<ICmcUserStatusResponse> {
    return this.CmcService.preCheckUser(user)
      .then((res: ICmcUserStatusResponse) => {
        this.$log.debug('precheckUser:', res);
        if (res.status === 'error' && res.issues && this.issues) {
          this.issues.push(res.issues[ 0 ]);
        }
        return res;
      });
  }

  private precheckOrg(orgId: string): ng.IPromise<ICmcOrgStatusResponse> {
    return this.CmcService.preCheckOrg(orgId)
      .then((res: ICmcOrgStatusResponse) => {
        this.$log.debug('precheckOrg', res);
        if (res.status === 'error' && res.issues && this.issues) {
          this.issues.push(res.issues[ 0 ]);
        }
        return res;
      });
  }

  private mobileChanged(): boolean {
    return (this.mobileNumber !== this.oldCmcUserData.mobileNumber);
  }

  private enableChanged(): boolean {
    return (this.entitled !== this.oldCmcUserData.entitled);
  }

  private isE164(): boolean {
    const e164Regex: RegExp = /^\+(?:[0-9]?){6,14}[0-9]$/;
    return e164Regex.test(this.mobileNumber);
  }

  private validate(): boolean {
    const check1: boolean = (!_.isNil(this.mobileNumber) && this.mobileNumber.length === 0) && !this.entitled && (this.mobileChanged() || this.enableChanged());
    const check2: boolean = !_.isNil(this.mobileNumber) && this.isE164() && (this.mobileChanged() || this.enableChanged());
    const check3: boolean = !_.isNil(this.mobileNumber) && this.isE164() && this.mobileChanged() && !this.entitled;
    return check1 || check2 || check3;
  }

  private getInvalidMessage(): string | null {
    if (this.invalid) {
      if (this.entitled && (_.isNil(this.mobileNumber) || this.mobileNumber.length === 0)) {
        // return 'Always provide valid mobile number when enabling';
        return this.$translate.instant('cmc.details.invalidInput');
      }
    }
    return null;
  }
}

export class CmcUserDetailsSettingsComponent implements ng.IComponentOptions {
  public controller = CmcUserDetailsSettingsController;
  public templateUrl = 'modules/cmc/user-menu/user-details-settings.component.html';
  public bindings = {
    user: '<',
  };
}
