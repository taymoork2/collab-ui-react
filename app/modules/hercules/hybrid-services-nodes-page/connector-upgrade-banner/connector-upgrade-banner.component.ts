import { ConnectorType, IExtendedClusterFusion } from 'modules/hercules/hybrid-services.types';
import { ISimplifiedConnector, ISimplifiedNode } from 'modules/hercules/hybrid-services-nodes-page/hybrid-services-nodes-page.component';
import { IToolkitModalService } from 'modules/core/modal';

type Upgradable = 'no_because_maintenance' | 'no_because_offline' | 'no_because_mixed_state' | 'yes_but_mixed_state' | 'yes';
export interface IConnectorUpgrade {
  connectorType: ConnectorType;
  connectorTypeTranslationKey: string;
  hasUpgradeAvailable: boolean;
  isUpgradeUrgent: boolean;
  upgradable: Upgradable;
}

export class ConnectorUpgradeBannerController implements ng.IComponentController {
  private cluster: IExtendedClusterFusion;
  private onModalClosed: Function;
  public connectorTypesWithUpgrade: IConnectorUpgrade[] = [];

  /* @ngInject */
  constructor(
    private $modal: IToolkitModalService,
    private $translate: ng.translate.ITranslateService,
    private Analytics,
  ) {}

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject<any> }) {
    const { nodes } = changes;
    if (nodes && nodes.currentValue) {
      this.parseNodes(nodes.currentValue);
    }
  }

  public openUpgradeModal(connectorUpgrade: IConnectorUpgrade): void {
    this.Analytics.trackHybridServiceEvent(this.Analytics.sections.HS_NAVIGATION.eventNames.OPEN_CONNECTOR_UPGRADE_MODAL, {
      'Cluster Id': this.cluster.id,
      'Connector Type': connectorUpgrade.connectorType,
    });
    this.$modal.open({
      template: require('modules/hercules/connector-upgrade-modal/connector-upgrade-modal.html'),
      type: 'small',
      controller: 'ConnectorUpgradeController',
      controllerAs: 'ConnectorUpgradeCtrl',
      resolve: {
        connectorUpgrade: () => connectorUpgrade,
        cluster: () => this.cluster,
      },
    })
      .result
      .then(() => {
        this.onModalClosed({
          options: {
            reload: true,
          },
        });
      });
  }

  public getBannerAlertType(connectors: ISimplifiedConnector[]): 'info' | 'warning' {
    return _.some(connectors, connector => connector.isUpgradeUrgent) ? 'warning' : 'info';
  }

  private parseNodes(nodes: ISimplifiedNode[]) {
    // Side effect
    this.connectorTypesWithUpgrade = _.chain(nodes)
      .map(node => node.connectors)
      .flatten<ISimplifiedConnector>()
      .groupBy('connectorType')
      .mapValues((groupOfConnectors: ISimplifiedConnector[]) => {
        const connectorType = groupOfConnectors[0].connectorType;
        return {
          connectorType: connectorType,
          connectorTypeTranslationKey: this.$translate.instant(`hercules.connectorNameFromConnectorType.${connectorType}`),
          hasUpgradeAvailable: _.some(groupOfConnectors, 'hasUpgradeAvailable'),
          isUpgradeUrgent: _.some(groupOfConnectors, 'isUpgradeUrgent'),
          upgradable: this.findIfUpgradable(groupOfConnectors),
        };
      })
      .toArray<IConnectorUpgrade>()
      .filter(connectorTypeUpgradeInformation => connectorTypeUpgradeInformation.hasUpgradeAvailable)
      .value();
  }

  private findIfUpgradable(connectors: ISimplifiedConnector[]): Upgradable {
    // If all connectors are shutdown for maintenance mode
    if (_.every(connectors, (connector) => connector.extendedProperties.maintenanceMode !== 'off' && connector.originalState === 'offline')) {
      return 'no_because_maintenance';
    // If all connectors are MEdia and in maintenance mode
    } else if (_.every(connectors, (connector) => connector.extendedProperties.maintenanceMode !== 'off' && connector.connectorType === 'mf_mgmt')) {
      return 'no_because_maintenance';
    // If all connectors are offline (includes shutdown for maintenance mode and "just" offline connectors)
    } else if (_.every(connectors, (connector) => connector.originalState === 'offline')) {
      return 'no_because_offline';
    // If all connectors are either offline or shutdown for maintenance
    } else if (_.every(connectors, (connector) => (connector.extendedProperties.maintenanceMode !== 'off' && connector.originalState === 'offline') || connector.originalState === 'offline')) {
      return 'no_because_mixed_state';
    // If only some connectors are either offline or shutdown for maintenance
    } else if (_.some(connectors, (connector) => (connector.extendedProperties.maintenanceMode !== 'off' && connector.originalState === 'offline') || connector.originalState === 'offline')) {
      return 'yes_but_mixed_state';
    }
    return 'yes';
  }
}

export class ConnectorUpgradeBannerComponent implements ng.IComponentOptions {
  public controller = ConnectorUpgradeBannerController;
  public template = require('./connector-upgrade-banner.html');
  public bindings = {
    cluster: '<',
    nodes: '<',
    onModalClosed: '&',
  };
}
