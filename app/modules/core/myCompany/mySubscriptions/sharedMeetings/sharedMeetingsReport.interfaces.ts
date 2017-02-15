import { IGraphBase } from '../../../partnerReports/partnerReportInterfaces';

export interface IMeetingData {
  TimeBucketStart: string;
  NumOfMtgs: number;
}

export interface ISMPTimeFilter {
  label: string;
  value: number;
}

export interface ISMPData extends IGraphBase {
  maxMeetings: number;
  meetings: number;
}
