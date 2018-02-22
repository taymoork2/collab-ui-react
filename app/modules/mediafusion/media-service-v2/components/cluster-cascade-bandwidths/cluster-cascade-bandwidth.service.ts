import { IClusterPropertySet } from 'modules/hercules/hybrid-services.types';

import { HybridServicesClusterService } from 'modules/hercules/services/hybrid-services-cluster.service';
import { Notification } from 'modules/core/notifications';

export class ClusterCascadeBandwidthService {

  /* @ngInject */
  constructor(
    private HybridServicesClusterService: HybridServicesClusterService,
    private Notification: Notification,
  ) { }

  public saveCascadeConfig(clusterId: string, cascadeBandwidthConfiguration: number) {
    if (_.isUndefined(cascadeBandwidthConfiguration)) {
      cascadeBandwidthConfiguration = 42;
    }
    const payload: IClusterPropertySet = {
      'mf.maxCascadeBandwidth': cascadeBandwidthConfiguration,
    };
    this.HybridServicesClusterService.setProperties(clusterId, payload)
      .then(() => {
        this.Notification.success('mediaFusion.clusterBandwidth.success');
      })
      .catch((error) => {
        this.Notification.errorWithTrackingId(error, 'hercules.genericFailure');
      });
  }
}
