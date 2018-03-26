export enum TaskListFilterType {
  ALL,
  ACTIVE,
}

export enum TaskStatus {
  CREATED = 'CREATED',
  STARTING = 'STARTING',
  STARTED = 'STARTED',
  STOPPING = 'STOPPING',
  STOPPED = 'STOPPED',
  COMPLETED = 'COMPLETED',
  COMPLETED_WITH_ERRORS = 'COMPLETED_WITH_ERRORS',
  FAILED = 'FAILED',
  ABANDONED = 'ABANDONED',
  UNKNOWN = 'UNKNOWN',
}

export enum TaskType {
  USERONBOARD = 'useronboard',
}
