import { IOption } from 'modules/huron/dialing/dialing.service';

class HuronTimeFormatCtrl implements ng.IComponentController {
  public timeFormat: string;
  public selected: IOption;
  public timeFormatOptions: Array<IOption>;
  public onChangeFn: Function;

  /* @ngInject */
  constructor() {}

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject }): void {
    const { timeFormat } = changes;
    if (timeFormat && timeFormat.currentValue) {
      this.selected = _.find(this.timeFormatOptions, { value: this.timeFormat });
    }
  }

  public onTimeFormatChanged(): void {
    this.onChangeFn({
      timeFormat: _.get(this.selected, 'value'),
    });
  }
}

export class HuronTimeFormatComponent implements ng.IComponentOptions {
  public controller = HuronTimeFormatCtrl;
  public templateUrl = 'modules/huron/settings/timeFormat/timeFormat.html';
  public bindings = {
    timeFormat: '<',
    timeFormatOptions: '<',
    onChangeFn: '&',
  };
}
