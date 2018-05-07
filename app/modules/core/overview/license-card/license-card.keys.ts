export enum StatusType {
  DANGER = 'danger',
  DEGRADED_PERFORMANCE = 'degraded_performance',
  OPERATIONAL = 'operational',
  PARTIAL_OUTAGE = 'partial_outage',
  SUCCESS = 'success',
  WARNING = 'warning',
}

export interface IHealthObject {
  components: IHealthComponent[];
}

export interface IHealthComponent {
  id: string;
  status: StatusType;
}

export interface ISettingsUrlObject {
  requireSites?: boolean;
  url: string;
}

export type HealthStatus = StatusType.DANGER | StatusType.SUCCESS | StatusType.WARNING;
