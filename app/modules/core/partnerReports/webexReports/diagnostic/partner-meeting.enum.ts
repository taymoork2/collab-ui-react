export enum TabType {
    AUDIO = 'Audio',
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
}
