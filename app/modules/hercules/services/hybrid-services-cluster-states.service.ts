import { IConnector, ConnectorAlarmSeverity, ConnectorState, ExtendedConnectorState } from 'modules/hercules/hybrid-services.types';

export interface IMergedStateSeverity {
  cssClass: StatusIndicatorCSSClass;
  label: SeverityLabel;
  name: ConnectorState;
  severity: Severity;
}

type AlarmCSSClass = 'warning' | 'danger';
export type StatusIndicatorCSSClass = 'success' | 'warning' | 'danger' | 'disabled';
type Status = 'operational' | 'impaired' | 'outage' | 'setupNotComplete' | 'unknown';
type Severity = 0 | 1 | 2 | 3;
type SeverityLabel = 'ok' | 'unknown' | 'warning' | 'error';

export class HybridServicesClusterStatesService {
  /* @ngInject */
  constructor() { }

  public getAlarmSeverityCssClass(alarmSeverity: ConnectorAlarmSeverity): AlarmCSSClass {
    if (alarmSeverity === 'critical' || alarmSeverity === 'error') {
      return 'danger';
    }
    return 'warning';
  }

  // Special function, returning a FULL state with a name, a severity and
  // a severity label
  public getMergedStateSeverity(connectors: IConnector[]): IMergedStateSeverity {
    let stateSeverity;
    if (connectors.length === 0) {
      stateSeverity = this.getStateSeverity('not_installed');
      return <IMergedStateSeverity>{
        cssClass: this.getSeverityCssClass(stateSeverity),
        label: this.getSeverityLabel(stateSeverity),
        name: 'not_installed',
        severity: stateSeverity,
      };
    }
    const mostSevereConnector = _.last<IConnector>(_.sortBy(connectors, connector => this.getStateSeverity(connector)));
    return this.getSeverity(mostSevereConnector);
  }

  public getMergedUpgradeState(connectors: IConnector[]): 'upgraded' | 'upgrading' {
    const allAreUpgraded = _.every(connectors, { upgradeState: 'upgraded' });
    return allAreUpgraded ? 'upgraded' : 'upgrading';
  }

  public getSeverity(connectorOrState: IConnector | ConnectorState, property?: string): IMergedStateSeverity {
    property = property || 'state';
    const stateSeverity = this.getStateSeverity(connectorOrState);
    return <IMergedStateSeverity>{
      cssClass: this.getSeverityCssClass(stateSeverity),
      label: this.getSeverityLabel(stateSeverity),
      name: _.isString(connectorOrState) ? connectorOrState : connectorOrState[property],
      severity: stateSeverity,
    };
  }

  public getSeverityLabel(value: Severity): SeverityLabel {
    let label: SeverityLabel = 'ok';
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

  public getStateSeverity(connectorOrState: IConnector | ExtendedConnectorState): Severity {
    // Also note that this function accepts both a connector or just a string
    let state: ExtendedConnectorState = 'running';
    if (!_.isString(connectorOrState)) {
      if (this.connectorHasAlarms(connectorOrState)) {
        state = _.some(connectorOrState.alarms, (alarm) => {
          return alarm.severity === 'critical' || alarm.severity === 'error';
        }) ? 'has_error_alarms' : 'has_warning_alarms';
      } else {
        state = connectorOrState.state;
      }
    } else {
      state = connectorOrState;
    }

    let value: Severity = 0;
    switch (state) {
      case 'running':
        break;
      case 'not_installed':
      case 'not_configured':
      case 'no_nodes_registered':
      case 'disabled':
        value = 1;
        break;
      case 'downloading':
      case 'installing':
      case 'uninstalling':
      case 'registered':
      case 'has_warning_alarms':
        value = 2;
        break;
      case 'not_operational':
      case 'has_error_alarms':
      case 'offline':
      case 'stopped':
      case 'unknown':
      default:
        value = 3;
    }
    return value;
  }

  public getStatusIndicatorCSSClass(status: Status): StatusIndicatorCSSClass {
    let cssClass: StatusIndicatorCSSClass;
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
      case 'unknown':
      default:
        cssClass = 'warning';
    }
    return cssClass;
  }

  // Private
  private connectorHasAlarms(connector: IConnector): boolean {
    return connector.alarms && connector.alarms.length > 0;
  }

  private getSeverityCssClass(severity: Severity): StatusIndicatorCSSClass {
    let cssClass: StatusIndicatorCSSClass = 'success';
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
  .module('Hercules')
  .service('HybridServicesClusterStatesService', HybridServicesClusterStatesService)
  .name;
