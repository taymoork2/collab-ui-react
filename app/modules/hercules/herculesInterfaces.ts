/* FMS's cluster representation, the v1 API  */
export interface IClusterV1 {
  url: string;
  id: string;
  name: string;
  connectors: any;
  releaseChannel: string;
  provisioning: any;
  registered: boolean;
  targetType: string;
  upgradeScheduleUrl: string;
  upgradeSchedule: any;
  resourceGroupId: string;
  aggregates: any;
}

export interface IAlarm {
  id: string;
  firstReported: number;
  lastReported: number;
  severity: string;
  title: string;
  description: string;
  solution: string;
  solutionReplacementValues?: Array<{
    text: string,
    link: string,
  }>;
}
