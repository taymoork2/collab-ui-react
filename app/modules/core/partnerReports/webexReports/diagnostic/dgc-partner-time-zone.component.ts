import { PartnerSearchService } from './partner-search.service';

class TimeZoneController implements ng.IComponentController {
  private readonly GMT_PREFIX_REGEX = /^\(GMT [+-]\d\d:\d\d\)/;
  private readonly TIME_ZONE_SUFFIX_REGEX = /[A-Z][a-z]+\/[A-Z][a-z]+$/;
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
    const timeZone = this.getTimeZone(tz);
    this.onChangeFn({ timeZone: timeZone });
  }

  private getTimeZone(tz: string): string | undefined {
    if (!this.hasGmtPrefix(tz) || !this.hasTimeZoneSuffix(tz)) {
      return;
    }
    const timeZones = tz.match(this.TIME_ZONE_SUFFIX_REGEX);
    return timeZones ? timeZones[0] : undefined;
  }

  private hasGmtPrefix(tz: string): boolean {
    return this.GMT_PREFIX_REGEX.test(tz);
  }

  private hasTimeZoneSuffix(tz: string): boolean {
    return this.TIME_ZONE_SUFFIX_REGEX.test(tz);
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
