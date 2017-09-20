import { IOption } from 'modules/huron/dialing/dialing.service';

class HuronTimeFormatCtrl implements ng.IComponentController {
  public timeFormat: string;
  public selected: IOption;
  public timeFormatOptions: IOption[];
  public onChangeFn: Function;

  /* @ngInject */
  constructor() {}

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject<any> }): void {
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
  public template = require('modules/call/settings/settings-time-format/settings-time-format.component.html');
  public bindings = {
    timeFormat: '<',
    timeFormatOptions: '<',
    onChangeFn: '&',
  };
}
