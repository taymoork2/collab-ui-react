import { IFeature } from 'modules/core/components/featureList/featureList.component';
import { IUser } from 'modules/core/auth/user/user';
import { CmcService } from './../cmc.service';

import { ICmcOrgStatusResponse, ICmcUserStatusResponse, ICmcIssue } from './../cmc.interface';
import { Notification } from 'modules/core/notifications';

class CmcUserDetailsController implements ng.IComponentController {

  public services: IFeature[];
  public allowCmcSettings: boolean = false;

  private user: IUser;
  public orgReady: boolean = false;
  public userReady: boolean = false;
  private timeoutStatus: number = -1;

  public issues: ICmcIssue[];

  /* @ngInject */
  constructor(private $log: ng.ILogService,
              private $q: ng.IQService,
              private $state: ng.ui.IStateService,
              private $translate,
              private CmcService: CmcService,
              private Notification: Notification) {
    this.services = [];
    this.services.push(<IFeature>{
      name: $translate.instant('cmc.userMenu.mobile'),
      icon: 'icon-circle-mobile',
      actionAvailable: false,
      detail: this.$translate.instant('cmc.userMenu.statusOk'),
      state: 'cmc',
    });
    this.$log.debug('state', this.$state);
  }

  public clickService(feature: IFeature) {
    this.$log.debug('feature', feature);
    this.$state.go('user-overview.' + feature.state);
  }

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject<any> }): void {
    const userChanges = changes['user'];
    this.$log.debug('userChanges', userChanges);
    if (userChanges) {
      if (userChanges.currentValue) {
        this.user = <IUser>userChanges.currentValue;
        this.validateOrgAndUserContent(this.user);
      }
    }
  }

  public validateOrgAndUserContent(user: IUser) {
    this.issues = [];
    this.orgReady = false;
    this.userReady = false;
    this.services[ 0 ].actionAvailable = true;
    this.CmcService.allowCmcSettings(user.meta.organizationID)
      .then((res: boolean) => {
        this.$log.debug('allowCmcSettings:', res);
        this.allowCmcSettings = res;
        if (this.allowCmcSettings) {
          this.precheckOrg(user.meta.organizationID)
            .then((res: ICmcOrgStatusResponse) => {
              this.orgReady = (res.status === 'ok');
              if (this.isUserCmcEntitled(user)) {
                this.precheckUser(user)
                  .then((res: ICmcUserStatusResponse) => {
                    this.userReady = (res.status === 'ok');
                  });
              }
            });
        }
      }).catch((error) => {
        this.$log.debug('error', error);
        let msg: string = 'unknown';
        if (error.Errors && error.Errors.length > 0) {
          msg = error.Errors[0].description;
        }
        this.Notification.error('cmc.failures.preCheckFailure', { msg: msg });
        this.services[ 0 ].actionAvailable = false;
      });
  }

  private precheckUser(user: IUser): ng.IPromise<ICmcUserStatusResponse> {
    return this.CmcService.preCheckUser(user)
      .then((res: ICmcUserStatusResponse) => {
        this.$log.debug('precheckUser:', res);
        if (res.status === 'error' && res.issues) {
          this.issues.push(res.issues[ 0 ]);
          this.services[ 0 ].detail = this.$translate.instant('cmc.userMenu.statusNok');
        }
        return res;
      });
  }

  private isUserCmcEntitled(user: IUser): boolean {
    return _.includes(user.entitlements, 'cmc');
  }

  private precheckOrg(orgId: string): ng.IPromise<ICmcOrgStatusResponse> {
    return this.CmcService.preCheckOrg(orgId)
      .then((res: ICmcOrgStatusResponse) => {
        this.$log.debug('precheckOrg', res);
        if (res.status === 'error' && res.issues) {
          this.issues.push(res.issues[ 0 ]);
          this.services[ 0 ].detail = this.$translate.instant('cmc.userMenu.statusNok');
        }
        return res;
      })
      .catch((error) => {
        this.$log.debug('error', error);
        let msg: string = 'unknown';
        if (error && error.status && error.status === this.timeoutStatus) {
          msg = 'Request Timeout';
        } else if (error.data && error.data.message) {
          msg = error.data.message;
        }
        this.Notification.error('cmc.failures.preCheckFailure', { msg: msg });
        this.services[ 0 ].actionAvailable = false;
        return this.$q.reject(error);
      });
  }
}

export class CmcUserDetailsComponent implements ng.IComponentOptions {
  public controller = CmcUserDetailsController;
  public templateUrl = 'modules/cmc/user-menu/user-details.component.html';
  public bindings = {
    user: '<',
  };
}
