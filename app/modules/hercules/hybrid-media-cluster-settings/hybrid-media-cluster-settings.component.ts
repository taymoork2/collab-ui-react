import { IExtendedClusterFusion, ICluster } from 'modules/hercules/hybrid-services.types';
import { IToolkitModalService } from 'modules/core/modal';
import { HybridServicesClusterService } from 'modules/hercules/services/hybrid-services-cluster.service';
import { IDeregisterModalOptions } from 'modules/hercules/hs-cluster-section/hs-cluster-section.component';

class HybridMediaClusterSettingsCtrl implements ng.IComponentController {

  public hasMfPhaseTwoToggle: boolean;
  public hasMfTrustedSipToggle: boolean;
  public hasMfCascadeBwConfigToggle: boolean;
  public hasMfFirstTimeCallingFeatureToggle: boolean;
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

  public sparkCalls = {
    title: 'mediaFusion.easyConfig.sparkcalls',
  };

  /* @ngInject */
  constructor(
    private $modal: IToolkitModalService,
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

  public openSetUpModal() {
    this.$modal.open({
      template: require('modules/mediafusion/media-service-v2/components/first-time-calling/first-time-calling.html'),
      type: 'modal',
      controller: 'FirstTimeCallingController',
      controllerAs: 'vm',
      resolve: {
        cluster: () => this.cluster,
        spark: () => true,
      },
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
    hasMfFirstTimeCallingFeatureToggle: '<',
  };
}
