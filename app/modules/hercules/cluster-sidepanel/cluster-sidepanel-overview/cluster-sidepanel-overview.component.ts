import { IClusterV1 } from 'modules/hercules/herculesInterfaces';

class ClusterSidepanelOverviewCtrl implements ng.IComponentController {

  private clusterId: string;

  private cluster: IClusterV1;
  public hasNodesViewFeatureToggle: boolean;
  public hasResourceGroupFeatureToggle: boolean;

  public clusterType: string;
  public connectorType: string;

  /* @ngInject */
  constructor(
    private $rootScope: ng.IRootScopeService,
    private $scope: ng.IScope,
    private $state: ng.ui.IStateService,
    private $translate: ng.translate.ITranslateService,
    private ClusterService,
  ) {}

  public $onInit() {
    this.$state.current.data.displayName = this.$translate.instant('common.overview');
    this.$rootScope.$broadcast('displayNameUpdated');
    if (this.clusterId && this.connectorType) {
      this.$scope.$watch(() => {
        return this.ClusterService.getCluster(this.connectorType, this.clusterId);
      }, newValue => {
        this.cluster = newValue;
      }, true);
    }
  }

  public isExpresswayCluster() {
    return this.cluster && this.cluster.targetType === 'c_mgmt';
  }

  public isHDSCluster() {
    return this.cluster && this.cluster.targetType === 'hds_app';
  }

  public isMediaCluster() {
    return this.cluster && this.cluster.targetType === 'mf_mgmt';
  }

  public hasConnectors() {
    return this.cluster && this.cluster.connectors.length > 0;
  }

  public goToNodesPage(): void {
    if (this.cluster.targetType === 'c_mgmt') {
      this.$state.go('expressway-cluster.nodes', {
        id: this.clusterId,
      });
    } else if (this.cluster.targetType === 'mf_mgmt') {
      this.$state.go('mediafusion-cluster.nodes', {
        id: this.clusterId,
      });
    } else if (this.cluster.targetType === 'hds_app') {
      this.$state.go('hds-cluster.nodes', {
        id: this.clusterId,
      });
    }
  }
}

export class ClusterSidepanelOverviewComponent implements ng.IComponentOptions {
  public controller = ClusterSidepanelOverviewCtrl;
  public templateUrl = 'modules/hercules/cluster-sidepanel/cluster-sidepanel-overview/cluster-sidepanel-overview.html';
  public bindings = {
    clusterType: '<',
    clusterId: '<',
    connectorType: '<',
    hasNodesViewFeatureToggle: '<',
    hasResourceGroupFeatureToggle: '<',
  };
}
