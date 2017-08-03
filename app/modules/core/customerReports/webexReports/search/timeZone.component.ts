import * as moment from 'moment';

class TimeZone implements ng.IComponentController {
  public timeZone: string;
  public selected: string;
  public options: String[];
  public onChangeFn: Function;
  public selectPlaceholder: string;

  /* @ngInject */
  public constructor(
    private $translate: ng.translate.ITranslateService,
  ) {
    this.selectPlaceholder = this.$translate.instant('trialModal.meeting.timeZonePlaceholder');
  }

  public $onInit() {
    this.getOptions();
    this.setSelected();
  }

  public onChangeTz(tz): void {
    const reg = /\s([\w\d\/\-_]{2,})\s--/;
    if (!reg.test(tz)) {
      return;
    }

    const arr = tz.match(reg);
    this.onChangeFn({ timeZone: arr[1] });
  }

  private setSelected(): void {
    if (this.timeZone) {
      this.selected = this.formateTz(this.timeZone);
      return;
    }

    this.selected = moment.tz.guess();
  }

  private getOptions(): void {
    const tzs = moment.tz.names();
    this.options = _.map(tzs, item => this.formateTz(item));
  }

  private formateTz(tz): string {
    const offset = moment().tz(tz).format('Z');
    const abbr = moment().tz(tz).format('z');
    return `(GMT ${offset}) ${tz} -- ${abbr}`;
  }
}

export class CustTimeZoneComponent implements ng.IComponentOptions {
  public controller = TimeZone;
  public bindings = { timeZone: '<', onChangeFn: '&' };
  public templateUrl = 'modules/core/customerReports/webexReports/search/timeZone.html';
}
