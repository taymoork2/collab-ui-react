import { ICluster } from 'modules/hercules/hybrid-services.types';
import { HybridServicesClusterService } from 'modules/hercules/services/hybrid-services-cluster.service';
import { Notification } from 'modules/core/notifications';
import { QosSectionService } from './qos-section.service';

class QosSectionCtrl implements ng.IComponentController {

  public clusters: ICluster[] = [];
  public enableQos: boolean = true;
  public isWizard: boolean = false;
  public onQosUpdate: Function;
  public qosPropertySet = [];
  public qosPropertySetId = null;
  public qosTitle = {
    title: 'mediaFusion.qos.title',
  };
  public orgId = this.Authinfo.getOrgId();

  /* @ngInject */
  constructor(
    private Authinfo,
    private HybridServicesClusterService: HybridServicesClusterService,
    private MediaClusterServiceV2,
    private Notification: Notification,
    private Orgservice,
    private QosSectionService: QosSectionService,
  ) {
  }

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject<any> }) {
    const { isWizard } = changes;
    if (isWizard && isWizard.currentValue) {
      this.isWizard = isWizard.currentValue;
    } else {
      this.determineQos();
    }
  }

  private determineQos() {
    const params = {
      disableCache: true,
    };
    this.Orgservice.getOrg(_.noop, null, params)
      .then(response => {
        if (this.isWizard) {
          this.enableQos = true;
        } else {
          this.enableQos  = _.get(response.data, 'orgSettings.isMediaFusionQosEnabled', false);
        }
        this.MediaClusterServiceV2.getPropertySets()
          .then((propertySets) => {
            if (propertySets.length > 0) {
              this.qosPropertySet = _.filter(propertySets, {
                name: 'qosPropertySet',
              });
              if (this.qosPropertySet.length === 0) {
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
          name: 'qosPropertySet',
          properties: {
            'mf.qos': 'true',
          },
        };
        this.MediaClusterServiceV2.createPropertySet(payLoad)
          .then((response) => {
            this.qosPropertySetId = response.data.id;
            const clusterPayload = {
              assignedClusters: _.map(this.clusters, 'id'),
            };
            this.MediaClusterServiceV2.updatePropertySetById(this.qosPropertySetId, clusterPayload)
              .catch((error) => {
                this.Notification.errorWithTrackingId(error, 'mediaFusion.qos.error');
              });
          });
      });
  }

  public setEnableQos(qosValue): void {
    this.enableQos = qosValue;
    if (this.isWizard) {
      if (_.isFunction(this.onQosUpdate)) {
        this.onQosUpdate({ response: { qos: this.enableQos , qosPropertySetId : this.qosPropertySetId } });
      }
    } else {
      this.QosSectionService.setQos(this.enableQos, this.qosPropertySetId);
    }
  }
}

export class QosSectionComponent implements ng.IComponentOptions {
  public controller = QosSectionCtrl;
  public template = require('./qos-section.tpl.html');
  public bindings = {
    isWizard: '<',
    onQosUpdate: '&?',
  };
}
