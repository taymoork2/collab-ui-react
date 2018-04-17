import { Notification } from 'modules/core/notifications';
export class VideoQualitySectionService {

  /* @ngInject */
  constructor(
    private Authinfo,
    private MediaClusterServiceV2,
    private Notification: Notification,
    private Orgservice,
  ) { }


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
    this.MediaClusterServiceV2.updatePropertySetById(videoPropertySet.id, payLoad)
      .then(() => {
        this.Notification.success('mediaFusion.videoQuality.success');
      })
      .catch((error) => {
        this.Notification.errorWithTrackingId(error, 'mediaFusion.videoQuality.error');
      });
  }
}
