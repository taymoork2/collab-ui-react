import { Notification } from 'modules/core/notifications';
import { IAlarm, IConnector } from 'modules/hercules/herculesInterfaces';

interface ISimplifiedConnector {
  id: string;
  alarms: IAlarm[];
  connectorType: string;
  service: string;
  statusName: string;
  status: string;
  version: string;
}

class HybridServicesNodesPageCtrl implements ng.IComponentController {
  public data: any;
  public gridOptions = {};
  public loading = true;
  public openedConnector: any;

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private $state: ng.ui.IStateService,
    private FusionClusterService,
    private FusionClusterStatesService,
    private HybridServicesUtils,
    private Notification: Notification,
  ) {
    this.hybridConnectorsComparator = this.hybridConnectorsComparator.bind(this);
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
  }

  public isSidepanelOpen(connector) {
    return this.openedConnector === connector;
  }

  private loadCluster(id) {
    this.loading = true;
    return this.FusionClusterService.get(id)
      .then(cluster => {
        this.data = this.processData(cluster);
      })
      .catch(response => {
        this.Notification.errorWithTrackingId(response, 'hercules.nodesPage.loadingError');
      })
      .finally(() => {
        this.loading = false;
      });
  }

  private processData(cluster) {
    const result = {
      name: cluster.name,
      nodes: _.chain(cluster.connectors)
        .reduce((acc, connector: IConnector) => {
          const hostname = connector.hostname;
          const mergedStatus = this.FusionClusterStatesService.getMergedStateSeverity([connector]);
          const simplifiedConnector: ISimplifiedConnector = {
            id: connector.id,
            alarms: connector.alarms,
            connectorType: connector.connectorType,
            service: this.$translate.instant(`hercules.connectorNameFromConnectorType.${connector.connectorType}`),
            statusName: this.$translate.instant(`hercules.status.${mergedStatus.name}`),
            status: mergedStatus,
            version: connector.runningVersion,
          };
          if (acc[hostname]) {
            acc[hostname].connectors.push(simplifiedConnector);
          } else {
            acc[hostname] = {
              name: hostname,
              connectors: [simplifiedConnector],
            };
          }
          return acc;
        }, {})
        .toArray()
        .value(),
    };
    return result;
  }
}

export class HybridServicesNodesPageComponent implements ng.IComponentOptions {
  public controller = HybridServicesNodesPageCtrl;
  public templateUrl = 'modules/hercules/hybrid-services-nodes-page/hybrid-services-nodes-page.html';
  public bindings = {
    clusterId: '<',
  };
}
