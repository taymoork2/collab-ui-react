import { IDataRecord, IFeaturesInReport, IJoinMeetingRecord, IMediaInfoInReport, IMediaInReport, IMeetingSummaryInReport, IParticipantInReport, IParticipantsInName, IQualityInReport, IRoleChangeRecord, IRoleChangeSessionInReport, ISessionInReport, ISharingRecord, ISharingSessionInReport, ITeleSessionInReport } from './meeting-export.interface';
import { IDataStorage, IJoinTime, IWebexOneMeeting, ISessionDetail, IUniqueParticipant, Platforms } from './searchService';
import { SearchStorage } from 'modules/core/partnerReports/webexReports/diagnostic/partner-meeting.enum';
import { ISharingDetail, IRoleData } from 'modules/core/partnerReports/webexReports/diagnostic/partner-search.interfaces';
import { WebexReportsUtilService } from 'modules/core/partnerReports/webexReports/diagnostic/webex-reports-util.service';

export enum MediaType {
  PSTN = 'PSTN',
  Video = 'Video',
  VoIP = 'VoIP',
}

export class MeetingExportService {
  public featureName = 'report.webex.diagnostic';

  /* @ngInject */
  constructor(
    private $q: ng.IQService,
  ) {
  }

  // TODO (yashen2): add call to backend for report data
  public generateMeetingReport(dataStoreService: WebexReportsUtilService): IPromise<string> {
    return this.$q((resolve) => {
      const report = {};
      report['Meeting Summary'] = this.getMeetingSummary(dataStoreService);
      report['Participants'] = this.getParticipantsInName(dataStoreService);
      report['Features'] = this.getFeatures(dataStoreService);
      const JSONData: string = JSON.stringify(report, null, '\t');
      resolve(JSONData);
    });
  }

  private getMeetingSummary(dataStoreService: WebexReportsUtilService): IMeetingSummaryInReport {
    const meetingSummary: IMeetingSummaryInReport = {
      'Meeting Name': '',
      'Meeting Number': '',
      'Conference Id': '',
      'Site Name': '',
      'Site Id': '',
      Status: '',
      'Start Time': '',
      'End Time': '',
      Duration: '',
      'Host Name': '',
      'Host Id': '',
      'Host Email': '',
    };
    return this.searchMeetingSummary(meetingSummary, dataStoreService.getData());
  }

  private searchMeetingSummary(meetingSummary: IMeetingSummaryInReport, dataStorage: IDataStorage): IMeetingSummaryInReport {
    _.forOwn(meetingSummary, (value: any, key: string) => {
      const normalKey = this.normalizeKey(key);
      if (_.isEmpty(value)) {
        meetingSummary[key] = this.searchByKey(normalKey, dataStorage);
      }
    });
    return meetingSummary;
  }

  private normalizeKey(name: string): string {
    return _.camelCase(name);
  }

  // search values from 'source' by target key.
  public searchByKey(targetKey: string, source: object, ignoreCase: boolean = false): any {
    const queue: object[] = [];
    let result;
    queue.push(source);
    while (!_.isEmpty(queue)) {
      const obj: object = queue.shift() || {};
      _.forOwn(obj, function(value: any, key: string) {
        if (ignoreCase) {
          key = key.toLowerCase();
          targetKey = targetKey.toLowerCase();
        }
        if (key === targetKey) {
          result = value;
          return false;
        } else {
          if (typeof value === 'object') {
            queue.push(value);
          }
        }
      });
      if (!_.isEmpty(result)) {
        break;
      }
    }
    return result;
  }

  private getParticipantsInName(dataStoreService: WebexReportsUtilService): IParticipantsInName {
    const participantsInName: IParticipantsInName = {};
    const uniqueParticipants: IUniqueParticipant[] = <IUniqueParticipant[]>dataStoreService.getStorage(SearchStorage.UNIQUE_PARTICIPANTS);
    const joinMeetingTimes: IJoinTime[] = <IJoinTime[]>dataStoreService.getStorage(SearchStorage.JOIN_MEETING_TIMES);
    const sharingSessions: ISharingDetail[] = <ISharingDetail[]>dataStoreService.getStorage(SearchStorage.SHARING_SESSION_DETAIL);
    const roleChangeSessions: IRoleData[] = <IRoleData[]>dataStoreService.getStorage(SearchStorage.ROLE_CHANGE_SESSION_DETAIL);

    _.forEach(uniqueParticipants, (uniqueParticipant: IUniqueParticipant) => {
      const userName = uniqueParticipant.userName;
      const session: ISessionInReport = this.mkTeleSessionInReport(uniqueParticipant);

      _.forEach(uniqueParticipant.participants, (participant) => {
        const joinMeetingRecord: IJoinMeetingRecord = this.mkJoinMeetingRecord(participant, joinMeetingTimes, session, dataStoreService);
        session['Join Meeting Records'].push(joinMeetingRecord);
      });

      if (!_.has(participantsInName, userName)) {
        participantsInName[userName] = {
          'User Id': uniqueParticipant.userId,
          Sessions: [session],
        };
        const sharingSession = this.mkSharingSessionInReport(uniqueParticipant, sharingSessions);
        const roleChangeSession = this.mkRoleChangeSessionInReport(uniqueParticipant, roleChangeSessions);
        participantsInName[userName].Sessions.push(sharingSession);
        participantsInName[userName].Sessions.push(roleChangeSession);
      } else {
        const participantInRpt: IParticipantInReport = participantsInName[userName];
        participantInRpt.Sessions.push(session);
      }
    });

    return participantsInName;
  }

