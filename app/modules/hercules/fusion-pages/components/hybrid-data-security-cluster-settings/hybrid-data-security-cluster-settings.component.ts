class HybridDataSecurityClusterSettingsPageCtrl implements ng.IComponentController {

  public cluster: any;

  /* @ngInject */
  constructor(
    private $rootScope: ng.IRootScopeService,
    private FusionClusterService,
  ) {}

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject }) {
    const { clusterId } = changes;
    if (clusterId && clusterId.currentValue) {
      this.loadCluster(clusterId.currentValue);
    }
  }

  private loadCluster(clusterId) {
    return this.FusionClusterService.get(clusterId)
      .then((cluster) => {
        this.cluster = cluster;
      });
  }

  /* Callback function used by <rename-and-deregister-cluster-section>  */
  public nameUpdated(name) {
    this.$rootScope.$emit('cluster-name-update', name);
  }
}

export class HybridDataSecurityClusterSettingsPageComponent implements ng.IComponentOptions {
  public controller = HybridDataSecurityClusterSettingsPageCtrl;
  public templateUrl = 'modules/hercules/fusion-pages/components/hybrid-data-security-cluster-settings/hybrid-data-security-cluster-settings.html';
  public bindings = {
    clusterId: '<',
  };
}

export default angular
  .module('Hercules')
  .component('hybridDataSecurityClusterSettings', new HybridDataSecurityClusterSettingsPageComponent())
  .name;
