import { IFeature } from 'modules/core/components/featureList/featureList.component';
import { IUser } from 'modules/core/auth/user/user';
import { CmcService } from './cmc.service';
import { ICmcOrgStatusResponse, ICmcIssue } from './cmc.interface';
import { Notification } from 'modules/core/notifications';

class CmcUserDetailsController implements ng.IComponentController {

  public services: Array<IFeature>;
  public allowCmcSettings: boolean = false;

  private user: IUser;
  public preCheckOnOrg: boolean = false;
  public issues: ICmcIssue[];

  /* @ngInject */
  constructor(private $log: ng.ILogService,
              private $state: ng.ui.IStateService,
              private CmcService: CmcService,
              private UserOverviewService,
              private Notification: Notification) {
    this.services = [];
    this.$log.debug('UserOverviewService', this.UserOverviewService);
    this.services.push({
      name: 'Collaboration Mobile Convergence',
      icon: 'icon-circle-mobile',
      actionAvailable: false,
      detail: '',
      state: 'cmc',
    });
    this.$log.debug('state', this.$state);
  }

  public clickService(feature: IFeature) {
    this.$log.debug('feature', feature);
    this.$state.go('user-overview.' + feature.state);
  }

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject }): void {
    let userChanges = changes['user'];
    this.$log.debug('userChanges', userChanges);
    if (userChanges) {
      if (userChanges.currentValue) {
        this.user = <IUser>userChanges.currentValue;
        this.CmcService.allowCmcSettings(this.user.meta.organizationID).then((res: boolean) =>  {
          this.$log.debug('allowCmcSettings:', res);
          this.allowCmcSettings = res;
          if (this.allowCmcSettings) {
            this.CmcService.preCheckOrg(this.user.meta.organizationID).then((res: ICmcOrgStatusResponse) => {
              this.$log.debug('CMC mock status', res);
              // this.allowCmcSettings = (res.status === 'ok');
              this.preCheckOnOrg = (res.status === 'ok');
              if (!this.preCheckOnOrg) {
                this.updateFeatureOnError(res);
              } else {
                this.services[0].actionAvailable = true;
              }
            }, (error) => {
              this.$log.debug('error', error);
              this.Notification.error('cmc.failures.preCheckFailure');
            });
          }
        });
      }
    }
  }

  private updateFeatureOnError(status: ICmcOrgStatusResponse): void {
    if (status.issues) {
      this.issues = status.issues;
    }
    this.services[0].state = 'cmc.status';
  }

}

export class CmcUserDetailsComponent implements ng.IComponentOptions {
  public controller = CmcUserDetailsController;
  public templateUrl = 'modules/cmc/user-details.component.html';
  public bindings = {
    user: '<',
  };
}
