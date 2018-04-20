import { Notification } from 'modules/core/notifications';
import { ClusterTargetType, ConnectorType } from 'modules/hercules/hybrid-services.types';
import { ISimplifiedConnector, ISimplifiedNode } from '../hybrid-services-nodes-page.component';
import { HybridServicesClusterService } from 'modules/hercules/services/hybrid-services-cluster.service';
import { IToolkitModalService } from 'modules/core/modal';

class HybridServicesNodesPageActionsComponentCtrl implements ng.IComponentController {

  private clusterId: string;
  private clusterName: string;
  private reloadDataCallback: Function;
  public node: ISimplifiedNode;
  public targetType: ClusterTargetType;
  public numberOfClusterNodes: number;

  /* @ngInject */
  constructor(
    private $modal: IToolkitModalService,
    private $translate: ng.translate.ITranslateService,
    private HybridServicesClusterService: HybridServicesClusterService,
    private ModalService,
    private Notification: Notification,
  ) {  }

  public $onInit() {
  }

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject<any> }) {

    const { clusterId, clusterName, numberOfClusterNodes, node, targetType, reloadDataCallback } = changes;
    if (clusterId && clusterId.currentValue) {
      this.clusterId = clusterId.currentValue;
    }
    if (clusterName && clusterName.currentValue) {
      this.clusterName = clusterName.currentValue;
    }
    if (numberOfClusterNodes && numberOfClusterNodes.currentValue) {
      this.numberOfClusterNodes = numberOfClusterNodes.currentValue;
    }
    if (reloadDataCallback && reloadDataCallback.currentValue) {
      this.reloadDataCallback = reloadDataCallback.currentValue;
    }
    if (node && node.currentValue) {
      this.node = node.currentValue;
    }
    if (targetType && targetType.currentValue) {
      this.targetType = targetType.currentValue;
    }

  }

  public displayMaintenanceModeMenuItem(targetType: ClusterTargetType): boolean {
    return _.includes(<ConnectorType[]>['c_mgmt', 'mf_mgmt'], targetType);
  }

  public displayGoToNodeMenuItem(targetType: ClusterTargetType): boolean {
    return !_.includes(<ConnectorType[]>['mf_mgmt', 'cs_mgmt', 'cs_context'], targetType);
  }

  public displayMoveNodeMenuItem(targetType: ClusterTargetType): boolean {
    return _.includes(<ConnectorType[]>['mf_mgmt'], targetType);
  }

  public displayDeregisterNodeMenuItem(targetType: ClusterTargetType): boolean {
    return _.includes(<ConnectorType[]>['mf_mgmt', 'hds_app'], targetType);
  }

  public displayDisabledRemoveNodeMenuItemWithDocumentationLink(targetType: ClusterTargetType, node: ISimplifiedNode, numberOfClusterNodes: number): boolean {
    if (_.isUndefined(node)  || _.isUndefined(numberOfClusterNodes)) {
      return false;
    }
    return targetType === 'c_mgmt' && !_.find(node.connectors, (connector) => this.hasOfflineManagementConnector(connector)) && numberOfClusterNodes > 1;
  }

  public displayDisabledRemoveNodeMenuItemWithDeregisterInfo(targetType: ClusterTargetType, numberOfClusterNodes: number): boolean {
    if (_.isUndefined(numberOfClusterNodes)) {
      return false;
    }
    return targetType === 'c_mgmt' && numberOfClusterNodes < 2;
  }

  public displayDisabledRemoveNodeMenuItem(targetType: ClusterTargetType, node: ISimplifiedNode, numberOfClusterNodes: number): boolean {
    if (_.isUndefined(node)  || _.isUndefined(numberOfClusterNodes)) {
      return false;
    }
    return targetType === 'cs_mgmt' && (numberOfClusterNodes === 1 || !_.find(node.connectors, (connector) => connector.originalState === 'offline'));
  }

  public displayActiveRemoveNodeMenuItem(targetType: ClusterTargetType, node: ISimplifiedNode, numberOfClusterNodes: number): boolean {
    if (_.isUndefined(node)  || _.isUndefined(numberOfClusterNodes)) {
      return false;
    }
    return (targetType === 'c_mgmt' && !!_.find(node.connectors, (connector) => this.hasOfflineManagementConnector(connector)) && numberOfClusterNodes > 1) ||
      (targetType === 'cs_mgmt' && !!_.find(node.connectors, (connector) => connector.originalState === 'offline') && numberOfClusterNodes > 1);
  }

  private hasOfflineManagementConnector(connector: ISimplifiedConnector) {
    return connector.connectorType === 'c_mgmt' && connector.originalState === 'offline';
  }

  public enableMaintenanceMode(node: ISimplifiedNode): void {
    let message = this.$translate.instant('hercules.nodesPage.enableMaintenanceModeModal.message');
    if (this.targetType === 'c_mgmt') {
      message = this.$translate.instant('hercules.nodesPage.enableMaintenanceModeModal.expresswayMessage');
    }
    this.ModalService.open({
      title: this.$translate.instant('hercules.nodesPage.enableMaintenanceModeModal.title'),
      message: message,
      close: this.$translate.instant('common.enable'),
      dismiss: this.$translate.instant('common.cancel'),
    })
      .result
      .then(() => {
        return this.HybridServicesClusterService.updateHost(node.serial, {
          maintenanceMode: 'on',
        })
          .then(() => {
            this.reloadDataCallback({
              options: {
                reload: true,
              },
            });
          })
          .catch((error) => {
            this.Notification.errorWithTrackingId(error);
          });
      });
  }

  public disableMaintenanceMode(node: ISimplifiedNode): void {
    this.ModalService.open({
      title: this.$translate.instant('hercules.nodesPage.disableMaintenanceModeModal.title'),
      message: this.$translate.instant('hercules.nodesPage.disableMaintenanceModeModal.message'),
      close: this.$translate.instant('common.disable'),
      dismiss: this.$translate.instant('common.cancel'),
    })
      .result
      .then(() => {
        return this.HybridServicesClusterService.updateHost(node.serial, {
          maintenanceMode: 'off',
        })
          .then(() => {
            this.reloadDataCallback({
              options: {
                reload: true,
              },
            });
          })
          .catch((error) => {
            this.Notification.errorWithTrackingId(error);
          });
      });
  }

  public openMoveNodeModal(node: ISimplifiedNode): void {
    this.$modal.open({
      resolve: {
        cluster: () => ({
          id: this.clusterId,
          name: this.clusterName,
        }),
        connector: () => ({
          id: node.connectors[0].id,
          hostname: node.name,
        }),
      },
      type: 'small',
      controller: 'ReassignClusterControllerV2',
      controllerAs: 'reassignCluster',
      template: require('modules/mediafusion/media-service-v2/side-panel/reassign-node-to-different-cluster/reassign-cluster-dialog.html'),
    })
      .result
      .then(() => {
        this.reloadDataCallback({
          options: {
            reload: true,
          },
        });
      });
  }

  public openDeregisterNodeModal(node: ISimplifiedNode): void {
    this.$modal.open({
      resolve: {
        connectorId: () => node.connectors[0].id,
      },
      type: 'dialog',
      controller: 'HostDeregisterControllerV2',
      controllerAs: 'hostDeregister',
      template: require('modules/mediafusion/media-service-v2/side-panel/deregister-node/host-deregister-dialog.html'),
    })
      .result
      .then(() => {
        this.reloadDataCallback({
          options: {
            reload: true,
          },
        });
      });
  }

  public openDeleteExpresswayNodeModal(node: ISimplifiedNode): void {
    this.$modal.open({
      template: require('modules/hercules/hybrid-services-nodes-page/delete-expressway-host-modal/confirm-deleteHost-dialog.html'),
      type: 'dialog',
      controller: 'ConfirmDeleteHostController',
      controllerAs: 'confirmDeleteHostDialog',
      resolve: {
        hostSerial: () => node.serial,
        connectorType: () => 'c_mgmt',
      },
    })
      .result
      .then(() => {
        this.reloadDataCallback({
          options: {
            reload: true,
          },
        });
      });
  }

}

export class HybridServicesNodesPageActionsComponent implements ng.IComponentOptions {
  public template = require('modules/hercules/hybrid-services-nodes-page/hybrid-services-nodes-page-actions/hybrid-services-nodes-page-actions.component.html');
  public controller = HybridServicesNodesPageActionsComponentCtrl;
  public bindings = {
    clusterId: '<',
    clusterName: '<',
    node: '<',
    numberOfClusterNodes: '<',
    targetType: '<',
    reloadDataCallback: '&',
  };
}
