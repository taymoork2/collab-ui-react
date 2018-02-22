import { IClusterPropertySet } from 'modules/hercules/hybrid-services.types';
import { HybridServicesClusterService } from 'modules/hercules/services/hybrid-services-cluster.service';
import { Notification } from 'modules/core/notifications';
interface ITag {
  text: string;
}
export class TrustedSipSectionService {

  /* @ngInject */
  constructor(
    private HybridServicesClusterService: HybridServicesClusterService,
    private Notification: Notification,
  ) { }

  public saveSipConfigurations(trustedsipconfiguration: ITag[], clusterId: string): void {
    const payload: IClusterPropertySet = {
      'mf.trustedSipSources': _.map(trustedsipconfiguration, 'text').join(', '),
    };
    this.HybridServicesClusterService.setProperties(clusterId, payload)
      .then(() => {
        this.Notification.success('mediaFusion.trustedSip.success');
      })
      .catch((error) => {
        this.Notification.errorWithTrackingId(error, 'hercules.genericFailure');
      });
  }
}
