import { IConnector, ConnectorAlarmSeverity, ConnectorState, ServiceStatusCSSClass, ConnectorStateSeverityLabel, ConnectorStateSeverity, ServiceStatus, ConnectorStateCSSClass } from 'modules/hercules/hybrid-services.types';
import { HighLevelStatusForService } from 'modules/hercules/services/hybrid-services-cluster.service';

export interface IConnectorStateDetails {
  cssClass: ConnectorStateCSSClass;
  label: ConnectorStateSeverityLabel;
  name: ConnectorState;
  severity: ConnectorStateSeverity;
}

export interface IServiceStatusDetails {
  cssClass: ServiceStatusCSSClass;
  name: ServiceStatus;
}

export class HybridServicesClusterStatesService {
  /* @ngInject */
  constructor() {}

  public getAlarmSeverityCSSClass(alarmSeverity: ConnectorAlarmSeverity): 'warning' | 'danger' {
    if (alarmSeverity === 'critical' || alarmSeverity === 'error') {
      return 'danger';
    }
    return 'warning';
  }

  public getConnectorStateDetails(connector: IConnector): IConnectorStateDetails {
    const state = connector.state;
    const severity = this.getConnectorStateSeverity(state);
    return {
      cssClass: this.getConnectorStateCSSClass(severity),
      label: this.getConnectorStateSeverityLabel(severity),
      name: connector.state,
      severity: this.getConnectorStateSeverity(state),
    };
  }

  /**
   * To be sued to get an hybrid service statuse, but could be used with any array of
   * connectors!
   * @param connectors IConnector[]
   */
  // TODO: take into account the upgradeState of the connector!
  public getServiceStatusDetails(connectors: IConnector[]): IServiceStatusDetails {
    if (connectors.length === 0) {
      const implicitStateLabel: ServiceStatus = 'outage';
      return {
        cssClass: this.getServiceStatusCSSClassFromLabel(implicitStateLabel),
        name: implicitStateLabel,
      };
    } else if (connectors.length === 1) {
      let implicitStateLabel: ServiceStatus  = 'outage';
      // If the only connector is running, only case where it's not an outage
      if (connectors[0].state === 'running') {
        implicitStateLabel = 'operational';
      }
      return {
        cssClass: this.getServiceStatusCSSClassFromLabel(implicitStateLabel),
        name: implicitStateLabel,
      };
    } else {
      const connectorStateSeverities = _.map(connectors, (connector) => {
        return this.getConnectorStateSeverity(connector.state);
      });
      const allGreens = _.every(connectorStateSeverities, (severity) => severity === 0);
      const allReds = _.every(connectorStateSeverities, (severity) => severity === 3);
      const hasGreens = _.some(connectorStateSeverities, (severity) => severity === 0);
      const hasGrays = _.some(connectorStateSeverities, (severity) => severity === 1);
      const hasYellows = _.some(connectorStateSeverities, (severity) => severity === 2);
      const hasReds = _.some(connectorStateSeverities, (severity) => severity === 3);
      if (allGreens) {
        return {
          cssClass: this.getServiceStatusCSSClassFromLabel('operational'),
          name: 'operational',
        };
      } else if (allReds || (!hasGreens && !hasGrays) || (!hasGreens && !hasYellows) || (!hasGreens && !hasReds)) {
        return {
          cssClass: this.getServiceStatusCSSClassFromLabel('outage'),
          name: 'outage',
        };
      } else {
        return {
          cssClass: this.getServiceStatusCSSClassFromLabel('impaired'),
          name: 'impaired',
        };
      }
    }
  }

  public getMergedUpgradeState(connectors: IConnector[]): 'upgraded' | 'upgrading' {
    const allAreUpgraded = _.every(connectors, { upgradeState: 'upgraded' });
    return allAreUpgraded ? 'upgraded' : 'upgrading';
  }

  public getConnectorStateSeverityLabel(value: ConnectorStateSeverity): ConnectorStateSeverityLabel {
    let label: ConnectorStateSeverityLabel = 'ok';
    switch (value) {
      case 0:
        label = 'ok';
        break;
      case 1:
        label = 'unknown';
        break;
      case 2:
        label = 'warning';
        break;
      case 3:
        label = 'error';
        break;
    }
    return label;
  }

  public getConnectorStateSeverity(state: ConnectorState): ConnectorStateSeverity {
    let value: ConnectorStateSeverity = 0;
    switch (state) {
      case 'running':
        break;
      case 'disabled':
      case 'not_configured':
      case 'not_installed':
        value = 1;
        break;
      case 'downloading':
      case 'installing':
      case 'registered':
      case 'uninstalling':
      case 'initializing':
        value = 2;
        break;
      case 'not_operational':
      case 'offline':
      case 'stopped':
      case 'unknown':
      default:
        value = 3;
    }
    return value;
  }

  public getServiceStatusCSSClassFromLabel(status: ServiceStatus | HighLevelStatusForService): ServiceStatusCSSClass {
    let cssClass: ServiceStatusCSSClass;
    switch (status) {
      case 'operational':
        cssClass = 'success';
        break;
      case 'outage':
        cssClass = 'danger';
        break;
      case 'setupNotComplete':
        cssClass = 'disabled';
        break;
      case 'impaired':
      default:
        cssClass = 'warning';
    }
    return cssClass;
  }

  // Private
  private getConnectorStateCSSClass(severity: ConnectorStateSeverity): ConnectorStateCSSClass {
    let cssClass: ConnectorStateCSSClass = 'success';
    switch (severity) {
      case 0:
        cssClass = 'success';
        break;
      case 1:
        cssClass = 'disabled';
        break;
      case 2:
        cssClass = 'warning';
        break;
      case 3:
        cssClass = 'danger';
        break;
    }
    return cssClass;
  }
}

export default angular
  .module('hercules.cluster-states', [])
  .service('HybridServicesClusterStatesService', HybridServicesClusterStatesService)
  .name;
