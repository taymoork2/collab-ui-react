/* Using Title Case below, because the interfaces here work as the data template that
*  used to export data to a JSON file. As customer's requirment, we should use Title Case
*  in the final exported file.
*/
export interface IQualityInReport {
  'Start Time': string;
  'End Time': string;
  'Fill': string;
  'Audio Mos'?: string;
  'Loss Rates'?: string;
  'RTTs'?: string;
  'Packet Bad'?: string;
  'Packet Lost'?: string;
  'Rx Packets'?: string;
  'Tx Packets'?: string;
}

export interface IMediaInfoInReport {
  'Start Time': string;
  'End Time': string;
  'Duration': string;
  'End Reason': string;
  'Phone Number'?: string;
  'PSTN Node ID'?: string;
  'Quality': IQualityInReport[];
}

export interface IMediaInReport {
  'VoIP'?: IMediaInfoInReport[];
  'PSTN'?: IMediaInfoInReport[];
  'Video'?: IMediaInfoInReport[];
}

export interface IJoinMeetingRecord {
  'Join Time': string;
  'Leave Time': string;
  'Join Meeting Time': string;
  'Media': IMediaInReport;
}

export interface ISessionInReport {
  'Session Type': string;
  'Platform': string;
  'Browser': string;
  'Device': string;
  'Guest Id': string;
  'Join Meeting Records': IJoinMeetingRecord[];
}

export interface IParticipantInReport {
  'User Id': string;
  'Sessions': ISessionInReport[];
}

export interface IParticipantsInName {
  [propName: string]: IParticipantInReport;
}

export interface IMeetingSummaryInReport {
  'Meeting Name': string;
  'Meeting Number': string;
  'Conference Id': string;
  'Site Name': string;
  'Site Id': string;
  'Status': string;
  'Start Time': string;
  'End Time': string;
  'Duration': string;
  'Host Name': string;
  'Host Id': string;
  'Host Email': string;
}

export interface IFeaturesInReport {
  'Screen Share': string;
  'Recording': string;
}

export interface IWindowService extends ng.IWindowService {
  webkitURL: any;
}
