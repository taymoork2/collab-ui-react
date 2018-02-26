import { IExtendedClusterFusion, ICluster } from 'modules/hercules/hybrid-services.types';
import { HybridServicesClusterService } from 'modules/hercules/services/hybrid-services-cluster.service';
import { IDeregisterModalOptions } from 'modules/hercules/rename-and-deregister-cluster-section/hs-rename-and-deregister-cluster.component';

class HybridMediaClusterSettingsCtrl implements ng.IComponentController {

  public hasMfPhaseTwoToggle: boolean;
  public hasMfTrustedSipToggle: boolean;
  public hasMfCascadeBwConfigToggle: boolean;
  public clusterId: string;
  public cluster: ICluster;
  public clusterList: IExtendedClusterFusion[] = [];

  public deregisterModalOptions: IDeregisterModalOptions | undefined = {
    resolve: {
      cluster: () => this.cluster,
    },
    controller: 'DeleteClusterSettingControllerV2',
    controllerAs: 'deleteClust',
    template: require('modules/mediafusion/media-service-v2/delete-cluster/delete-cluster-dialog.html'),
  };

  public upgradeSchedule = {
    title: 'hercules.expresswayClusterSettings.upgradeScheduleHeader',
  };

  /* @ngInject */
  constructor(
    private HybridServicesClusterService: HybridServicesClusterService,
  ) { }

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject<any> }) {

    const { clusterId } = changes;
    if (clusterId && clusterId.currentValue) {
      this.clusterId = clusterId.currentValue;
      this.updateClusterList()
      .then(() => this.loadCluster(clusterId.currentValue));
    }
  }

  private loadCluster(clusterId) {
    return this.HybridServicesClusterService.get(clusterId)
      .then((cluster) => {
        this.cluster = cluster;

        if (cluster.connectors && cluster.connectors.length === 0 && this.clusterList.length > 1) {
          this.deregisterModalOptions = undefined;
        }
        return cluster;
      });
  }

  private updateClusterList() {
    return this.HybridServicesClusterService.getAll()
      .then((clusters) => {
        this.clusterList = _.filter(clusters, {
          targetType: 'mf_mgmt',
        });
      });
  }

}

export class HybridMediaClusterSettingsComponent implements ng.IComponentOptions {
  public controller = HybridMediaClusterSettingsCtrl;
  public template = require('./hybrid-media-cluster-settings.html');
  public bindings = {
    clusterId: '<',
    hasMfPhaseTwoToggle: '<',
    hasMfTrustedSipToggle: '<',
    hasMfCascadeBwConfigToggle: '<',
  };
}
