import { Notification } from 'modules/core/notifications';

class HybridServicesNodesPageCtrl implements ng.IComponentController {
  public data: any;
  public loading = true;
  public gridOptions = {};

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private FusionClusterService,
    private FusionClusterStatesService,
    private FusionUtils,
    private Notification: Notification,
  ) {
    this.hybridConnectorsComparator = this.hybridConnectorsComparator.bind(this);
  }

  public $onChanges(changes: {[bindings: string]: ng.IChangesObject}) {
    let clusterId = changes['clusterId'];
    if (clusterId && clusterId.currentValue) {
      this.loadCluster(clusterId.currentValue);
    }
  }

  public hybridConnectorsComparator(a, b) {
    return this.FusionUtils.hybridConnectorsComparator(a.value, b.value);
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
        .reduce((acc, connector: any) => {
          const hostname = connector.hostname;
          const simplifiedConnector = {
            connectorType: connector.connectorType,
            service: this.$translate.instant(`hercules.connectorNameFromConnectorType.${connector.connectorType}`),
            statusName: this.$translate.instant(`hercules.status.${connector.state}`),
            status: this.FusionClusterStatesService.getMergedStateSeverity([connector]),
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
