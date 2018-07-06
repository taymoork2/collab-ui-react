import { IAllowedRegistrationHost } from 'modules/hercules/services/hybrid-services-extras.service';
import { IServiceStatusDetails, IConnectorStateDetails } from 'modules/hercules/services/hybrid-services-cluster-states.service';

export type ClusterTargetType = 'c_mgmt' | 'mf_mgmt' | 'hds_app' | 'ucm_mgmt' | 'cs_mgmt' | 'ept' | 'unknown';
export type ConnectorAlarmSeverity = 'critical' | 'error' | 'warning' | 'alert';
export type ConnectorMaintenanceMode = 'on' | 'off' | 'pending';
export type ConnectorState = 'running' | 'not_installed' | 'disabled' | 'downloading' | 'installing' | 'not_configured' | 'uninstalling' | 'registered' |
  'initializing' | 'offline' | 'stopped' | 'not_operational' | 'unknown' | 'restarted' | 'upgraded';
export type ConnectorType = 'c_mgmt' | 'c_cal' | 'c_ucmc' | 'mf_mgmt' | 'hds_app' | 'cs_mgmt' | 'cs_context' | 'ucm_mgmt' | 'c_serab' | 'c_imp';
export type ConnectorUpgradeState = 'upgraded' | 'upgrading' | 'pending';
export type DayOfWeek = 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';
export type HybridServiceId = 'squared-fusion-mgmt' | 'squared-fusion-cal' | 'squared-fusion-gcal' | 'squared-fusion-uc' | 'squared-fusion-ec' | 'squared-fusion-media' |
                              'spark-hybrid-datasecurity' |'contact-center-context' | 'squared-fusion-khaos' | 'squared-fusion-servicability' | 'ept' |
                              'spark-hybrid-impinterop' | 'squared-fusion-o365' | 'spark-hybrid-licensing' | 'spark-hybrid-testing' |
                              'hcs' | 'hcs-licensing' | 'hcs-upgrade';
export type ServiceAlarmSeverity = 'error' | 'warning' | 'critical';

// Connectors
export type ConnectorStateSeverity = 0 | 1 | 2 | 3;
export type ConnectorStateSeverityLabel = 'ok' | 'unknown' | 'warning' | 'error';
export type ConnectorStateCSSClass = 'success' | 'disabled' | 'warning' | 'danger';

// Services
export type ServiceStatus = 'operational' | 'impaired' | 'outage';
// type Status = 'operational' | 'impaired' | 'outage' | 'setupNotComplete' | 'unknown';
export type ServiceStatusCSSClass = 'success' | 'disabled' | 'warning' | 'danger';

export type TimeOfDay = '00:00' | '01:00' | '02:00' | '03:00' | '04:00' | '05:00' | '06:00' | '07:00' | '08:00' | '09:00' | '10:00' | '11:00' | '12:00' | '13:00' | '14:00' | '15:00' | '16:00' | '17:00' | '18:00' | '19:00' | '20:00' | '21:00' | '22:00' | '23:00';

export interface IFMSOrganization {
  alarmsUrl: string;
  clusters: ICluster[];
  id: string;
  resourceGroups: IResourceGroup[];
  url: string;
  servicesUrl: string;
}

export interface IResourceGroup {
  id: string;
  name: string;
  releaseChannel: string;
}

export interface IUpgradeSchedule {
  moratoria: IMoratoria[];
  nextUpgradeWindow: ITimeWindow;
  scheduleDays: DayOfWeek[];
  scheduleTime: TimeOfDay;
  scheduleTimeZone: string;
  urgentScheduleTime: TimeOfDay;
  url: string;
  type?: string;
  jsonSchedule?: string;
}

export interface ICluster {
  allowedRegistrationHostsUrl: string;
  connectors: IConnector[];
  createdAt: string;
  id: string;
  legacyDeviceClusterId?: string;
  name: string;
  provisioning: IConnectorProvisioning[];
  releaseChannel: string;
  resourceGroupId?: string;
  targetType: ClusterTargetType;
  upgradeSchedule: IUpgradeSchedule;
  upgradeScheduleUrl: string;
  userCapacities?: {
    // TODO: is there a way to tell TS that it's ConnectorType not string?
    [connectorType: string]: number;
  };
  url: string;
}

// HybridServicesClusterService
export interface IClusterWithExtendedConnectors extends ICluster {
  connectors: IExtendedConnector[];
}

export interface IExtendedClusterFusion extends IClusterWithExtendedConnectors {
  extendedProperties: IClusterExtendedProperties;
}

