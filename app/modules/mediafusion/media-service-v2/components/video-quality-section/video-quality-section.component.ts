import { ICluster } from 'modules/hercules/hybrid-services.types';
import { HybridServicesClusterService } from 'modules/hercules/services/hybrid-services-cluster.service';
import { Notification } from 'modules/core/notifications';
import { VideoQualitySectionService } from './video-quality-section.service';

class VideoQualitySectionCtrl implements ng.IComponentController {

  public clusters: ICluster[] = [];
  public enableVideoQuality: boolean = false;
  public isWizard: boolean = false;
  public onVideoQualityUpdate: Function;
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
    private VideoQualitySectionService: VideoQualitySectionService,
  ) {
  }

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject<any> }) {
    const { isWizard } = changes;
    if (isWizard && isWizard.currentValue) {
      this.isWizard = isWizard.currentValue;
    } else {
      this.determineVideoQuality();
    }
  }

  private determineVideoQuality() {
    const params = {
      disableCache: true,
    };
    this.Orgservice.getOrg(_.noop, null, params)
      .then(response => {
        if (this.isWizard) {
          this.enableVideoQuality = false;
        } else {
          this.enableVideoQuality  = _.get(response.data, 'orgSettings.isMediaFusionFullQualityVideo', false);
        }
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

  public setEnableVideoQuality(setVideoQuality): void {
    this.enableVideoQuality = setVideoQuality;
    if (this.isWizard) {
      if (_.isFunction(this.onVideoQualityUpdate)) {
        this.onVideoQualityUpdate({ response: { videoQuality: this.enableVideoQuality , videoPropertySetId : this.videoPropertySetId } });
      }
    } else {
      this.VideoQualitySectionService.setVideoQuality(this.enableVideoQuality, this.videoPropertySetId);
    }
  }


}

export class VideoQualitySectionComponent implements ng.IComponentOptions {
  public controller = VideoQualitySectionCtrl;
  public template = require('./video-quality-section.tpl.html');
  public bindings = {
    isWizard: '<',
    onVideoQualityUpdate: '&?',
  };
}
