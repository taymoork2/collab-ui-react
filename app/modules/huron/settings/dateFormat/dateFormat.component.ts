import { IOption } from 'modules/huron/dialing/dialing.service';

class HuronDateFormatCtrl implements ng.IComponentController {
  public dateFormat: string;
  public selected: IOption;
  public dateFormatOptions: Array<IOption>;
  public onChangeFn: Function;

  /* @ngInject */
  constructor() { }

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject }): void {
    let dateFormatChanges = changes['dateFormat'];
    if (dateFormatChanges && dateFormatChanges.currentValue) {
      this.selected = _.find(this.dateFormatOptions, { value: this.dateFormat });
    }
  }

  public onDateFormatChanged(): void {
    this.onChangeFn({
      dateFormat: _.get(this.selected, 'value'),
    });
  }
}

export class HuronDateFormatComponent implements ng.IComponentOptions {
  public controller = HuronDateFormatCtrl;
  public templateUrl = 'modules/huron/settings/dateFormat/dateFormat.html';
  public bindings = {
    dateFormat: '<',
    dateFormatOptions: '<',
    onChangeFn: '&',
  };
}
