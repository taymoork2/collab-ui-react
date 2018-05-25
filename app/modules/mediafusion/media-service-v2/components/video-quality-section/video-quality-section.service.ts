import { ICluster } from 'modules/hercules/hybrid-services.types';
import { Notification } from 'modules/core/notifications';
export class VideoQualitySectionService {

  /* @ngInject */
  constructor(
    private Authinfo,
    private HybridServicesClusterService,
    private MediaClusterServiceV2,
    private Notification: Notification,
    private Orgservice,
  ) { }

  public clusters: ICluster[] = [];

  public setVideoQuality(videoQuality, videoPropertySetId): void {
    const settings = {
      isMediaFusionFullQualityVideo: videoQuality,
    };
    this.Orgservice.setOrgSettings(this.Authinfo.getOrgId(), settings);
    const payLoad = {
      properties: {
        'mf.videoQuality': videoQuality,
      },
    };
    if (videoPropertySetId === null) {
      this.MediaClusterServiceV2.getPropertySets()
        .then((propertySets) => {
          if (propertySets.length > 0) {
            const videoPropertySet = _.filter(propertySets, {
              name: 'videoQualityPropertySet',
            });
            this.updatePropertySet(videoPropertySet[0], payLoad);
          }
        });
    } else {
      this.updatePropertySet(videoPropertySetId, payLoad);
    }
  }

  private updatePropertySet(videoPropertySet, payLoad) {
    this.HybridServicesClusterService.getAll()
      .then((clusters) => {
        this.clusters = _.filter(clusters, {
          targetType: 'mf_mgmt',
        });
        const clusterPayload = {
          assignedClusters: _.map(this.clusters, 'id'),
        };
        this.MediaClusterServiceV2.updatePropertySetById(videoPropertySet.id, clusterPayload)
          .then(() => {
            this.MediaClusterServiceV2.updatePropertySetById(videoPropertySet.id, payLoad)
              .then(() => {
                this.Notification.success('mediaFusion.videoQuality.success');
              })
              .catch((error) => {
                this.Notification.errorWithTrackingId(error, 'mediaFusion.videoQuality.error');
              });
          })
          .catch((error) => {
            this.Notification.errorWithTrackingId(error, 'mediaFusion.videoQuality.error');
          });
      });

  }
}
