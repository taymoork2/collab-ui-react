import { IOption } from 'modules/huron/dialing/dialing.service';

class TimeZoneCtrl implements ng.IComponentController {
  public timeZone: string;
  public selected: IOption;
  public timeZoneOptions: Array<IOption>;
  public onChangeFn: Function;
  public timeZonePlaceholder: string;
  public filterPlaceholder: string;

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
  ) { }

  public $onInit(): void {
    this.timeZonePlaceholder = this.$translate.instant('serviceSetupModal.preferredLanguagePlaceholder');
    this.filterPlaceholder = this.$translate.instant('serviceSetupModal.searchTimeZone');
  }

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject }): void {
    let timeZoneChanges = changes['timeZone'];
    if (timeZoneChanges && timeZoneChanges.currentValue) {
      this.selected = _.find(this.timeZoneOptions, { id: this.timeZone });
    }
  }

  public onChangeTimeZone(): void {
    this.onChangeFn({
      timeZone: _.get(this.selected, 'id'),
    });
  }
}

export class TimeZoneComponent implements ng.IComponentOptions {
  public controller = TimeZoneCtrl;
  public templateUrl = 'modules/huron/settings/timeZone/timeZone.html';
  public bindings = {
    timeZone: '<',
    timeZoneOptions: '<',
    onChangeFn: '&',
  };
}
