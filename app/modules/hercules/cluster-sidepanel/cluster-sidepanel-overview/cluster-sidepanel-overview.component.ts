import { ClusterService } from 'modules/hercules/services/cluster-service';
import { IExtendedCluster, ConnectorType, ClusterTargetType } from 'modules/hercules/hybrid-services.types';

export class ClusterSidepanelOverviewCtrl implements ng.IComponentController {

  private clusterId: string;

  private cluster: IExtendedCluster;
  public hasResourceGroupFeatureToggle: boolean;

  public clusterType: ClusterTargetType;
  public connectorType: ConnectorType;

  /* @ngInject */
  constructor(
    private $rootScope: ng.IRootScopeService,
    private $scope: ng.IScope,
    private $state: ng.ui.IStateService,
    private $translate: ng.translate.ITranslateService,
    private ClusterService: ClusterService,
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

  public isContextCluster() {
    return this.cluster && this.cluster.targetType === 'cs_mgmt';
  }

  public hasConnectors() {
    return this.cluster && this.cluster.connectors.length > 0;
  }

  public goToNodesPage(): void {
    if (this.cluster.targetType === 'c_mgmt') {
      this.$state.go('expressway-cluster.nodes', {
        id: this.clusterId,
        backState: this.connectorType === 'c_cal' ? 'calendar-service.list' : 'call-service.list',
      });
    } else if (this.cluster.targetType === 'mf_mgmt') {
      this.$state.go('mediafusion-cluster.nodes', {
        id: this.clusterId,
        backState: 'media-service-v2.list',
      });
    } else if (this.cluster.targetType === 'hds_app') {
      this.$state.go('hds-cluster.nodes', {
        id: this.clusterId,
        backState: 'hds.list',
      });
    } else if (this.isContextCluster()) {
      this.$state.go('context-cluster.nodes', {
        id: this.clusterId,
        backState: 'context-resources',
      });
    }
  }

  public showMediaUpgradeSection(): boolean {
    return this.isMediaCluster() && this.hasConnectors() && this.cluster.releaseChannel !== 'latest';
  }

  public showButtonToNodesPage(): boolean {
    // Doesn't make sense for empty Expressways and EPT
    // Media doesn't really use the nodes page yet, they still have the node list on this sidepanel
    return !(this.isExpresswayCluster() && !this.hasConnectors())
      && !this.isMediaCluster();
  }
}

export class ClusterSidepanelOverviewComponent implements ng.IComponentOptions {
  public controller = ClusterSidepanelOverviewCtrl;
  public template = require('modules/hercules/cluster-sidepanel/cluster-sidepanel-overview/cluster-sidepanel-overview.html');
  public bindings = {
    clusterType: '<',
    clusterId: '<',
    connectorType: '<',
    hasResourceGroupFeatureToggle: '<',
  };
}
