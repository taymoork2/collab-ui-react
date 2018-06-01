import { ICallType, IJoinTime, IMeeting, IMeetingDetail, IServerTime, ISessionDetail, IParticipant, IUniqueParticipant } from './partner-search.interfaces';
import { CommonService } from './common.service';

export class CustomerSearchService {
  private url;
  public featureName: string = 'report.webex.diagnostic';
  /* @ngInject */
  constructor(
    private $http: ng.IHttpService,
    private CommonService: CommonService,
    private UrlConfig,
  ) {
    this.url = `${this.UrlConfig.getDiagnosticUrl()}`;
  }

  public getMeetings(data: { endDate: string, email: string, startDate: string, meetingNumber: string }): ng.IPromise<IMeetingDetail[]> {
    const url = `${this.url}v3/meetings`;
    return this.$http.post<IMeetingDetail[]>(url, data).then(this.CommonService.extractData);
  }

  public getMeetingDetail(conferenceID: string): ng.IPromise<IMeeting> {
    const url = `${this.url}v3/meetings/${conferenceID}/meeting-detail`;
    return this.$http.get<IMeeting>(url).then(this.CommonService.extractData);
  }

  public getUniqueParticipants(conferenceID: string): ng.IPromise<IUniqueParticipant[]> {
    const url = `${this.url}v3/meetings/${conferenceID}/unique-participants`;
    return this.$http.get<IUniqueParticipant[]>(url).then(this.CommonService.extractData);
  }

  public getParticipants(conferenceID: string): ng.IPromise<IParticipant[]> {
    const url = `${this.url}v3/meetings/${conferenceID}/participants`;
    return this.$http.get<IParticipant[]>(url).then(this.CommonService.extractData);
  }

  public getVoipSessionDetail(conferenceID: string, nodeID: string): ng.IPromise<ISessionDetail> {
    const url = `${this.url}v2/meetings/${conferenceID}/voip-session-detail`;
    return this.$http.post<ISessionDetail>(url, { nodeIds: nodeID }).then(this.CommonService.extractData);
  }

  public getVideoSessionDetail(conferenceID: string, nodeID: string): ng.IPromise<ISessionDetail> {
    const url = `${this.url}v2/meetings/${conferenceID}/video-session-detail`;
    return this.$http.post<ISessionDetail>(url, { nodeIds: nodeID }).then(this.CommonService.extractData);
  }

  public getPSTNSessionDetail(conferenceID: string, nodeID: string): ng.IPromise<ISessionDetail> {
    const url = `${this.url}v2/meetings/${conferenceID}/pstn-session-detail`;
    return this.$http.post<ISessionDetail>(url, { nodeIds: nodeID }).then(this.CommonService.extractData);
  }

  public getCMRSessionDetail(conferenceID: string, nodeID: string): ng.IPromise<ISessionDetail> {
    const url = `${this.url}v2/meetings/${conferenceID}/cmr-session-detail`;
    return this.$http.post<ISessionDetail>(url, { nodeIds: nodeID }).then(this.CommonService.extractData);
  }

  public getJoinMeetingTime(conferenceID: string): ng.IPromise<IJoinTime[]> {
    const url = `${this.url}v2/meetings/${conferenceID}/participants/join-meeting-time`;
    return this.$http.get<IJoinTime[]>(url).then(this.CommonService.extractData);
  }

  public getServerTime(): ng.IPromise<IServerTime> {
    const url = `${this.url}v2/server`;
    return this.$http.get<IServerTime>(url).then(this.CommonService.extractData);
  }

  public getRealDevice(conferenceID: string, nodeID: string): ng.IPromise<ICallType> {
    const url = `${this.url}v2/meetings/${conferenceID}/participants/${nodeID}/device`;
    return this.$http.get<ICallType>(url).then(this.CommonService.extractData);
  }
}
