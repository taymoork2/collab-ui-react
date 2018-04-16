export enum StatusTypes {
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
  status: string;
}

export interface ISettingsUrlObject {
  requireSites?: boolean;
  url: string;
}

export type HealthStatus = StatusTypes.DANGER | StatusTypes.SUCCESS | StatusTypes.WARNING;
