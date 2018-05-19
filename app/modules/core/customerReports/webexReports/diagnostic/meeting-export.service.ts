import { IFeaturesInReport, IJoinMeetingRecord, IMediaInfoInReport, IMediaInReport, IMeetingSummaryInReport, IParticipantInReport, IParticipantsInName, IQualityInReport, ISessionInReport } from './meeting-export.interface';
import { IJoinTime, ISessionDetail, IUniqueParticipant, Platforms, SearchService, SearchStorage } from './searchService';

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
    private SearchService: SearchService,
  ) {
  }

  public generateMeetingReport(): IPromise<string> {
    return this.$q((resolve) => {
      const report = {};
      report['Meeting Summary'] = this.getMeetingSummary();
      report['Participants'] = this.getParticipantsInName();
      report['Features'] = this.getFeatures();
      const JSONData: string = JSON.stringify(report, null, '\t');
      resolve(JSONData);
    });
  }

  private getMeetingSummary(): IMeetingSummaryInReport {
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
    return this.searchMeetingSummary(meetingSummary, [this.SearchService.getData()]);
  }

  private searchMeetingSummary(meetingSummary: IMeetingSummaryInReport, sources: object[]): IMeetingSummaryInReport {
    _.forOwn(meetingSummary, (value: any, key: string) => {
      const normalKey = this.normalizeKey(key);
      if (_.isEmpty(value)) {
        meetingSummary[key] = this.searchByKey(normalKey, sources);
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
      const obj: Object = queue.shift() || {};
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

  private getParticipantsInName(): IParticipantsInName {
    const participantsInName: IParticipantsInName = {};
    const uniqueParticipants: IUniqueParticipant[] = <IUniqueParticipant[]>this.SearchService.getStorage(SearchStorage.UNIQUE_PARTICIPANTS);
    const joinMeetingTimes: IJoinTime[] = <IJoinTime[]>this.SearchService.getStorage(SearchStorage.JOIN_MEETING_TIMES);

    _.forEach(uniqueParticipants, (uniqueParticipant: IUniqueParticipant) => {
      const userName = uniqueParticipant.userName;
      const session: ISessionInReport = this.mkSessionInReport(uniqueParticipant);

      _.forEach(uniqueParticipant.participants, (participant) => {
        const joinMeetingRecord: IJoinMeetingRecord = this.mkJoinMeetingRecord(participant, joinMeetingTimes, session);
        session['Join Meeting Records'].push(joinMeetingRecord);
      });

      if (!participantsInName.hasOwnProperty(userName)) {
        participantsInName[userName] = {
          'User Id': uniqueParticipant.userId,
          Sessions: [session],
        };
      } else {
        const participantInRpt: IParticipantInReport = participantsInName[userName];
        participantInRpt.Sessions.push(session);
      }
    });

    return participantsInName;
  }

  private mkSessionInReport(uniqueParticipant: IUniqueParticipant): ISessionInReport {
    const session: ISessionInReport = {
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

    return session;
  }

  private mkJoinMeetingRecord(participant, joinMeetingTimes, session): IJoinMeetingRecord {
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

    const mediaReport = this.generateMediaReport(session['Session Type'], nodeId);
    if (mediaReport) {
      joinMeetingRecord.Media = mediaReport;
    }
    return joinMeetingRecord;
  }

  private getFeatures(): IFeaturesInReport {
    const webexOneMeeting: any = this.SearchService.getStorage(SearchStorage.WEBEX_ONE_MEETING);
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

  private generateMediaReport(sessionType: string, nodeId: string): IMediaInReport {
    const mediaReport: IMediaInReport = {};
    if (!nodeId) {
      return {};
    }
    if (sessionType === Platforms.PSTN) {
      const pstnSessionDetail = <ISessionDetail>this.SearchService.getStorage(SearchStorage.PSTN_SESSION_DETAIL);
      if (pstnSessionDetail) {
        mediaReport[MediaType.PSTN] = this.buildSpecificMediaReport(pstnSessionDetail, nodeId, MediaType.PSTN);
      }
    } else {
      const voipSessionDetail = <ISessionDetail>this.SearchService.getStorage(SearchStorage.VOIP_SESSION_DETAIL);
      const videoSessionDetail = <ISessionDetail>this.SearchService.getStorage(SearchStorage.VIDEO_SESSION_DETAIL);
      if (voipSessionDetail) {
        mediaReport[MediaType.VoIP] = this.buildSpecificMediaReport(voipSessionDetail, nodeId, MediaType.VoIP);
      }
      if (videoSessionDetail) {
        mediaReport[MediaType.Video] = this.buildSpecificMediaReport(voipSessionDetail, nodeId, MediaType.Video);
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
