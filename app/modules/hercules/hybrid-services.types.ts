export type ClusterTargetType = 'c_mgmt' | 'mf_mgmt' | 'hds_app' | 'ucm_mgmt' | 'cs_mgmt' | 'unknown';
export type ConnectorAlarmSeverity = 'critical' | 'error' | 'warning' | 'alert';
export type ConnectorMaintenanceMode = 'on' | 'off' | 'pending';
export type ConnectorState = 'running' | 'not_installed' | 'disabled' | 'downloading' | 'installing' | 'not_configured' | 'uninstalling' | 'registered' | 'initializing' | 'offline' | 'stopped' | 'not_operational' | 'unknown';
export type ConnectorType = 'c_mgmt' | 'c_cal' | 'c_ucmc' | 'mf_mgmt' | 'hds_app' | 'cs_mgmt' | 'cs_context' | 'ucm_mgmt' | 'c_serab';
export type ConnectorUpgradeState = 'upgraded' | 'upgrading' | 'pending';
export type DayOfWeek = 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';
export type ExtendedConnectorState = ConnectorState | 'has_warning_alarms' | 'has_error_alarms' | 'not_registered' | 'no_nodes_registered';
export type HybridServiceId = 'squared-fusion-mgmt' | 'squared-fusion-cal' | 'squared-fusion-gcal' | 'squared-fusion-uc' | 'squared-fusion-ec' | 'squared-fusion-media' | 'spark-hybrid-datasecurity' | 'contact-center-context' | 'squared-fusion-khaos' | 'squared-fusion-servicability';
export type TimeOfDay = '00:00' | '01:00' | '02:00' | '03:00' | '04:00' | '05:00' | '06:00' | '07:00' | '08:00' | '09:00' | '10:00' | '11:00' | '12:00' | '13:00' | '14:00' | '15:00' | '16:00' | '17:00' | '18:00' | '19:00' | '20:00' | '21:00' | '22:00' | '23:00';

export interface IFMSOrganization {
  alarmsUrl: string;
  clusters: ICluster[];
  id: string;
  resourceGroups: IResourceGroup[];
  url: string;
}

export interface IResourceGroup {
  id: string;
  name: string;
  releaseChannel: string;
}

export interface ICluster {
  connectors: IConnector[];
  id: string;
  name: string;
  provisioning: IConnectorProvisioning[];
  releaseChannel: string;
  resourceGroupId?: string;
  targetType: ClusterTargetType;
  upgradeSchedule: {
    moratoria: IMoratoria[];
    nextUpgradeWindow: ITimeWindow;
    scheduleDays: DayOfWeek[];
    scheduleTime: TimeOfDay;
    scheduleTimeZone: string;
    urgentScheduleTime: TimeOfDay;
    url: string;
  };
  upgradeScheduleUrl: string;
  url: string;
}

export interface IHost {
  connectors: IConnector[];
  hostname: string;
  maintenanceMode: ConnectorMaintenanceMode;
  serial: string;
  url: string;
}

export interface IClusterAggregate {
  alarms: IExtendedConnectorAlarm[];
  state: ExtendedConnectorState;
  upgradeState: 'upgraded' | 'upgrading';
  provisioning: IConnectorProvisioning;
  upgradeAvailable: boolean;
  upgradeWarning: boolean;
  hosts: IHostAggregate[];
}

export interface IExtendedCluster extends ICluster {
  aggregates: IClusterAggregate;
}

export interface IMoratoria {
  timeWindow: ITimeWindow;
  id: string;
  url: string;
}

export interface ITimeWindow {
  endTime: string;
  startTime: string;
}

export interface IConnectorProvisioning {
  availablePackageIsUrgent: boolean;
  availableVersion: string;
  connectorType: ConnectorType;
  packageUrl: string;
  provisionedVersion: string;
  url: string;
}

export interface IConnector {
  alarms: IConnectorAlarm[];
  clusterId: string;
  clusterUrl: string;
  connectorStatus?: IConnectorStatus;
  connectorType: ConnectorType;
  createdAt: string;
  hostSerial: string;
  hostUrl: string;
  hostname: string;
  id: string;
  maintenanceMode: 'on' | 'off';
  runningVersion: string;
  state: ConnectorState;
  upgradeState: ConnectorUpgradeState;
  url: string;
}

export interface IConnectorStatus {
  clusterSerials?: any[];
  initialized?: boolean;
  maintenanceMode?: ConnectorMaintenanceMode;
  operational: boolean;
  userCapacity?: number;
  services: {
    onprem: {
      address: string;
      type: 'uc_service' | 'cal_service' | 'mercury' | 'common_identity' | 'encryption_service' | 'cmr' | 'ebex_files' | 'fms';
      httpProxy: string;
      state: 'ok' | 'error';
      stateDescription: string;
      mercury?: {
        route: string;
        dataCenter: string;
      };
    }[];
    cloud: {
      address: string;
      type: 'ucm_cti' | 'ucm_axl' | 'exchange' | 'kms';
      version: string;
      state: 'ok' | 'error';
      stateDescription: string;
    }[];
  };
}

export interface IExtendedConnector extends IConnector {
  extendedState: ExtendedConnectorState;
}

interface IHostAggregate {
  alarms: IConnectorAlarm[];
  hostname: string;
  state: ConnectorState;
  upgradeState: ConnectorUpgradeState;
}

export interface IConnectorAlarm {
  id: string;
  // This hack should be removed once FMS starts using the correct format for alarm timestamps.
  firstReported: number | string;
  // This hack should be removed once FMS starts using the correct format for alarm timestamps.
  lastReported: number | string;
  severity: ConnectorAlarmSeverity;
  title: string;
  description: string;
  solution: string;
  solutionReplacementValues: {
    text: string,
    link: string,
  }[];
}

export interface IExtendedConnectorAlarm extends IConnectorAlarm {
  hostname: string;
  affectedNodes: string[];
}