export interface IClusterExtendedProperties {
  alarms: string; //  'none' | 'warning' | 'error';
  alarmsBadgeCss: string;
  allowedRedirectTarget?: IAllowedRegistrationHost;
  hasUpgradeAvailable: boolean;
  isUpgradeUrgent: boolean;
  isEmpty: boolean;
  maintenanceMode: ConnectorMaintenanceMode;
  registrationTimedOut: boolean;
  servicesStatuses: IExtendedClusterServiceStatus[];
  upgradeState: 'upgraded' | 'upgrading';
}

export interface IExtendedClusterServiceStatus {
  serviceId: HybridServiceId;
  state: IServiceStatusDetails;
  total: number;
}

export interface IHost {
  connectors: IConnector[];
  hardware?: {
    cpus: number;
    hostType: 'virtual' | 'physical' | 'unknown';
    totalDisk: string;
    totalMemory: string;
  };
  hostname: string;
  lastMaintenanceModeEnabledTimestamp?: string;
  maintenanceMode: ConnectorMaintenanceMode;
  platform?: 'ecp' | 'expressway';
  platformVersion?: string;
  serial: string;
  url: string;
}

export interface IClusterAggregate {
  alarms: IExtendedConnectorAlarm[];
  state: ConnectorState;
  upgradeState: 'upgraded' | 'upgrading';
  provisioning: IConnectorProvisioning;
  upgradeAvailable: boolean;
  upgradeWarning: boolean;
  hosts: IHostAggregate[];
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
  hostname: string;
  hostSerial: string;
  hostUrl: string;
  id: string;
  maintenanceMode: 'on' | 'off';
  platform?: 'ecp' | 'expressway';
  platformVersion?: string;
  runningVersion: string;
  state: ConnectorState;
  upgradeState: ConnectorUpgradeState;
  userCapacity?: number;
  url: string;
}

export interface IConnectorStatus {
  clusterSerials?: string[];
  initialized?: boolean;
  maintenanceMode: ConnectorMaintenanceMode;
  isQosOn: boolean;
  operational: boolean;
  userCapacity?: number;
  services: {
    onprem: any[];
    cloud: any[];
  };
  state: string;
  users?: {
    assignedRoomCount: number;
    assignedUserCount: number;
    totalFaultyCount: number | null;
    totalSubscribedCount: number | null;
  };
}

export interface IExtendedConnector extends IConnector {
  extendedProperties: IConnectorExtendedProperties;
}

export interface IConnectorExtendedProperties {
  alarms: string; //  'none' | 'warning' | 'error';
  alarmsBadgeCss: string; // duplicate of AlarmCSSClass
  hasUpgradeAvailable: boolean;
  isUpgradeUrgent: boolean;
  maintenanceMode: ConnectorMaintenanceMode;
  state: IConnectorStateDetails;
}

export interface IHostAggregate {
  alarms: IConnectorAlarm[];
  hostname: string;
  state: ConnectorState;
  upgradeState: ConnectorUpgradeState;
}

export interface ISolutionReplacementValues {
  text: string;
  link: string;
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
  solutionReplacementValues: ISolutionReplacementValues[];
  key?: string;
  replacementValues: IAlarmReplacementValues[];
}

export interface IAlarmReplacementValues {
  key: string;
  value: string;
  type?: string;
  href?: string;
}

export interface IServiceAlarm {
  url: string;
  serviceId: HybridServiceId;
  sourceId: 'uss' | 'ccc' | 'das' | 'hcm';
  sourceType: 'connector' | 'cloud';
  alarmId: string;
  severity: ServiceAlarmSeverity;
  title: string;
  description: string;
  key: string;
  replacementValues: IAlarmReplacementValues[];
}

export interface IExtendedConnectorAlarm extends IConnectorAlarm {
  hostname: string;
  affectedNodes: string[];
}

export interface IResourceGroup {
  id: string;
  name: string;
  releaseChannel: string;
}

export interface IReleaseChannelsResponse {
  releaseChannels: IReleaseChannelEntitlement[];
}

export interface IReleaseChannelEntitlement {
  channel: string;
  entitled: boolean;
}

export interface IClusterPropertySet {
  'mf.group.displayName'?: string;
  'mf.group.region'?: string;
  'mf.role'?: string;
  'mf.ucSipTrunk'?: string;
  'mf.videoQuality'?: string;
  'mf.trustedSipSources'?: string;
  'mf.maxCascadeBandwidth'?: number;
  'fms.releaseChannel'?: string;
  'fms.calendarAssignmentType'?: 'standard' | 'activeActive';
  'fms.callManagerAssignmentType'?: 'standard' | 'activeActive';
}
