import { IFeature } from 'modules/core/components/featureList/featureList.component';
import { IUser } from 'modules/core/auth/user/user';
import { CmcService } from './cmc.service';

class CmcUserDetailsController implements ng.IComponentController {

  public services: Array<IFeature>;
  public allowCmcSettings: boolean = false;

  private user: IUser;

  /* @ngInject */
  constructor(private $log: ng.ILogService,
              private $state: ng.ui.IStateService,
              private CmcService: CmcService,
              private UserOverviewService) {
    this.services = [];
    this.$log.debug('UserOverviewService', this.UserOverviewService);
    this.services.push({
      name: 'Collaboration Mobile Convergence',
      icon: 'icon-circle-mobile',
      actionAvailable: false,
      detail: 'Activated',
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
        this.services[0].actionAvailable = true;
        this.CmcService.allowCmcSettings(this.user.meta.organizationID).then((res) =>  {
          this.$log.debug('allowCmcSettings:', res);
          this.allowCmcSettings = res;
        });
      }
    }
  }
}

export class CmcUserDetailsComponent implements ng.IComponentOptions {
  public controller = CmcUserDetailsController;
  public templateUrl = 'modules/cmc/user-details.component.html';
  public bindings = {
    user: '<',
  };
}
