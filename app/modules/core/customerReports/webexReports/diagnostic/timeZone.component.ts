import { SearchService } from './searchService';

class TimeZone implements ng.IComponentController {
  public timeZone: string;
  public selected: string;
  public options: String[];
  public onChangeFn: Function;
  public selectPlaceholder: string;

  /* @ngInject */
  public constructor(
    private SearchService: SearchService,
    private $translate: ng.translate.ITranslateService,
  ) {
    this.selectPlaceholder = this.$translate.instant('trialModal.meeting.timeZonePlaceholder');
  }

  public $onInit() {
    this.getOptions();
    this.setSelected();
  }

  public onChangeTz(tz): void {
    const reg = /\(GMT\s[+-01]{2}\d:[\d]{2}\)\s([\w\d\/\-_]{2,})/;
    if (!reg.test(tz)) {
      return;
    }

    const arr = tz.match(reg);
    this.onChangeFn({ timeZone: arr[1] });
  }

  private setSelected(): void {
    this.selected = this.timeZone ? this.formateTz(this.timeZone) : this.SearchService.getGuess('');
  }

  private getOptions(): void {
    const tzs = this.SearchService.getNames('');
    this.options = _.map(tzs, item => this.formateTz(item));
  }

  private formateTz(tz): string {
    const offset = this.SearchService.getOffset(tz);
    return `(GMT ${offset}) ${tz}`;
  }
}

export class DgcTimeZoneComponent implements ng.IComponentOptions {
  public controller = TimeZone;
  public bindings = { timeZone: '<', onChangeFn: '&' };
  public template = require('modules/core/customerReports/webexReports/diagnostic/timeZone.html');
}
