import { HybridServicesClusterService } from 'modules/hercules/services/hybrid-services-cluster.service';

class CucmClusterSettingsPageCtrl implements ng.IComponentController {

  public cluster: any;

  /* @ngInject */
  constructor(
    private $rootScope: ng.IRootScopeService,
    private HybridServicesClusterService: HybridServicesClusterService,
  ) {}

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject<any> }) {
    const { clusterId } = changes;
    if (clusterId && clusterId.currentValue) {
      this.loadCluster(clusterId.currentValue);
    }
  }

  private loadCluster(clusterId) {
    return this.HybridServicesClusterService.get(clusterId)
      .then((cluster) => {
        this.cluster = cluster;
      });
  }

  /* Callback function used by <hs-cluster-section> */
  public nameUpdated(name) {
    this.$rootScope.$emit('cluster-name-update', name);
  }
}

export class CucmClusterSettingsPageComponent implements ng.IComponentOptions {
  public controller = CucmClusterSettingsPageCtrl;
  public template = require('modules/hercules/cucm-cluster-settings/cucm-cluster-settings.component.html');
  public bindings = {
    clusterId: '<',
  };
}

export default angular
  .module('Hercules')
  .component('cucmClusterSettings', new CucmClusterSettingsPageComponent())
  .name;
