class HybridDataSecurityClusterSettingsPageCtrl implements ng.IComponentController {

  public localizedTitle: string;
  public backUrl: string = 'cluster-list';
  public cluster: any;

  private clusterId: string;

  /* @ngInject */
  constructor(
    private $stateParams,
    private $translate: ng.translate.ITranslateService,
    private FusionClusterService,
  ) {
  }

  public $onInit() {
    this.clusterId = this.$stateParams.id;
    this.loadCluster();
  }

  public nameUpdated(): void {
    this.loadCluster();
  }

  private loadCluster(): void {
    return this.FusionClusterService.get(this.clusterId)
      .then((cluster) => {
        this.cluster = cluster;
        this.localizedTitle = this.$translate.instant('hercules.expresswayClusterSettings.pageTitle', {
          clusterName: this.cluster.name,
        });
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
