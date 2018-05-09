export enum HealthStatusType {
  DANGER = 'danger',
  DEGRADED_PERFORMANCE = 'degraded_performance',
  ERROR = 'error',
  MAJOR_OUTAGE = 'major_outage',
  OPERATIONAL = 'operational',
  PARTIAL_OUTAGE = 'partial_outage',
  SUCCESS = 'success',
  UNKNOWN = 'unknown',
  WARNING = 'warning',
}

export enum HealthStatusID {
  //Spark
  SparkMeeting = 'lkjcjdfgfnbk',
  SparkMessage = '4z5sdybd2jxy',
  SparkCall = 'gfg7cvjszyw0',
  CCMAdministration = '7v9ds0q2zfsy',
  SparkHybridServices = 'f8tnkxbzs12q',
  DeveloperApi = 'vn0b18kjj7nf',
  SparkAccount = 'kq245y682023',
  // Currently using id of Spark call. This is temporary.
  SPARK_CARE = 'gfg7cvjszyw0',
}

export interface IHealthObject {
  components: IHealthComponent[];
}

export interface IHealthComponent {
  id: string;
  status: HealthStatusType;
}

export type HealthStatus = HealthStatusType.DANGER | HealthStatusType.SUCCESS | HealthStatusType.WARNING;
