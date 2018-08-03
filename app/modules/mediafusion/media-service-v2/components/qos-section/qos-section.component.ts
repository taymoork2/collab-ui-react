import { ICluster } from 'modules/hercules/hybrid-services.types';
import { IToolkitModalService } from 'modules/core/modal';
import { HybridServicesClusterService } from 'modules/hercules/services/hybrid-services-cluster.service';
import { Notification } from 'modules/core/notifications';
import { QosSectionService } from './qos-section.service';
import { AddResourceSectionService } from 'modules/mediafusion/media-service-v2/components/add-resource-section/add-resource-section.service';

export class QosSectionCtrl implements ng.IComponentController {

  public clusters: ICluster[] = [];
  public connectorStats: boolean;
  public connectorCount: number = 0;
  public connectorQosDisabledCount: number = 0;
  public connectorQosEnabledCount: number = 0;
  public connectorQosStatus: boolean = false;
  public enableQos: boolean = true;
  public isWizard: boolean = false;
  public nodesArrayQosEnabled: any [] = [] ;
  public nodesArrayQosDisabled: any [] = [] ;
  public onQosUpdate: Function;
  public qosPropertySet = [];
  public qosPropertySetId = null;
  public qosState: boolean;
  public qosStatus: string = '';
  public qosStatusMessage: string = '';

  public qosTitle = {
    title: 'mediaFusion.qos.title',
  };

  public orgId = this.Authinfo.getOrgId();

  public qosPendingNodesList: any = {
    resolve: {
      enableQos: () => this.enableQos,
      nodesArrayQosEnabled: () => this.nodesArrayQosEnabled,
      nodesArrayQosDisabled: () => this.nodesArrayQosDisabled,
    },
    controller: 'QosNodesController',
    controllerAs: 'vm',
    template: require('./qos-pending-nodes.html'),
    type: 'small',
  };

  public qosFeatureState: any = {
    resolve: {
      qosState: () => this.qosState,
    },
    controller: 'QosStatusController',
    controllerAs: 'vm',
    template: require('./qos-status-confirm.tpl.html'),
    type: 'small',
  };

  /* @ngInject */
  constructor(
    private $modal: IToolkitModalService,
    private $scope: ng.IScope,
    private $timeout: ng.ITimeoutService,
    private $translate: ng.translate.ITranslateService,
    private Authinfo,
    private AddResourceSectionService: AddResourceSectionService,
    private HybridServicesClusterService: HybridServicesClusterService,
    private MediaClusterServiceV2,
    private Notification: Notification,
    private Orgservice,
    private QosSectionService: QosSectionService,
  ) {
  }

  public $onInit(): void {
    this.$scope.$watch(() => {
      return this.connectorQosEnabledCount || this.connectorQosDisabledCount;
    }, () => {
    });
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
      }).then(() => {
        this.getConnectorQosState();
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
            'mf.qos': this.enableQos,
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

  public openSetUpModal(state) {
    this.qosState = state;
    this.$modal.open(this.qosFeatureState)
      .result
      .then((result) => {
        this.setEnableQos(result);
      });
  }

  public openPendingNodesModal() {
    this.$modal.open(this.qosPendingNodesList)
      .result
      .then(() => {
      });
  }

  public setEnableQos(qosValue): void {
    this.enableQos = qosValue;
    this.getConnectorQosState();
    if (this.isWizard) {
      if (_.isFunction(this.onQosUpdate)) {
        this.onQosUpdate({ response: { qos: this.enableQos , qosPropertySetId : this.qosPropertySetId } });
      }
    } else {
      this.QosSectionService.setQos(this.enableQos, this.qosPropertySetId, 'false');
    }
  }

  public getConnectorQosState() {
    //We aggregate the Qos state for each node and categorise them based on qosenabled & qosdisabled
    this.clearCounter();
    let listqosEnabled: any  = {
      cluster: '',
      nodes: [],
    };
    let listqosDisabled: any  = {
      cluster: '',
      nodes: [],
    };
    return this.AddResourceSectionService.getClusterList()
      .then((clusters) => {
        _.forEach(clusters, (cluster) => {
          _.forEach(cluster.connectors, (connector) => {
            if (connector.maintenanceMode !== 'on' && connector.state !== 'offline' && connector.state !== 'not_operational') {
              this.connectorCount += 1;
              this.connectorStats = this.HybridServicesClusterService.getQosStateForConnector(connector);
              if (this.connectorStats) {
                this.connectorQosEnabledCount += 1;
                this.connectorQosStatus = true;
                listqosEnabled.cluster =  cluster.name;
                listqosEnabled.nodes.push(connector.hostname);
              } else {
                this.connectorQosDisabledCount += 1;
                this.connectorQosStatus = false;
                listqosDisabled.cluster =  cluster.name;
                listqosDisabled.nodes.push(connector.hostname);

              }
            }
          });
          if (!this.enableQos && listqosEnabled.cluster !== '') {
            this.nodesArrayQosEnabled.push(listqosEnabled);
            listqosEnabled = {
              cluster: '',
              nodes: [],
            };
          } else if ( listqosDisabled.cluster !== '' ) {
            this.nodesArrayQosDisabled.push(listqosDisabled);
            listqosDisabled = {
              cluster: '',
              nodes: [],
            };
          }
        });
      }).then(() => {
        this.qosStateMessage();
      });
  }

  public clearCounter() {
    this.connectorQosEnabledCount = 0;
    this.connectorCount = 0;
    this.connectorQosDisabledCount = 0;
    this.nodesArrayQosDisabled = [];
    this.nodesArrayQosEnabled = [];
    this.$timeout(() => {
      this.getConnectorQosState();
    }, 60000);
  }
  public qosStateMessage() {
    if (this.enableQos && this.connectorQosEnabledCount === this.connectorCount) {
      this.qosStatus = 'success';
      this.qosStatusMessage = this.$translate.instant('mediaFusion.qos.qosmessages.enabled');
    } else if (this.enableQos && this.connectorQosDisabledCount !== 0) {
      this.qosStatus = 'warning';
      this.qosStatusMessage = this.$translate.instant('mediaFusion.qos.qosmessages.enabling');
    } else if (!this.enableQos && this.connectorQosEnabledCount !== 0) {
      this.qosStatus = 'warning';
      this.qosStatusMessage = this.$translate.instant('mediaFusion.qos.qosmessages.disabling');
    } else if (!this.enableQos && this.connectorQosDisabledCount === this.connectorCount) {
      this.qosStatus = '';
      this.qosStatusMessage = this.$translate.instant('mediaFusion.qos.qosmessages.off');
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
