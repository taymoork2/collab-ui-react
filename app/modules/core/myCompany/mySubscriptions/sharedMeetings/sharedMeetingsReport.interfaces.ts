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

export interface ISharedMeetingCSV {
  MeetingTopic: string;
  StartTime: string;
  EndTime: string;
  ConfId: string;
  Duration: number | string;
  MeetingType: number | string;
  HostId: number | string;
  HostName: string;
}
