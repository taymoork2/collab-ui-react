import { ICluster } from 'modules/hercules/hybrid-services.types';
import { Notification } from 'modules/core/notifications';
export class MediaEncryptionSectionService {

  /* @ngInject */
  constructor(
    private Authinfo,
    private HybridServicesClusterService,
    private MediaClusterServiceV2,
    private Notification: Notification,
    private Orgservice,
  ) { }

  public clusters: ICluster[] = [];

  public setMediaEncryption(mediaEncryption, mediaEncryptionPropertySetId): void {
    const settings = {
      isMediaFusionEncrypted: mediaEncryption,
    };
    this.Orgservice.setOrgSettings(this.Authinfo.getOrgId(), settings);
    const payLoad = {
      properties: {
        'mf.mediaEncrypted': mediaEncryption,
      },
    };
    if (mediaEncryptionPropertySetId === null) {
      this.MediaClusterServiceV2.getPropertySets()
        .then((propertySets) => {
          if (propertySets.length > 0) {
            const mediaEncryptionPropertySet = _.filter(propertySets, {
              name: 'mediaEncryptionPropertySet',
            });
            this.updatePropertySet(mediaEncryptionPropertySet[0], payLoad);
          }
        });
    } else {
      this.updatePropertySet(mediaEncryptionPropertySetId, payLoad);
    }
  }

  private updatePropertySet(mediaEncryptionPropertySet, payLoad) {
    this.HybridServicesClusterService.getAll()
      .then((clusters) => {
        this.clusters = _.filter(clusters, {
          targetType: 'mf_mgmt',
        });
        const clusterPayload = {
          assignedClusters: _.map(this.clusters, 'id'),
        };
        this.MediaClusterServiceV2.updatePropertySetById(mediaEncryptionPropertySet.id, clusterPayload)
          .then(() => {
            this.MediaClusterServiceV2.updatePropertySetById(mediaEncryptionPropertySet.id, payLoad)
              .then(() => {
                this.Notification.success('mediaFusion.mediaEncryption.success');
              })
              .catch((error) => {
                this.Notification.errorWithTrackingId(error, 'mediaFusion.mediaEncryption.error');
              });
          })
          .catch((error) => {
            this.Notification.errorWithTrackingId(error, 'mediaFusion.mediaEncryption.error');
          });
      });

  }
}
