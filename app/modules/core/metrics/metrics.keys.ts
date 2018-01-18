export enum DiagnosticKey {
  LICENSE_MAP_ERROR = 'atlas_license_map_error',
  LOGIN_FAILURE = 'atlas_login_failure',
  NOTIFICATION = 'atlas_notification',
  ANALYTICS_FAILURE = 'atlas_analytics_failure',
}

export enum OperationalKey {
  NOTIFICATION = 'atlas_notification',
  RATE_LIMIT_RETRY = 'atlas_rate_limit_retry',
  CSP_VIOLATION = 'atlas_content_security_policy_violation',
}

export enum TimingKey {
  LOAD_DURATION = 'atlas_timing_load',
  LOGIN_DURATION = 'atlas_timing_login',
}

export enum MarkKey {
  LOGIN_START = 'mark_login_start',
  LOGIN_STOP = 'mark_login_stop',
}

export enum MeasureKey {
  LOGIN_DURATION = 'measure_login_duration',
}
