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

  public getMeetings(data) {
    const url = `${this.url}meetings`;
    return this.$http.post(url, data).then(this.extractData);
  }

  public getMeetingDetail(conferenceID) {
    const url = `${this.url}meetings/${conferenceID}/meeting-detail`;
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

  public getServerTime() {
    const url = `${this.url}server`;
    return this.$http.get(url).then(this.extractData);
  }

  public getStatus(num) {
    const statusArr = ['inProgress', 'ended'];
    return this.$translate.instant('webexReports.meetingStatus.' + statusArr[num - 1]);
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
    const timeZone = tz ? tz : moment.tz.guess();
    const offset = this.getOffset(timeZone);
    return moment.utc(date).utcOffset(offset).format('YYYY-MM-DD hh:mm:ss');
  }

  public getOffset(timeZone) {
    const tz = timeZone ? timeZone : moment.tz.guess();
    return moment().tz(tz).format('Z');
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

  public getDevice(obj) {
    let device = { icon: '', name: '' };
    if (obj.sessionType === '25' || obj.platform === '9') {
      return { icon: 'icon-phone', name: 'PSTN' };
    } else if (obj.platform === '10') {
      device = { icon: 'icon-devices', name: 'TP Device' };
    } else if (obj.browser === '2') {
      device = { icon: 'icon-application', name: 'Client' };
    } else if (_.includes(['7', '8', '11', '12', '13', '14'], obj.platform)) {
      device = { icon: 'icon-mobile-phone', name: 'Mobile' };
    } else if (_.parseInt(obj.platform) < 7) {
      device = { icon: 'icon-browser', name: 'Browser' };
    }
    return device;
  }

  public getDuration(duration) {
    if (!duration) {
      return '';
    }
    const hours = moment.duration(duration * 1000).get('hours');
    let minutes: any = moment.duration(duration * 1000).get('minutes');
    let seconds: any = moment.duration(duration * 1000).get('seconds');
    minutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
    seconds = seconds < 10 ? `0${seconds}` : `${seconds}`;

    return hours ? `${hours}:${minutes}:${seconds}` : `${minutes}:${seconds}`;
  }

  private extractData(response) {
    return _.get(response, 'data');
  }
}
