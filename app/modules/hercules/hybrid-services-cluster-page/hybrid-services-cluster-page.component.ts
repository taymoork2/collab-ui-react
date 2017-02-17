class HybridServicesClusterPageCtrl implements ng.IComponentController {
  public tabs: { title: string, state: string }[] = [];
  public localizedTitle: string;
  public backUrl: string = 'cluster-list';
  public hasNodesViewFeatureToggle: boolean;

  /* @ngInject */
  constructor(
    private $rootScope: ng.IRootScopeService,
    private $scope: ng.IScope,
    private $translate: ng.translate.ITranslateService,
    private FusionClusterService,
  ) {}

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject }) {
    let clusterId = changes['clusterId'];
    if (clusterId && clusterId.currentValue) {
      this.init(clusterId.currentValue);
    }
  }

  private updateName(name: string): void {
    this.localizedTitle = this.$translate.instant('hercules.expresswayClusterSettings.pageTitle', {
      clusterName: name,
    });
  }

  private init(id) {
    this.FusionClusterService.get(id)
      .then(cluster => {
        this.updateName(cluster.name);
        let route = '';
        if (cluster.targetType === 'c_mgmt') {
          route = 'expressway';
        } else if (cluster.targetType === 'mf_mgmt') {
          route = 'mediafusion';
        } else if (cluster.targetType === 'hds_app') {
          route = 'hds';
        }
        // Don't show any tabs if the "Nodes" one is not available
        // Only the "Settings" tab would be weird
        if (this.hasNodesViewFeatureToggle) {
          this.tabs = [{
            title: this.$translate.instant('common.nodes'),
            state: `${route}-cluster.nodes`,
          }, {
            title: this.$translate.instant('common.settings'),
            state: `${route}-cluster.settings`,
          }];
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
  public templateUrl = 'modules/hercules/hybrid-services-cluster-page/hybrid-services-cluster-page.html';
  public bindings = {
    clusterId: '<',
    hasNodesViewFeatureToggle: '<',
  };
}
