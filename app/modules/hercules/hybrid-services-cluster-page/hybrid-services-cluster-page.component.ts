import { HybridServicesClusterService } from 'modules/hercules/services/hybrid-services-cluster.service';

class HybridServicesClusterPageCtrl implements ng.IComponentController {
  public tabs: { title: string, state: string }[] = [];
  public title: string;
  public backState = 'cluster-list';

  /* @ngInject */
  constructor(
    private $rootScope: ng.IRootScopeService,
    private $scope: ng.IScope,
    private HybridServicesClusterService: HybridServicesClusterService,
    private $translate: ng.translate.ITranslateService,
  ) {}

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject<any> }) {
    const { clusterId, backState } = changes;
    if (clusterId && clusterId.currentValue) {
      this.init(clusterId.currentValue);
    }
    if (backState && backState.currentValue) {
      this.backState = backState.currentValue;
    }
  }

  private updateName(name: string): void {
    this.title = name;
  }

  private init(id) {
    this.HybridServicesClusterService.get(id)
      .then(cluster => {
        this.updateName(cluster.name);
        let route;
        switch (cluster.targetType) {
          case 'c_mgmt':
            route = 'expressway';
            break;
          case 'mf_mgmt':
            route = 'mediafusion';
            break;
          case 'hds_app':
            route = 'hds';
            break;
          case 'ucm_mgmt':
            route = 'cucm';
            break;
          case 'cs_mgmt':
            route = 'context';
            break;
          default:
            route = '';
        }
        this.tabs = [{
          title: this.$translate.instant('common.nodes'),
          state: `${route}-cluster.nodes`,
        }, {
          title: this.$translate.instant('common.settings'),
          state: `${route}-cluster.settings`,
        }];
        // Context clusters doesn't have settings so no need to display the tabs for now
        if (cluster.targetType === 'cs_mgmt') {
          this.tabs = [];
        }
      });

    const deregister = this.$rootScope.$on('cluster-name-update', (_event, name) => {
      this.updateName(name);
    });

    this.$scope.$on('$destroy', deregister);
  }
}

export class HybridServicesClusterPageComponent implements ng.IComponentOptions {
  public controller = HybridServicesClusterPageCtrl;
  public template = require('modules/hercules/hybrid-services-cluster-page/hybrid-services-cluster-page.html');
  public bindings = {
    backState: '<',
    clusterId: '<',
  };
}
