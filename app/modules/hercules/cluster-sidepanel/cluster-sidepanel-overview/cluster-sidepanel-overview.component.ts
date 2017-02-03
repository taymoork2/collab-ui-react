import { IClusterV1 } from 'modules/hercules/herculesInterfaces';

class ClusterSidepanelOverviewCtrl implements ng.IComponentController {

  private clusterId: string;
  private connectorType: string;
  private hasF237FeatureToggle: boolean = false;
  private cluster: IClusterV1;

  public clusterType: string;

  /* @ngInject */
  constructor(
    private $scope: ng.IScope,
    private ClusterService,
    private FeatureToggleService,
  ) {
    this.FeatureToggleService.supports(FeatureToggleService.features.atlasF237ResourceGroups)
      .then(supported => {
        this.hasF237FeatureToggle = supported;
      });
  }

  public $onInit() {
    if (this.clusterId && this.connectorType) {
      this.$scope.$watch(() => {
        return this.ClusterService.getCluster(this.connectorType, this.clusterId);
      }, newValue => {
        this.cluster = newValue;
      }, true);
    }
  }

  public isEmptyExpresswayCluster() {
    return this.cluster.targetType === 'c_mgmt' && this.cluster.connectors.length === 0;
  }

}

export class ClusterSidepanelOverviewComponent implements ng.IComponentOptions {
  public controller = ClusterSidepanelOverviewCtrl;
  public templateUrl = 'modules/hercules/cluster-sidepanel/cluster-sidepanel-overview/cluster-sidepanel-overview.html';
  public bindings = {
    clusterType: '<',
    clusterId: '<',
    connectorType: '<',
  };
}
