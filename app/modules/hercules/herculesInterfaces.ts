/* FMS's cluster representation, the v1 API  */
export interface IClusterV1 {
  url: string;
  id: string;
  name: string;
  connectors: any;
  releaseChannel: string;
  provisioning: any;
  targetType: string;
  upgradeScheduleUrl: string;
  upgradeSchedule: any;
  resourceGroupId: string;
  aggregates: any;
}

export type CONNECTOR_STATE = 'running' | 'not_installed' | 'disabled' | 'downloading' | 'installing' | 'not_configured' | 'uninstalling' | 'registered' | 'initializing' | 'offline' | 'stopped' | 'not_operational' | 'unknown'; // | 'has_alarms'

export interface IAlarm {
  id: string;
  firstReported: number;
  lastReported: number;
  severity: 'critical' | 'error' | 'warning' | 'alert';
  title: string;
  description: string;
  solution: string;
  solutionReplacementValues: {
    text: string,
    link: string,
  }[];
}

export interface IConnector {
  url: string;
  id: string;
  connectorType: string;
  upgradeState: string;
  state: CONNECTOR_STATE;
  hostname: string;
  hostSerial: string;
  alarms: IAlarm[];
  runningVersion: string;
  packageUrl: string;
  connectorStatus: {
    operational: boolean;
    services: {
      cloud: any[];
      onprem: any[];
    }
  };
}
