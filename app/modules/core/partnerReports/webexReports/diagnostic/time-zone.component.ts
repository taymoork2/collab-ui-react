import { PartnerSearchService } from './partner-search.service';

class TimeZone implements ng.IComponentController {
  public timeZone: string;
  public selected: string;
  public options: String[];
  public onChangeFn: Function;
  public selectPlaceholder: string;

  /* @ngInject */
  public constructor(
    private $translate: ng.translate.ITranslateService,
    private PartnerSearchService: PartnerSearchService,
  ) {
    this.selectPlaceholder = this.$translate.instant('trialModal.meeting.timeZonePlaceholder');
  }

  public $onInit(): void {
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
    this.selected = this.timeZone ? this.formateTz(this.timeZone) : this.PartnerSearchService.getGuess('');
  }

  private getOptions(): void {
    const tzs = this.PartnerSearchService.getNames('');
    this.options = _.map(tzs, (item: string) => this.formateTz(item));
  }

  private formateTz(tz: string): string {
    const offset = this.PartnerSearchService.getOffset(tz);
    return `(GMT ${offset}) ${tz}`;
  }
}

export class DgcTimeZoneComponent implements ng.IComponentOptions {
  public controller = TimeZone;
  public bindings = { timeZone: '<', onChangeFn: '&' };
  public template = require('modules/core/partnerReports/webexReports/diagnostic/time-zone.html');
}
