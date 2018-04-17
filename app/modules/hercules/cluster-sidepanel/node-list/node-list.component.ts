import { ConnectorType, IConnector, IExtendedClusterFusion } from 'modules/hercules/hybrid-services.types';
import { Notification } from 'modules/core/notifications/notification.service';
import { HybridServicesClusterService } from 'modules/hercules/services/hybrid-services-cluster.service';

interface INodes {
  hostname: string;
  connectors: IConnector[];
}

export class NodeListComponentCtrl implements ng.IComponentController {

  public cluster: IExtendedClusterFusion;
  public hosts: INodes[];
  public connectorType: ConnectorType;
  public localizedManagementConnectorName = this.$translate.instant('hercules.connectorNameFromConnectorType.c_mgmt');
  public localizedConnectorName = this.$translate.instant(`hercules.connectorNameFromConnectorType.${this.connectorType}`);
  public localizedContextManagementConnectorName = this.$translate.instant('hercules.connectorNameFromConnectorType.cs_mgmt');
  public localizedContextConnectorName = this.$translate.instant('hercules.connectorNameFromConnectorType.cs_context');
  public loading: boolean = true;

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private HybridServicesClusterService: HybridServicesClusterService,
    private Notification: Notification,
  ) {}

  public $onInit() {
    if (this.cluster) {
      this.HybridServicesClusterService.get(this.cluster.id)
        .then(cluster => {
          this.hosts = this.buildSidepanelConnectorList(cluster, this.connectorType);
        })
        .catch((error) => {
          this.Notification.errorWithTrackingId(error, 'hercules.genericFailure');
        })
        .finally(() => {
          this.loading = false;
        });
    }
  }

  public sortConnectors(connector): number {
    if (connector.connectorType === 'c_mgmt') {
      return -1;
    } else {
      return 1;
    }
  }

  public hasConnectors = () => {
    return this.cluster && this.cluster.connectors.length > 0;
  }

  private buildSidepanelConnectorList(cluster: IExtendedClusterFusion, connectorTypeToKeep: ConnectorType): INodes[] {
    // Find and populate hostnames only, and make sure that they are only there once
    const nodes: INodes[] = _.chain(cluster.connectors)
      .map(connector => {
        return {
          hostname: connector.hostname,
          connectors: [],
        };
      })
      .uniqBy(host => host.hostname)
      .value();

    // Find and add all c_mgmt connectors (always displayed no matter the current service pages we are looking at)
    // plus the connectors we're really interested in
    _.forEach(cluster.connectors, connector => {
      if (connector.connectorType === 'c_mgmt' || connector.connectorType === connectorTypeToKeep || connector.connectorType === 'cs_context' || connector.connectorType === 'cs_mgmt') {
        const node = _.find(nodes, node => {
          return node.hostname === connector.hostname;
        });
        if (node.hostname === '') {
          node.hostname = this.$translate.instant('hercules.connectors.no_name');
        }
        node.connectors.push(connector);
      }
    });
    return nodes;
  }
}

export class NodeListComponent implements ng.IComponentOptions {
  public controller = NodeListComponentCtrl;
  public template = require('modules/hercules/cluster-sidepanel/node-list/node-list.html');
  public bindings = {
    cluster: '<',
    connectorType: '<',
  };
}
