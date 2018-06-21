import { ICallType, IJoinTime, IMeeting, IMeetingDetail, IServerTime, ISessionDetail, ISessionDetailItem, IParticipant, IUniqueParticipant } from './partner-search.interfaces';
import { WebexReportsUtilService } from './webex-reports-util.service';

export class PartnerSearchService {
  private url: string;
  public featureName = 'partnerReport.webex.diagnostic';

  /* @ngInject */
  constructor(
    private $http: ng.IHttpService,
    private UrlConfig,
    private WebexReportsUtilService: WebexReportsUtilService,
  ) {
    this.url = `${this.UrlConfig.getDiagnosticUrl()}`;
  }

  public getMeetings(data: { endDate: string, email: string, startDate: string, meetingNumber: string }): ng.IPromise<IMeetingDetail[]> {
    const url = `${this.url}v3/partner/meetings`;
    return this.$http.post<IMeetingDetail[]>(url, data).then(this.WebexReportsUtilService.extractData);
  }

  public getMeetingDetail(conferenceID: string): ng.IPromise<IMeeting> {
    const url = `${this.url}v3/partner/meetings/${conferenceID}/meeting-detail`;
    return this.$http.get<IMeeting>(url).then(this.WebexReportsUtilService.extractData);
  }

  public getUniqueParticipants(conferenceID: string): ng.IPromise<IUniqueParticipant[]> {
    const url = `${this.url}v3/partner/meetings/${conferenceID}/unique-participants`;
    return this.$http.get<IUniqueParticipant[]>(url).then(this.WebexReportsUtilService.extractData);
  }

  public getParticipants(conferenceID: string): ng.IPromise<IParticipant[]> {
    const url = `${this.url}v3/partner/meetings/${conferenceID}/participants`;
    return this.$http.get<IParticipant[]>(url).then(this.WebexReportsUtilService.extractData);
  }

  public getVoipSessionDetail(conferenceID: string, nodeID: string): ng.IPromise<ISessionDetail> {
    const url = `${this.url}v3/partner/meetings/${conferenceID}/voip-session-detail`;
    return this.$http.post<ISessionDetail>(url, { nodeIds: nodeID }).then(this.WebexReportsUtilService.extractData);
  }

  public getVideoSessionDetail(conferenceID: string, nodeID: string): ng.IPromise<ISessionDetail> {
    const url = `${this.url}v3/partner/meetings/${conferenceID}/video-session-detail`;
    return this.$http.post<ISessionDetail>(url, { nodeIds: nodeID }).then(this.WebexReportsUtilService.extractData);
  }

  public getPSTNSessionDetail(conferenceID: string, nodeID: string): ng.IPromise<ISessionDetail> {
    const url = `${this.url}v3/partner/meetings/${conferenceID}/pstn-session-detail`;
    return this.$http.post<ISessionDetail>(url, { nodeIds: nodeID }).then(this.WebexReportsUtilService.extractData);
  }

  public getCMRSessionDetail(conferenceID: string, nodeID: string): ng.IPromise<ISessionDetail> {
    const url = `${this.url}v3/partner/meetings/${conferenceID}/cmr-session-detail`;
    return this.$http.post<ISessionDetail>(url, { nodeIds: nodeID }).then(this.WebexReportsUtilService.extractData);
  }

  public getJoinMeetingTime(conferenceID: string): ng.IPromise<IJoinTime[]> {
    const url = `${this.url}v3/partner/meetings/${conferenceID}/participants/join-meeting-time`;
    return this.$http.get<IJoinTime[]>(url).then(this.WebexReportsUtilService.extractData);
  }

  public getServerTime(): ng.IPromise<IServerTime> {
    const url = `${this.url}v2/server`;
    return this.$http.get<IServerTime>(url).then(this.WebexReportsUtilService.extractData);
  }
  public getRealDevice(conferenceID: string, nodeID: string): ng.IPromise<ICallType> {
    const url = `${this.url}v3/partner/meetings/${conferenceID}/participants/${nodeID}/device`;
    return this.$http.get<ICallType>(url).then(this.WebexReportsUtilService.extractData);
  }

  public saveSessionDetailToStorage(sessionType: string, sessionDetail: ISessionDetailItem): void {
    const sessionDetailByNodeId = {};
    sessionDetailByNodeId[sessionDetail.key] = sessionDetail.items;
    const newDetail = _.assign(this.WebexReportsUtilService.getStorage(sessionType) || {}, sessionDetailByNodeId);
    this.WebexReportsUtilService.setStorage(sessionType, newDetail);
  }
}
