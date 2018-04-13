export interface IMeetingBasicInfo {
  status: number;
  startTime: number;
  endTime: number;
  createdTime: number;
  duration: number;
}

export interface IMeetingDetail extends IMeetingBasicInfo {
  conferenceId: string;
  hostEmail: string;
  hostId: string;
  hostName: string;
  meetingName: string;
  meetingNumber: string;
  meetingType: string;
  numberOfParticipants: number;
  scheduleFrom: string;
  siteId: string;
  siteName: string;
  startFrom: string;
  startDate: string;
  endDate: string;
  duration_: string;
  startTime_: string;
  endTime_: string;
  screenShare: number;
  screenShare_: string;
  recording: number;
  recording_: string;
}

export interface ISession {
  sessionType?: string;
  duration?: number;
  class: boolean;
  val: string;
  key: string;
}

export interface IMeeting {
  meetingBasicInfo: IMeetingDetail;
  features: ISession[];
  connection: ISession[];
  sessions: ISession[];
}

export interface ICallType {
  completed: boolean;
  description: string;
  items: object[];
}

export interface IUniqueParticipant {
  sessionType: string;
  userId: string;
  guestId: string;
  platform: string;
  browser: string;
  userName: string;
  participants: object[];
}

export interface IParticipant {
  joinTime: number;
  leaveTime: number;
  userName: string;
  duration: number;
  reason: string;
  platform: string;
  browser: string;
  clientIP: string;
  gatewayIP: string;
  userId: string;
  guestId: string;
  conferenceID: string;
  sessionType: string;
  nodeId: string;
}

export interface IJoinTime {
  joinTime: number;
  userName: string;
  userId: string;
  guestId: string;
  joinMeetingTime: string;
  jmtQuality: string;
}

export interface IQos {
  [key: string]: object;
}

interface IObjectDict {
  [key: string]: object;
}

export type ISessionDetailItem = IObjectDict & {
  key: string;
  completed: boolean;
};

export type ISessionDetail = IObjectDict & {
  completed: boolean;
  items: ISessionDetailItem[];
};

export interface ICallLegs {
  tahoeInfo: object[];
  videoInfo: object[];
  voIPInfo: object[];
}

export interface IServerTime {
  timestamp: number;
  dateLong: number;
}
