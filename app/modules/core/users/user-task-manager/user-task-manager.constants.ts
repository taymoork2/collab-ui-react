export enum TaskListFilterType {
  ALL,
  ACTIVE,
  ERROR,
}

export enum TaskStatus {
  CREATED = 'CREATED',
  STARTING = 'STARTING',
  STARTED = 'STARTED',
  STOPPING = 'STOPPING',
  STOPPED = 'STOPPED',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  ABANDONED = 'ABANDONED',
  UNKNOWN = 'UNKNOWN',
}

export enum TaskType {
  USERONBOARD = 'useronboard',
}
