export class WebexReportsService {
  private url;

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

  public getMeetings(data) {
    const url = this.url + 'meetings';
    return this.$http.post(url, data).then(this.extractData);
  }

  public getStatus(num) {
    const statusArr = ['inProcess', 'ended'];
    return this.$translate.instant('webexReports.meetingStatus.' + statusArr[num - 1]);
  }

  private extractData(response) {
    return _.get(response, 'data');
  }
}
