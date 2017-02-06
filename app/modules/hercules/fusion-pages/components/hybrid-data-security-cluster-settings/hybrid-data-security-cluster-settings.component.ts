class HybridDataSecurityClusterSettingsPageCtrl implements ng.IComponentController {

  public cluster: any;

  private clusterId: string;

  /* @ngInject */
  constructor(
    private $stateParams: ng.ui.IStateParamsService,
    private FusionClusterService,
  ) {}

  public $onInit() {
    this.clusterId = this.$stateParams['id'];
    this.loadCluster();
  }

  private loadCluster(): void {
    return this.FusionClusterService.get(this.clusterId)
      .then((cluster) => {
        this.cluster = cluster;
      });
  }

}

export class HybridDataSecurityClusterSettingsPageComponent implements ng.IComponentOptions {
  public controller = HybridDataSecurityClusterSettingsPageCtrl;
  public templateUrl = 'modules/hercules/fusion-pages/components/hybrid-data-security-cluster-settings/hybrid-data-security-cluster-settings.html';
}

export default angular
  .module('Hercules')
  .component('hybridDataSecurityClusterSettings', new HybridDataSecurityClusterSettingsPageComponent())
  .name;
