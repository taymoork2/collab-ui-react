import { Notification } from 'modules/core/notifications';
import { IToolkitModalService } from 'modules/core/modal';
import { IConnectorAlarm, ICluster, ConnectorMaintenanceMode, ConnectorType, IHost, ClusterTargetType, ConnectorState, IExtendedClusterFusion, IConnectorExtendedProperties, IExtendedConnector } from 'modules/hercules/hybrid-services.types';
import { HybridServicesUtilsService } from 'modules/hercules/services/hybrid-services-utils.service';
import { HybridServicesClusterService } from 'modules/hercules/services/hybrid-services-cluster.service';

export interface ISimplifiedConnector {
  alarms: IConnectorAlarm[];
  connectorType: ConnectorType;
  clusterId: string;
  hasUpgradeAvailable: boolean;
  upgradesAutomatically: boolean;
  id: string;
  maintenanceMode: ConnectorMaintenanceMode;
  originalState: ConnectorState;
  service: string;
  extendedProperties: IConnectorExtendedProperties;
  upgradeState: string;
  version: string;
}

export interface ISimplifiedNode {
  name: string;
  serial: string;
  pendingTooltip: string;
  platformVersion?: string;
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
  private REFRESH_INTERVAL = 30 * 1000;
  private refreshTimeout: ng.IPromise<void> | null = null;
  private clusterCache: IExtendedClusterFusion;
  public connectorTypesWithUpgrade: ConnectorType[] = [];
  public nextUpgradeStartTime = '';
  public data: IData;
  public gridOptions = {};
  public loading = true; // first load
  public refreshing = false; // subsequent load of data
  public openedConnector: any;
  public backState: string;

