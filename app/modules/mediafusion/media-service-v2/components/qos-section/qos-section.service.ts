import { ICluster } from 'modules/hercules/hybrid-services.types';
import { Notification } from 'modules/core/notifications';
export class QosSectionService {

  /* @ngInject */
  constructor(
    private Authinfo,
    private HybridServicesClusterService,
    private MediaClusterServiceV2,
    private Notification: Notification,
    private Orgservice,
  ) { }

  public clusters: ICluster[] = [];

  public setQos(qosSettings, qosPropertySetId): void {
    const settings = {
      isMediaFusionQosEnabled: qosSettings,
    };
    this.Orgservice.setOrgSettings(this.Authinfo.getOrgId(), settings);
    const payLoad = {
      properties: {
        'mf.qos': qosSettings,
      },
    };
    if (qosPropertySetId === null) {
      this.MediaClusterServiceV2.getPropertySets()
        .then((propertySets) => {
          if (propertySets.length > 0) {
            const qosPropertySet = _.filter(propertySets, {
              name: 'qosPropertySet',
            });
            this.updatePropertySet(qosPropertySet[0], payLoad);
          }
        });
    } else {
      this.updatePropertySet(qosPropertySetId, payLoad);
    }
  }

  private updatePropertySet(qosPropertySet, payLoad) {
    this.HybridServicesClusterService.getAll()
      .then((clusters) => {
        this.clusters = _.filter(clusters, {
          targetType: 'mf_mgmt',
        });
        const clusterPayload = {
          assignedClusters: _.map(this.clusters, 'id'),
        };
        this.MediaClusterServiceV2.updatePropertySetById(qosPropertySet.id, clusterPayload)
          .then(() => {
            this.MediaClusterServiceV2.updatePropertySetById(qosPropertySet.id, payLoad)
              .then(() => {
                this.Notification.success('mediaFusion.qos.success');
              })
              .catch((error) => {
                this.Notification.errorWithTrackingId(error, 'mediaFusion.qos.error');
              });
          })
          .catch((error) => {
            this.Notification.errorWithTrackingId(error, 'mediaFusion.qos.error');
          });
      });

  }
}
