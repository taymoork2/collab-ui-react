import { ICluster } from 'modules/hercules/hybrid-services.types';
import { HybridServicesClusterService } from 'modules/hercules/services/hybrid-services-cluster.service';
import { Notification } from 'modules/core/notifications';

class VideoQualitySectionCtrl implements ng.IComponentController {

  public clusters: ICluster[] = [];
  public enableVideoQuality: boolean = false;
  public videoPropertySet = [];
  public videoPropertySetId = null;
  public videoQuality = {
    title: 'mediaFusion.videoQuality.title',
  };
  public orgId = this.Authinfo.getOrgId();

  /* @ngInject */
  constructor(
    private Authinfo,
    private HybridServicesClusterService: HybridServicesClusterService,
    private MediaClusterServiceV2,
    private Notification: Notification,
    private Orgservice,
  ) {
    this.determineVideoQuality();
  }

  private determineVideoQuality() {
    const params = {
      disableCache: true,
    };
    this.Orgservice.getOrg(_.noop, null, params)
     .then(response => {
       this.enableVideoQuality  = _.get(response.data, 'orgSettings.isMediaFusionFullQualityVideo', false);
       this.MediaClusterServiceV2.getPropertySets()
        .then((propertySets) => {
          if (propertySets.length > 0) {
            this.videoPropertySet = _.filter(propertySets, {
              name: 'videoQualityPropertySet',
            });
            if (this.videoPropertySet.length === 0) {
              this.createPropertySetAndAssignClusters();
            }
          } else if (propertySets.length === 0) {
            this.createPropertySetAndAssignClusters();
          }
        });
     });
  }

  private createPropertySetAndAssignClusters(): void {
    this.HybridServicesClusterService.getAll()
      .then((clusters) => {
        this.clusters = _.filter(clusters, {
          targetType: 'mf_mgmt',
        });
        const payLoad = {
          type: 'mf.group',
          name: 'videoQualityPropertySet',
          properties: {
            'mf.videoQuality': 'false',
          },
        };
        this.MediaClusterServiceV2.createPropertySet(payLoad)
          .then((response) => {
            this.videoPropertySetId = response.data.id;
            const clusterPayload = {
              assignedClusters: _.map(this.clusters, 'id'),
            };
            this.MediaClusterServiceV2.updatePropertySetById(this.videoPropertySetId, clusterPayload)
              .catch((error) => {
                this.Notification.errorWithTrackingId(error, 'mediaFusion.videoQuality.error');
              });
          });
      });
  }

  public setEnableVideoQuality(): void {
    const settings = {
      isMediaFusionFullQualityVideo: this.enableVideoQuality,
    };
    this.Orgservice.setOrgSettings(this.Authinfo.getOrgId(), settings);
    const payLoad = {
      properties: {
        'mf.videoQuality': this.enableVideoQuality,
      },
    };
    if (this.videoPropertySetId === null) {
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
      this.updatePropertySet(this.videoPropertySetId, payLoad);
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

export class VideoQualitySectionComponent implements ng.IComponentOptions {
  public controller = VideoQualitySectionCtrl;
  public template = require('./video-quality-section.tpl.html');
}
