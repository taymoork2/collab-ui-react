import { IOption } from 'modules/huron/dialing/dialing.service';

class CompanyMediaOnHoldCtrl implements ng.IComponentController {
  public dateFormat: string;
  public selected: IOption;
  public dateFormatOptions: IOption[];
  public onChangeFn: Function;

  /* @ngInject */
  constructor() { }

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject }): void {
    const { dateFormat } = changes;
    if (dateFormat && dateFormat.currentValue) {
      this.selected = _.find(this.dateFormatOptions, { value: this.dateFormat });
    }
  }

  public onDateFormatChanged(): void {
    this.onChangeFn({
      dateFormat: _.get(this.selected, 'value'),
    });
  }
}

export class CompanyMediaOnHoldComponent implements ng.IComponentOptions {
  public controller = CompanyMediaOnHoldCtrl;
  public templateUrl = 'modules/huron/settings/companyMoh/companyMoh.html';
  public bindings = {
    dateFormat: '<',
    dateFormatOptions: '<',
    onChangeFn: '&',
  };
}
