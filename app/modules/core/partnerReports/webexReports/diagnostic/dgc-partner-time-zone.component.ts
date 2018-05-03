import { PartnerSearchService } from './partner-search.service';

class TimeZoneController implements ng.IComponentController {
  private readonly GMT_REGEX = /\(GMT\s[+-01]{2}\d:[\d]{2}\)\s([\w\d\/\-_]{2,})/;
  public timeZone: string;
  public selected: string;
  public options: string[];
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

  public onChangeTz(tz: string): void {
    const timeZones = this.getTimeZone(tz);
    if (!_.isEmpty(timeZones)) {
      this.onChangeFn({ timeZone: timeZones[1] });
    }
  }

  private getTimeZone(tz: string): string[] {
    if (!this.hasGmtPrefix(tz)) {
      return [];
    }
    const timeZones = tz.match(this.GMT_REGEX);
    return timeZones ? timeZones : [];
  }

  private hasGmtPrefix(tz: string): boolean {
    return this.GMT_REGEX.test(tz);
  }

  private setSelected(): void {
    this.selected = this.timeZone ? this.formatTz(this.timeZone) : this.PartnerSearchService.getGuess('');
  }

  private getOptions(): void {
    const tzs = this.PartnerSearchService.getNames('');
    this.options = _.map(tzs, (tz: string) => this.formatTz(tz));
  }

  private formatTz(tz: string): string {
    const offset = this.PartnerSearchService.getOffset(tz);
    return `(GMT ${offset}) ${tz}`;
  }
}

export class DgcPartnerTimeZoneComponent implements ng.IComponentOptions {
  public controller = TimeZoneController;
  public template = require('modules/core/partnerReports/webexReports/diagnostic/dgc-partner-time-zone.html');
  public bindings = { timeZone: '<', onChangeFn: '&' };
}