  /* @ngInject */
  constructor(
    private $q: ng.IQService,
    private $modal: IToolkitModalService,
    private $timeout: ng.ITimeoutService,
    private $translate: ng.translate.ITranslateService,
    private $state: ng.ui.IStateService,
    private Analytics,
    private HybridServicesClusterService: HybridServicesClusterService,
    private HybridServicesUtilsService: HybridServicesUtilsService,
    private Notification: Notification,
  ) {
    this.hybridConnectorsComparator = this.hybridConnectorsComparator.bind(this);
    this.getSerials = this.getSerials.bind(this);
    this.fetchNodes = this.fetchNodes.bind(this);
  }

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject<any> }) {
    const { clusterId } = changes;
    if (clusterId && clusterId.currentValue) {
      this.loadCluster(clusterId.currentValue).then(data => {
        if (clusterId.isFirstChange()) {
          this.Analytics.trackHybridServiceEvent(this.Analytics.sections.HS_NAVIGATION.eventNames.VISIT_NODE_LIST_SETTINGS, {
            'Cluster Type': data ? data.targetType : undefined,
            Referrer: this.getReferrer(this.backState),
          });
        }
      });
      this.HybridServicesClusterService.get(clusterId.currentValue)
        .then((info) => {
          this.nextUpgradeStartTime = moment(info.upgradeSchedule.nextUpgradeWindow.startTime).format('LLL');
        });
    }
  }

  private getReferrer(backState: string | null): string {
    if (backState === 'cluster-list') {
      return 'Cluster Card';
    } else if (_.includes(['calendar-service.list', 'call-service.list', 'media-service-v2.list', 'hds.list', 'context-resources'], backState)) {
      return 'Cluster Sidepanel';
    } else {
      return 'Direct Link';
    }
  }

  public reloadDataCallback = (options) => {
    if (options.reload) {
      this.loadCluster(this.data.id);
    }
  }

  public hybridConnectorsComparator(a, b) {
    return this.HybridServicesUtilsService.hybridConnectorsComparator(a, b);
  }

  public openSidepanel(connector: ISimplifiedConnector): void {
    this.openedConnector = connector;
    this.$state.go('hybrid-services-connector-sidepanel', {
      connector: connector,
    });
    // TODO: find how to unselect the current line when closing sidepanel
  }

  public isSidepanelOpen(connector) {
    return this.openedConnector === connector;
  }

  public $onDestroy(): void {
    if (this.refreshTimeout) {
      this.$timeout.cancel(this.refreshTimeout);
    }
  }

  private loadCluster(id) {
    if (this.refreshTimeout) {
      this.$timeout.cancel(this.refreshTimeout);
    }
    if (!this.loading) {
      this.refreshing = true;
    }
    return this.HybridServicesClusterService.get(id)
      .then((cluster) => {
        this.clusterCache = cluster;
        return this.getSerials(cluster);
      })
      .then(this.fetchNodes)
      .then((nodes: IHost[]) => {
        this.data = this.processData(this.clusterCache, nodes);
        return this.data;
      })
      .catch(response => {
        this.Notification.errorWithTrackingId(response, 'hercules.nodesPage.loadingError');
      })
      .finally(() => {
        this.loading = false;
        this.refreshing = false;
        this.refreshTimeout = this.$timeout(() => {
          this.loadCluster(id);
        }, this.REFRESH_INTERVAL);
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
      return this.HybridServicesClusterService.getHost(serial);
    });
    return this.$q.all(promises);
  }

  public openUpgradeModal(connectorType): void {
    this.Analytics.trackHybridServiceEvent(this.Analytics.sections.HS_NAVIGATION.eventNames.OPEN_CONNECTOR_UPGRADE_MODAL, {
      'Cluster Id': this.clusterCache.id,
      'Connector Type': connectorType,
    });
    this.$modal.open({
      template: require('modules/hercules/connector-upgrade-modal/connector-upgrade-modal.html'),
      type: 'small',
      controller: 'ConnectorUpgradeController',
      controllerAs: 'ConnectorUpgradeCtrl',
      resolve: {
        connectorType: () => connectorType,
        cluster: () => this.clusterCache,
      },
    })
    .result
    .then(() => {
      this.loadCluster(this.data.id);
    });
  }

  private processData(cluster: IExtendedClusterFusion, nodes: IHost[]): IData {
    const result: IData = {
      id: cluster.id,
      name: cluster.name,
      targetType: cluster.targetType,
      nodes: _.chain(nodes)
        .map((node) => {
          // We have to base the transformation on the connectors from `cluster`, not from `nodes` because of
          // https://sqbu-github.cisco.com/WebExSquared/fusion-management-service/issues/250
          const connectors = _.chain(cluster.connectors)
            .filter({ hostSerial: node.serial })
            .map(connector => {
              const simplifiedConnector: ISimplifiedConnector = {
                alarms: connector.alarms,
                connectorType: connector.connectorType,
                clusterId: connector.clusterId,
                hasUpgradeAvailable: this.hasUpgradeAvailable(connector),
                upgradesAutomatically: this.upgradesAutomatically(connector),
                id: connector.id,
                maintenanceMode: connector.extendedProperties.maintenanceMode,
                originalState: connector.state,
                service: this.$translate.instant(`hercules.shortConnectorNameFromConnectorType.${connector.connectorType}`),
                extendedProperties: connector.extendedProperties,
                upgradeState: connector.upgradeState,
                version: connector.runningVersion,
              };
              return simplifiedConnector;
            })
            .value();

          return <ISimplifiedNode>{
            name: node.hostname,
            serial: node.serial,
            pendingTooltip: this.$translate.instant(`hercules.nodesPage.pendingTooltip`, { date: moment(node.lastMaintenanceModeEnabledTimestamp).format('LLL') }),
            platformVersion: node.platformVersion,
            maintenanceMode: node.maintenanceMode,
            connectors: connectors,
          };
        })
        .value(),
    };

    this.connectorTypesWithUpgrade = _.chain(result.nodes)
      .map((node) => node.connectors)
      .flatten<ISimplifiedConnector>()
      .filter((connector) => connector.hasUpgradeAvailable && connector.originalState !== 'offline')
      .map((connector) => connector.connectorType)
      .uniq()
      .value();
    return result;
  }

  private upgradesAutomatically(connector: IExtendedConnector): boolean {
    return this.isHybridContextConnector(connector);
  }

  private hasUpgradeAvailable(connector: IExtendedConnector): boolean {
    return !this.upgradesAutomatically(connector)
      ? connector.extendedProperties.hasUpgradeAvailable
      : false;
  }

  private isHybridContextConnector(connector: IExtendedConnector): boolean {
    return (connector.connectorType === 'cs_mgmt' || connector.connectorType === 'cs_context');
  }
}

export class HybridServicesNodesPageComponent implements ng.IComponentOptions {
  public controller = HybridServicesNodesPageCtrl;
  public template = require('modules/hercules/hybrid-services-nodes-page/hybrid-services-nodes-page.html');
  public bindings = {
    clusterId: '<',
    backState: '<',
  };
}
