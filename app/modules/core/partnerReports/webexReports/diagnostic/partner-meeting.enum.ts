export enum TabType {
  AUDIO = 'Audio',
  DATA = 'Data',
  VIDEO = 'Video',
}

export enum QualityType {
  GOOD = 'Good',
  FAIR = 'Fair',
  POOR = 'Poor',
  NA = 'N/A',
}

export enum QosType {
  VOIP = 'voip',
  VIDEO = 'video',
  CMR = 'cmr',
  PSTN = 'pstn',
  SHARING = 'sharing',
}

export enum MosType {
  GOOD = 4,
  FAIR = 3,
  POOR = 0,
}

export enum SearchStorage {
  UNIQUE_PARTICIPANTS = 'uniqueParticipants',
  JOIN_MEETING_TIMES = 'joinMeetingTimes',
  VOIP_SESSION_DETAIL = 'voipSessionDetail',
  VIDEO_SESSION_DETAIL = 'videoSessionDetail',
  PSTN_SESSION_DETAIL = 'pstnSessionDetail',
  WEBEX_ONE_MEETING = 'webexOneMeeting',
  TIME_ZONE = 'timeZone',
  WEBEX_OVERVIEW = 'webexOneMeeting.overview',
  WEBEX_MEETING = 'webexMeeting',
  SEARCH_STRING = 'searchStr',
  CLIENT_VERSION = 'ClientVersion',
  WEBEX_MEETING_ENDTIME = 'webexOneMeeting.endTime',
  SHARING_SESSION_DETAIL = 'sharingSessionDetail',
  ROLE_CHANGE_SESSION_DETAIL = 'roleChangeSessionDetail',
}

export enum Platforms {
  WINDOWS = '0',
  MAC = '1',
  SOLARIS = '2',
  JAVA = '3',
  LINUX = '4',
  FLASH = '5',
  IPHONE = '7',
  MOBILE_DEVICE = '8',
  IP_PHONE = '9',
  TP = '10',
  BLACK_BERRY = '11',
  WIN_MOBILE = '12',
  ANDROID = '13',
  NOKIA = '14',
  THIN_CLIENT = '15',
  PSTN = '25',
}

export enum Devices {
  WINDOW = 'Windows',
  MAC = 'Mac',
  SOLARIS = 'Solaris',
  JAVA = 'Java',
  LINUX = 'Linux',
  FLASH = 'Flash',
  JAVASCRIPT = 'Javascript',
  IOS = 'iOS',
  MOBILE_DEVICE = 'MOBILE DEVICE',
  IP_PHONE = 'IP Phone',
  CISCO_TP = 'Cisco TP',
  BLACK_BERRY = 'BlackBerry',
  WIN_MOBILE = 'WinMobile',
  ANDROID = 'Android',
  NOKIA = 'Nokia',
  PHONE = 'Phone',
  PSTN = 'PSTN',
}

export enum Browser {
  NETSCAPE = 'Netscape',
  IE = 'IE',
  TP = 'Stand alone application',
  MOZILLA = 'Mozilla',
  FIREFOX = 'Firefox',
  SAFARI = 'Safari',
  CHROME = 'Chrome',
}

export enum Quality {
  GOOD = 1,
  FAIR = 2,
  POOR = 3,
  NA = 4,
}

export enum QualityRange {
  UPPER_LOSSRATE = 5,
  LOWER_LOSSRATE = 3,
  UPPER_LATENCY = 400,
  LOWER_LATENCY = 300,
}

export enum ResponseStatus {
  INPROGRESS = 'inProgress',
  ENDED = 'ended',
}

export enum SharingEvent {
  DOCUMENT = 'DocumentSharing',
  APPLICATION = 'ApplicationSharing',
}

export enum TrackingEventName {
  MEETING_SEARCH = 'webexReports.diagnostic.meetingSearch',
  MEETING_DETAILS = 'webexReports.diagnostic.meetingDetails',
  MEETING_PARTICIPANTS = 'webexReports.diagnostic.meetingParticipants',
}

export enum RoleType {
  HOST = 'Host',
  PRESENTER = 'Presenter',
}

export enum SERVICE_TYPE {
  PARTNER = 'PARTNER',
}
