import { IFeature } from 'modules/core/components/featureList/featureList.component';
import { IUser } from 'modules/core/auth/user/user';

class CmcUserDetailsController implements ng.IComponentController {

  public services: Array<IFeature>;
  public preCheckOk: boolean = false;

  private user: IUser;

  /* @ngInject */
  constructor(private $log: ng.ILogService, private $state: ng.ui.IStateService, private Orgservice, private UserOverviewService) {
    this.services = new Array<IFeature>();
    this.$log.debug('UserOverviewService', this.UserOverviewService);
    this.$log.debug('Orgservice', this.Orgservice);
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
        this.preCheckOk = this.preCheck(this.user.meta.organizationID);
      }
    }
  }

  private preCheck(orgId: string): boolean {
    // TODO 1. Based on feature toggle 2. figure out correct way
    this.Orgservice.getOrg((data, success) => {
      if (success) {
        this.$log.debug('org', data);
      }
    }, orgId, {
      basicInfo: true,
    });
    // this.$log.debug('org', org);
    this.$log.debug('orgId', orgId);
    return true;
  }
}

export class CmcUserDetailsComponent implements ng.IComponentOptions {
  public controller = CmcUserDetailsController;
  public templateUrl = 'modules/cmc/user-details.component.html';
  public bindings = {
    user: '<',
  };
}
