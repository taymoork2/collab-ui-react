import { IClusterV1 } from 'modules/hercules/herculesInterfaces';

interface IClusterIdStateParam extends ng.ui.IStateParamsService {
  clusterId: string;
  connectorType: string;
}

class ClusterSidepanelOverviewCtrl implements ng.IComponentController {

  private clusterId: string;
  private connectorType: string;
  private hasF237FeatureToggle = false;
  private cluster: IClusterV1;
  private managementCluster: IClusterV1;

  /* @ngInject */
  constructor(
    private $scope: ng.IScope,
    private $stateParams: IClusterIdStateParam,
    private ClusterService,
    private FeatureToggleService,
  ) {
    this.FeatureToggleService.supports(FeatureToggleService.features.atlasF237ResourceGroups)
      .then(supported => {
        if (supported) {
          this.hasF237FeatureToggle = true;
        }
      });
  }

  public $onInit() {
    this.clusterId = this.$stateParams.clusterId;
    this.connectorType = this.$stateParams.connectorType;

    this.$scope.$watch(() => {
      return [
        this.ClusterService.getCluster(this.connectorType, this.clusterId),
        this.ClusterService.getCluster('c_mgmt', this.clusterId),
      ];
    }, newValue => {
      this.cluster = newValue[0];
      this.managementCluster = newValue[1];
    }, true);
  }

  public isEmptyExpresswayCluster(): boolean {
    return this.cluster.targetType === 'c_mgmt' && this.cluster.connectors.length === 0;
  }

}

export class ClusterSidepanelOverviewComponent implements ng.IComponentOptions {
  public controller = ClusterSidepanelOverviewCtrl;
  public templateUrl = 'modules/hercules/cluster-sidepanel/cluster-sidepanel-overview/cluster-sidepanel-overview.html';
}
