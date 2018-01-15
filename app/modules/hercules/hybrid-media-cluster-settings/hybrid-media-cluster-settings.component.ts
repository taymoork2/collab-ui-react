import { IExtendedClusterFusion, ICluster, IClusterPropertySet } from 'modules/hercules/hybrid-services.types';
import { HybridServicesClusterService } from 'modules/hercules/services/hybrid-services-cluster.service';
import { ClusterService } from 'modules/hercules/services/cluster-service';
import { Notification } from 'modules/core/notifications';
import { IDeregisterModalOptions } from 'modules/hercules/rename-and-deregister-cluster-section/hs-rename-and-deregister-cluster.component';

interface ITag {
  text: string;
}

class HybridMediaClusterSettingsCtrl implements ng.IComponentController {

  public hasMfPhaseTwoToggle: boolean;
  public hasMfTrustedSipToggle: boolean;
  public clusterId: string;
  public cluster: ICluster;
  public clusterList: IExtendedClusterFusion[] = [];

  public sipurlconfiguration: string | undefined;
  public trustedsipconfiguration: ITag[] = [];

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
  public sipRegistration = {
    title: 'mediaFusion.sipconfiguration.title',
  };

  public trustedSip = {
    title: 'mediaFusion.trustedSip.title',
  };

  /* @ngInject */
  constructor(
    private ClusterService: ClusterService,
    private HybridServicesClusterService: HybridServicesClusterService,
    private Notification: Notification,
  ) { }

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject<any> }) {

    const { clusterId } = changes;
    if (clusterId && clusterId.currentValue) {
      this.clusterId = clusterId.currentValue;
      this.getClusterList()
      .then(() => this.loadCluster(clusterId.currentValue))
      .then(() => this.getProperties(clusterId.currentValue));
    }
  }

  private loadCluster(clusterId) {
    return this.HybridServicesClusterService.get(clusterId)
      .then((cluster) => {
        this.cluster = cluster;

        if (cluster.connectors && cluster.connectors.length === 0 && this.clusterList.length > 1) {
          /* We have cluster data, but there are no nodes. Let's use the default deregistration dialog.  */
          this.deregisterModalOptions = undefined;
        }
        return cluster;
      });
  }

  private getClusterList() {
    return this.HybridServicesClusterService.getAll()
      .then((clusters) => {
        this.clusterList = _.filter(clusters, {
          targetType: 'mf_mgmt',
        });
      });
  }

  private getProperties(clusterId) {
    this.ClusterService.getProperties(clusterId)
      .then((properties: IClusterPropertySet) => {
        if (!_.isUndefined(properties['mf.ucSipTrunk'])) {
          this.sipurlconfiguration = properties['mf.ucSipTrunk'];
        }
        let rawTrustedSipConfigurationData;
        if (!_.isUndefined(properties['mf.trustedSipSources'])) {
          rawTrustedSipConfigurationData = properties['mf.trustedSipSources'];
        }
        let sipArray: ITag[] = [];
        if (!_.isUndefined(rawTrustedSipConfigurationData)) {
          sipArray = _.map(rawTrustedSipConfigurationData.split(','), (value: string) => {
            return {
              text: value.trim(),
            };
          }) as ITag[];
        }
        if (rawTrustedSipConfigurationData !== '') {
          this.trustedsipconfiguration = sipArray;
        } else {
          this.trustedsipconfiguration = [];
        }
      });
  }

  public saveSipTrunk() {
    const payload: IClusterPropertySet = {
      'mf.ucSipTrunk': this.sipurlconfiguration,
    };
    this.ClusterService.setProperties(this.clusterId, payload)
      .then(() => {
        this.Notification.success('mediaFusion.sipconfiguration.success');
      })
      .catch((error) => {
        this.Notification.errorWithTrackingId(error, 'hercules.genericFailure');
      });
  }

  public saveTrustedSip() {
    const payload: IClusterPropertySet = {
      'mf.trustedSipSources': _.map(this.trustedsipconfiguration, 'text').join(', '),
    };
    this.ClusterService.setProperties(this.clusterId, payload)
      .then(() => {
        this.Notification.success('mediaFusion.trustedSip.success');
      })
      .catch((error) => {
        this.Notification.errorWithTrackingId(error, 'hercules.genericFailure');
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
  };
}
