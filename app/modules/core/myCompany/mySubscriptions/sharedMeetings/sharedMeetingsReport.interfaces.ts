import { IGraphBase } from '../../../partnerReports/partnerReportInterfaces';

export interface IMeetingData {
  TimeBucketStart: string;
  NumOfMtgs: number;
}

export interface ISharedMeetingTimeFilter {
  label: string;
  value: number;
}

export interface ISharedMeetingData extends IGraphBase {
  maxMeetings: number;
  meetings: number;
}
