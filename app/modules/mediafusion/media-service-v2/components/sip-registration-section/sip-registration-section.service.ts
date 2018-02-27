import { IClusterPropertySet } from 'modules/hercules/hybrid-services.types';
import { HybridServicesClusterService } from 'modules/hercules/services/hybrid-services-cluster.service';
import { Notification } from 'modules/core/notifications';

export class SipRegistrationSectionService {

  /* @ngInject */
  constructor(
    private HybridServicesClusterService: HybridServicesClusterService,
    private Notification: Notification,
  ) { }

  public saveSipTrunkUrl(sipConfigUrl: string | undefined, clusterId: string): void {
    const payload: IClusterPropertySet = {
      'mf.ucSipTrunk': sipConfigUrl,
    };
    this.HybridServicesClusterService.setProperties(clusterId, payload)
      .then(() => {
        this.Notification.success('mediaFusion.sipconfiguration.success');
      })
      .catch((error) => {
        this.Notification.errorWithTrackingId(error, 'hercules.genericFailure');
      });
  }
}
