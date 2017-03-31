import { Notification } from 'modules/core/notifications';
import { IConnectorAlarm, ICluster, ConnectorMaintenanceMode, ConnectorType, IHost, IConnector, ClusterTargetType } from 'modules/hercules/hybrid-services.types';
import { HybridServicesUtils } from 'modules/hercules/services/hybrid-services-utils';

interface ISimplifiedConnector {
  alarms: IConnectorAlarm[];
  connectorType: string;
  hasUpgradeAvailable: boolean;
  id: string;
  maintenanceMode: ConnectorMaintenanceMode;
  service: string;
  status: string;
  statusName: string;
  version: string;
}

interface ISimplifiedNode {
  name: string;
  serial: string;
  maintenanceMode: ConnectorMaintenanceMode;
  connectors: ISimplifiedConnector[];
}

interface IData {
  id: string;
  name: string;
  targetType: ClusterTargetType;
  nodes: ISimplifiedNode[];
}

class HybridServicesNodesPageCtrl implements ng.IComponentController {
  public data: IData;
  public gridOptions = {};
  public loading = true;
  public openedConnector: any;

  /* @ngInject */
  constructor(
    private $q: ng.IQService,
    private $translate: ng.translate.ITranslateService,
    private $state: ng.ui.IStateService,
    private FusionClusterService,
    private FusionClusterStatesService,
    private HybridServicesUtils: HybridServicesUtils,
    private ModalService,
    private Notification: Notification,
  ) {
    this.hybridConnectorsComparator = this.hybridConnectorsComparator.bind(this);
    this.getSerials = this.getSerials.bind(this);
    this.fetchNodes = this.fetchNodes.bind(this);
  }

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject }) {
    const { clusterId } = changes;
    if (clusterId && clusterId.currentValue) {
      this.loadCluster(clusterId.currentValue);
    }
  }

  public hybridConnectorsComparator(a, b) {
    return this.HybridServicesUtils.hybridConnectorsComparator(a.value, b.value);
  }

  public openSidepanel(connector: ISimplifiedConnector) {
    this.openedConnector = connector;
    this.$state.go('hybrid-services-connector-sidepanel', {
      connector: connector,
    });
    // TODO: find how to unselect the current line when closing sidepanel
  }

  public isSidepanelOpen(connector) {
    return this.openedConnector === connector;
  }

  public displayMaintenanceModeMenuItem(targetType: ClusterTargetType): boolean {
    return _.includes(<ConnectorType[]>['c_mgmt', 'mf_mgmt'], targetType);
  }

  public displayGoToNodeMenuItem(targetType: ClusterTargetType): boolean {
    return !_.includes(<ConnectorType[]>['mf_mgmt'], targetType);
  }

  public enableMaintenanceMode(node: ISimplifiedNode): void {
    this.ModalService.open({
      title: this.$translate.instant('hercules.nodesPage.enableMaintenanceModeModal.title'),
      message: this.$translate.instant('hercules.nodesPage.enableMaintenanceModeModal.message'),
      close: this.$translate.instant('common.enable'),
      dismiss: this.$translate.instant('common.cancel'),
    })
    .result
    .then(() => {
      return this.FusionClusterService.updateHost(node.serial, {
        maintenanceMode: 'on',
      })
      .then(response => {
        this.loadCluster(this.data.id);
        return response;
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
      return this.FusionClusterService.updateHost(node.serial, {
        maintenanceMode: 'off',
      })
      .then(response => {
        this.loadCluster(this.data.id);
        return response;
      })
      .catch((error) => {
        this.Notification.errorWithTrackingId(error);
      });
    });
  }

  private loadCluster(id) {
    this.loading = true;
    let clusterCache: ICluster;
    return this.FusionClusterService.get(id)
      .then((cluster: ICluster) => {
        clusterCache = cluster;
        return this.getSerials(cluster);
      })
      .then(this.fetchNodes)
      .then((nodes: IHost[]) => {
        this.data = this.processData(clusterCache, nodes);
        return this.data;
      })
      .catch(response => {
        this.Notification.errorWithTrackingId(response, 'hercules.nodesPage.loadingError');
      })
      .finally(() => {
        this.loading = false;
      });
  }

  private getSerials(cluster: ICluster): string[] {
    return _.chain(cluster.connectors)
      .map(connector => connector.hostSerial)
      .uniq()
      .value();
  }

  private fetchNodes(serials: string[]) {
    const promises = _.map(serials, (serial) => {
      return this.FusionClusterService.getHost(serial);
    });
    return this.$q.all(promises);
  }

  private processData(cluster: ICluster, nodes: IHost[]): IData {
    const result: IData = {
      id: cluster.id,
      name: cluster.name,
      targetType: cluster.targetType,
      nodes: _.chain(nodes)
        .map((node) => {
          // We have to base the transformation on the connectors from `cluster`, not from `nodes` because of
          // https://sqbu-github.cisco.com/WebExSquared/fusion-management-service/issues/250
          let connectors = _.chain(cluster.connectors)
            .filter({ hostSerial: node.serial })
            .map(connector => {
              const mergedStatus = this.FusionClusterStatesService.getMergedStateSeverity([connector]);
              const provisioning = _.find(cluster.provisioning, { connectorType: connector.connectorType });
              const simplifiedConnector: ISimplifiedConnector = {
                alarms: connector.alarms,
                connectorType: connector.connectorType,
                hasUpgradeAvailable: (provisioning && provisioning.availableVersion) ? provisioning.availableVersion !== connector.runningVersion : false,
                id: connector.id,
                maintenanceMode: this.getMaintenanceModeForConnector(connector),
                service: this.$translate.instant(`hercules.shortConnectorNameFromConnectorType.${connector.connectorType}`),
                status: mergedStatus,
                statusName: this.$translate.instant(`hercules.status.${mergedStatus.name}`),
                version: connector.runningVersion,
              };
              return simplifiedConnector;
            })
            .value();

          return <ISimplifiedNode>{
            name: node.hostname,
            serial: node.serial,
            maintenanceMode: node.maintenanceMode,
            connectors: connectors,
          };
        })
        .value(),
    };
    return result;
  }

  private getMaintenanceModeForConnector(connector: IConnector): ConnectorMaintenanceMode {
    // `connector.maintenanceMode` should reflect the status it should be in (maps `maintenanceMode` on the node)
    // `connector.connectorStatus.maintenanceMode` is the latest mode received via an heartbeat
    const fromHeartbeat = _.get<IConnector, ConnectorMaintenanceMode>(connector, 'connectorStatus.maintenanceMode');
    if (connector.maintenanceMode === 'off') {
      return 'off';
    } else if (connector.maintenanceMode === 'on' && _.includes(['stopped', 'disabled', 'offline'], connector.state)) {
      return 'on';
    } else if (connector.maintenanceMode === 'on' && fromHeartbeat === 'off') {
      return 'pending';
    } else {
      return fromHeartbeat;
    }
  }
}

export class HybridServicesNodesPageComponent implements ng.IComponentOptions {
  public controller = HybridServicesNodesPageCtrl;
  public templateUrl = 'modules/hercules/hybrid-services-nodes-page/hybrid-services-nodes-page.html';
  public bindings = {
    clusterId: '<',
  };
}
