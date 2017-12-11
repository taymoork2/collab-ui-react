export class SearchService {
  private url;
  private data: any = {};
  public featureName: string = 'report.webex.diagnostic';
  /* @ngInject */
  constructor(
    private UrlConfig,
    private $http: ng.IHttpService,
    private $translate: ng.translate.ITranslateService,
  ) {
    this.url = `${this.UrlConfig.getGeminiUrl()}`;
  }

  public getMeeting(conferenceID) {
    const url = `${this.url}meetings/${conferenceID}`;
    return this.$http.get(url).then(this.extractData);
  }

  public getMeetingDetail(conferenceID) {
    const url = `${this.url}meetings/${conferenceID}/meeting-detail`;
    return this.$http.get(url).then(this.extractData);
  }

  public getMeetings(data) {
    const url = `${this.url}meetings`;
    return this.$http.post(url, data).then(this.extractData);
  }

  public getMeetingSession(conferenceID) {
    const url = `${this.url}meetings/${conferenceID}/session`;
    return this.$http.get(url).then(this.extractData);
  }

  public getUniqueParticipants(conferenceID) {
    const url = `${this.url}meetings/${conferenceID}/unique-participants`;
    return this.$http.get(url).then(this.extractData);
  }

  public getParticipants(conferenceID) {
    const url = `${this.url}meetings/${conferenceID}/participants`;
    return this.$http.get(url).then(this.extractData);
  }

  public getQOS(conferenceID, nodeID, qosName) {
    const url = `${this.url}meetings/${conferenceID}/${qosName}?nodeIds=${nodeID}`;
    return this.$http.get(url).then(this.extractData);
  }

  public getJoinMeetingTime(conferenceID) {
    const url = `${this.url}meetings/${conferenceID}/participants/join-meeting-time`;
    return this.$http.get(url).then(this.extractData);
  }

  public getJoinMeetingQuality(conferenceID) {
    const url = `${this.url}meetings/${conferenceID}/participants/join-meeting-quality`;
    return this.$http.get(url).then(this.extractData);
  }

  public getParticipantDetailInfo(conferenceID, nodeId) {
    const url = `${this.url}meetings/${conferenceID}/node-ids/${nodeId}/call-legs`;
    return this.$http.get(url).then(this.extractData);
  }

  public getServerTime() {
    const url = `${this.url}server`;
    return this.$http.get(url).then(this.extractData);
  }

  public getStatus(num) {
    const statusArr = ['inProcess', 'ended'];
    return this.$translate.instant('webexReports.meetingStatus.' + statusArr[num - 1]);
  }

  private extractData(response) {
    return _.get(response, 'data');
  }

  public setStorage(key, val) {
    _.set(this.data, key, val);
    return this.data[key];
  }

  public getStorage(key) {
    return _.get(this.data, key);
  }

  public utcDateByTimezone(date) {
    if (!date) {
      return '';
    }
    const tz = this.getStorage('timeZone');
    const timeZone: any = tz ? tz : moment.tz.guess();
    const offset = this.getOffset(timeZone);
    return moment.utc(date).utcOffset(offset).format('MMMM Do, YYYY h:mm:ss A');
  }

  public getOffset(timeZone) {
    const tz = timeZone ? timeZone : moment.tz.guess();
    return timeZone === 'ut18' ? '' : moment().tz(tz).format('Z');
  }

  public getGuess(tz) {
    return tz ? '' : moment.tz.guess();
  }

  public getNames(tz) {
    return tz ? '' : moment.tz.names();
  }

  public timestampToDate(timestamp, format): string {
    const tz = this.getStorage('timeZone');
    const timeZone: any = tz ? tz : moment.tz.guess();
    const offset = this.getOffset(timeZone);
    return moment(timestamp).utc().utcOffset(offset).format(format);
  }

  public getBrowser(num) {
    const arr = ['Netscape', 'IE', 'Stand alone application', 'MOZILLA', 'FIREFOX', 'SAFARI', 'CHROME'];
    return arr[_.parseInt(num)] ? arr[_.parseInt(num)] : 'Other';
  }

  public getPlartform(obj): string {
    if (obj.sessionType === 25) {
      return 'PSTN';
    }
    const key = _.parseInt(obj.platform);
    const arr = ['Windows', 'MAC', 'Solaris', 'Java', 'Linux', 'Flash', 'Javascript', 'IPHONE', 'MOBILE DEVICE', 'IP PHONE', 'Cisco TP', 'BlackBerry', 'WinMobile', 'Android', 'Nokia'];
    return arr[key] ? arr[key] : 'Other';
  }

  public getParticipantEndReson(endReson) {
    if (endReson === null) {
      return '';
    }
    return endReson ? 'Normal' : 'Abnormal';
  }
}