  private mkTeleSessionInReport(uniqueParticipant: IUniqueParticipant): ISessionInReport {
    let session: ITeleSessionInReport = {
      'Session Type': '',
      Platform: '',
      Browser: '',
      Device: '',
      'Guest Id': '',
      'Join Meeting Records': [],
    };

    _.forOwn(session, (initialValue: any, key: string) => {
      const normalKey = this.normalizeKey(key);
      if (_.isEmpty(initialValue)) {
        const newValue = this.searchByKey(normalKey, uniqueParticipant);
        session[key] = newValue ? newValue : initialValue;
      }
    });
    if (_.isEmpty(session.Device)) {
      session = _.omit(session, 'Device');
    }
    return session;
  }

  private mkSharingSessionInReport(uniqueParticipant: IUniqueParticipant, sharingSessions: ISharingDetail[]): ISessionInReport {
    const resultSession: ISharingSessionInReport = {
      'Session Type': 'Sharing',
      'Sharing Records': [],
    };
    const sharingRecord: ISharingRecord = {
      'Client Type': '',
      'Sharing Event': '',
      'Node Id': '',
      'Start Time': '',
      'End Time': '',
      Duration: '',
    };
    const sharingData = _.filter(sharingSessions, sharingSession => {
      return sharingSession.userName === uniqueParticipant.userName;
    });
    resultSession['Sharing Records'] = <ISharingRecord[]>this.mkDataRecords(sharingRecord, sharingData);

    return resultSession;
  }

  private mkRoleChangeSessionInReport(uniqueParticipant: IUniqueParticipant, roleChangeSessions: IRoleData[]): ISessionInReport {
    const resultSession: IRoleChangeSessionInReport = {
      'Session Type': 'Role Change',
      'Role Change Records': [],
    };

    const roleChangeRecord: IRoleChangeRecord = {
      'Role Type': '',
      TimeStamp: '',
      'From Node Id': '',
      'From User Name': '',
      'To Node Id': '',
    };
    const roleChangeData = _.filter(roleChangeSessions, roleChangeSession => {
      return roleChangeSession.toUserName === uniqueParticipant.userName;
    });
    resultSession['Role Change Records'] = <IRoleChangeRecord[]>this.mkDataRecords(roleChangeRecord, roleChangeData);

    return resultSession;
  }

  private mkDataRecords(dataTemplate: IDataRecord, dataStore: object[]): IDataRecord[] {
    const records: IDataRecord[] = [];
    _.forEach(dataStore, (item) => {
      const record = _.assignIn({}, dataTemplate);
      _.forOwn(record, (initialValue: any, key: string) => {
        const normalKey = this.normalizeKey(key);
        if (_.isEmpty(initialValue)) {
          const newValue = this.searchByKey(normalKey, item, true);
          record[key] = newValue ? newValue : initialValue;
        }
      });
      records.push(record);
    });
    return records;
  }

  private mkJoinMeetingRecord(participant, joinMeetingTimes, session, dataStoreService: WebexReportsUtilService): IJoinMeetingRecord {
    const joinTime = participant.joinTime;
    const guestId = participant.guestId;
    const userId = participant.userId;
    const nodeId = participant.nodeId;
    const joinMeetingRecord: IJoinMeetingRecord = {
      'Join Time': '',
      'Leave Time': '',
      'Join Meeting Time': '',
      Media: {},
    };

    _.forOwn(joinMeetingRecord, (value: any, key: string) => {
      const normalKey = this.normalizeKey(key);
      if (_.isEmpty(value)) {
        joinMeetingRecord[key] = this.searchByKey(normalKey, participant);
      }
    });

    const specificJMT = _.find(joinMeetingTimes, jmt => {
      return jmt['guestId'] === guestId && jmt['userId'] === userId && jmt['joinTime'] === joinTime;
    });

    if (!_.isEmpty(specificJMT)) {
      joinMeetingRecord['Join Meeting Time'] = specificJMT['joinMeetingTime'];
    }

    const mediaReport = this.generateMediaReport(session['Session Type'], nodeId, dataStoreService);
    if (mediaReport) {
      joinMeetingRecord.Media = mediaReport;
    }
    return joinMeetingRecord;
  }

