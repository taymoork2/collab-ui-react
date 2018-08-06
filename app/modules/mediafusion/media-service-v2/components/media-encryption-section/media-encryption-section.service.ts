import { ICluster } from 'modules/hercules/hybrid-services.types';
import { HybridServicesClusterService } from 'modules/hercules/services/hybrid-services-cluster.service';
import { Notification } from 'modules/core/notifications';
export class MediaEncryptionSectionService {

  /* @ngInject */
  constructor(
    private Authinfo,
    private HybridServicesClusterService: HybridServicesClusterService,
    private MediaClusterServiceV2,
    private Notification: Notification,
    private Orgservice,
  ) { }

  public clusters: ICluster[] = [];
  public mediaEncryptionPropertySetId = null;
  public mediaEncryptedValue: boolean = false;

  public createPropertySetAndAssignClusters(mediaToggle): void {
    this.HybridServicesClusterService.getAll()
      .then((clusters) => {
        this.clusters = _.filter(clusters, {
          targetType: 'mf_mgmt',
        });
        this.mediaEncryptedValue = mediaToggle;
        const payLoad = {
          type: 'mf.group',
          name: 'mediaEncryptionPropertySet',
          properties: {
            'mf.mediaEncrypted': this.mediaEncryptedValue,
          },
        };
        return this.MediaClusterServiceV2.createPropertySet(payLoad)
          .then((response) => {
            this.mediaEncryptionPropertySetId = response.data.id;
            const clusterPayload = {
              assignedClusters: _.map(this.clusters, 'id'),
            };
            this.MediaClusterServiceV2.updatePropertySetById(this.mediaEncryptionPropertySetId, clusterPayload)
              .catch((error) => {
                this.Notification.errorWithTrackingId(error, 'mediaFusion.mediaEncryption.error');
              });
          });
      });
  }

  public getPropertySetId() {
    return this.mediaEncryptionPropertySetId;
  }

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
