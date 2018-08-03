import { ICluster } from 'modules/hercules/hybrid-services.types';
import { HybridServicesClusterService } from 'modules/hercules/services/hybrid-services-cluster.service';
import { Notification } from 'modules/core/notifications';
import { MediaEncryptionSectionService } from './media-encryption-section.service';

class MediaEncryptionSectionCtrl implements ng.IComponentController {

  public clusters: ICluster[] = [];
  public enableMediaEncryption: boolean = false;
  public isWizard: boolean = false;
  public onMediaEncryptionUpdate: Function;
  public mediaEncryptionPropertySet = [];
  public mediaEncryptionPropertySetId = null;
  public mediaEncryption = {
    title: 'mediaFusion.mediaEncryption.title',
  };
  public orgId = this.Authinfo.getOrgId();

  /* @ngInject */
  constructor(
    private Authinfo,
    private HybridServicesClusterService: HybridServicesClusterService,
    private MediaClusterServiceV2,
    private Notification: Notification,
    private Orgservice,
    private MediaEncryptionSectionService: MediaEncryptionSectionService,
  ) {
  }

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject<any> }) {
    const { isWizard } = changes;
    if (isWizard && isWizard.currentValue) {
      this.isWizard = isWizard.currentValue;
    } else {
      this.determineMediaEncryption();
    }
  }

  private determineMediaEncryption() {
    const params = {
      disableCache: true,
    };
    this.Orgservice.getOrg(_.noop, null, params)
      .then(response => {
        if (this.isWizard) {
          this.enableMediaEncryption = false;
        } else {
          this.enableMediaEncryption  = _.get(response.data, 'orgSettings.isMediaFusionEncrypted', false);
        }
        this.MediaClusterServiceV2.getPropertySets()
          .then((propertySets) => {
            if (propertySets.length > 0) {
              this.mediaEncryptionPropertySet = _.filter(propertySets, {
                name: 'mediaEncryptionPropertySet',
              });
              if (this.mediaEncryptionPropertySet.length === 0) {
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
          name: 'mediaEncryptionPropertySet',
          properties: {
            'mf.mediaEncrypted': 'false',
          },
        };
        this.MediaClusterServiceV2.createPropertySet(payLoad)
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

  public setMediaEncryption(setMediaEncryptionQuality): void {
    this.enableMediaEncryption = setMediaEncryptionQuality;
    if (this.isWizard) {
      if (_.isFunction(this.onMediaEncryptionUpdate)) {
        this.onMediaEncryptionUpdate({ response: { mediaEncryption: this.enableMediaEncryption , mediaEncryptionPropertySetId : this.mediaEncryptionPropertySetId } });
      }
    } else {
      this.MediaEncryptionSectionService.setMediaEncryption(this.enableMediaEncryption, this.mediaEncryptionPropertySetId);
    }
  }

}

export class MediaEncryptionSectionComponent implements ng.IComponentOptions {
  public controller = MediaEncryptionSectionCtrl;
  public template = require('./media-encryption-section.tpl.html');
  public bindings = {
    isWizard: '<',
    onMediaEncryptionUpdate: '&?',
  };
}