  private getFeatures(dataStoreService: WebexReportsUtilService): IFeaturesInReport {
    const webexOneMeeting = <IWebexOneMeeting>dataStoreService.getStorage(SearchStorage.WEBEX_ONE_MEETING);
    const features: IFeaturesInReport = {
      'Screen Share': '',
      Recording: '',
    };
    if (!_.isEmpty(webexOneMeeting)) {
      const overview = webexOneMeeting['overview'];
      if (!_.isEmpty(overview)) {
        features['Screen Share'] = overview['screenShare_'];
        features['Recording'] = overview['recording_'];
      }
    }
    return features;
  }

  private generateMediaReport(sessionType: string, nodeId: string, dataStoreService: WebexReportsUtilService): IMediaInReport {
    const mediaReport: IMediaInReport = {};
    if (!nodeId) {
      return {};
    }
    if (sessionType === Platforms.PSTN) {
      const pstnSessionDetail = <ISessionDetail>dataStoreService.getStorage(SearchStorage.PSTN_SESSION_DETAIL);
      if (pstnSessionDetail) {
        mediaReport[MediaType.PSTN] = this.buildSpecificMediaReport(pstnSessionDetail, nodeId, MediaType.PSTN);
      }
    } else {
      const voipSessionDetail = <ISessionDetail>dataStoreService.getStorage(SearchStorage.VOIP_SESSION_DETAIL);
      const videoSessionDetail = <ISessionDetail>dataStoreService.getStorage(SearchStorage.VIDEO_SESSION_DETAIL);
      if (voipSessionDetail) {
        mediaReport[MediaType.VoIP] = this.buildSpecificMediaReport(voipSessionDetail, nodeId, MediaType.VoIP);
      }
      if (videoSessionDetail) {
        mediaReport[MediaType.Video] = this.buildSpecificMediaReport(videoSessionDetail, nodeId, MediaType.Video);
      }
    }
    return mediaReport;
  }

  private buildSpecificMediaReport(sessionDetail: ISessionDetail, nodeId: string, mediaType: string): IMediaInfoInReport[] {
    const nodeDetails = sessionDetail[nodeId];
    const specificMediaReport: IMediaInfoInReport[] = [];
    _.forEach(nodeDetails, (nodeDetail) => {
      const mediaInfo: IMediaInfoInReport = {
        'Start Time': '',
        'End Time': '',
        Duration: '',
        'End Reason': '',
        Quality: [],
      };

      if (mediaType === MediaType.PSTN) {
        _.assignIn(mediaInfo, { 'Phone Num': '', 'PSTN Node ID': '' });
      }

      _.forOwn(mediaInfo, (value: any, key: string) => {
        const normalKey = this.normalizeKey(key);
        if (_.isEmpty(value)) {
          const newValue = this.searchByKey(normalKey, nodeDetail, true);
          mediaInfo[key] = newValue ? newValue : value;
        }
      });

      const qualities = mediaType === MediaType.PSTN ? nodeDetail.tahoeQuality : nodeDetail.mmpQuality;
      _.forEach(qualities, qualityItem => {
        const qualityInReport: IQualityInReport = {
          'Start Time': '',
          'End Time': '',
          Fill: '',
        };

        if (mediaType === MediaType.PSTN) {
          _.assignIn(qualityInReport, {
            'Audio Mos': '',
            'Packet Bad': '',
            'Packet Lost': '',
            'Rx Packets': '',
            'Tx Packets': '',
          });
        } else {
          _.assignIn(qualityInReport, {
            'Loss Rates': '',
            RTTs: '',
          });
        }

        _.forOwn(qualityInReport, (value: any, key: string) => {
          const normalKey = this.normalizeKey(key);
          if (_.isEmpty(value)) {
            qualityInReport[key] = this.searchByKey(normalKey, qualityItem, true);
          }
        });
        mediaInfo.Quality.push(qualityInReport);
      });
      specificMediaReport.push(mediaInfo);
    });

    return specificMediaReport;
  }
}
