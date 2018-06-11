export enum OrgDeleteStatus {
  CREATED = 'CREATED',
  RUNNING = 'RUNNING',
  COMPLETE = 'COMPLETE',
  FAILED = 'FAILED',
}

export interface IOrgDeleteResponse {
  location: string;
}
