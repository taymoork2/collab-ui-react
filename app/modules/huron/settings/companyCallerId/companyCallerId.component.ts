import { CompanyNumber, ExternalCallerIdType } from 'modules/huron/settings/companyCallerId';
import { IOption } from 'modules/huron/dialing/dialing.service';

class CompanyCallerId implements ng.IComponentController {
  public companyCallerId: CompanyNumber;
  public selectedNumber: string;
  public customerName: string;
  public externalNumbers: Array<IOption>;
  public onChangeFn: Function;
  public onNumberFilter: Function;
  public companyCallerIdEnabled: boolean;
  public filterPlaceholder: string;

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private TelephoneNumberService,
  ) { }

  public $onInit(): void {
    this.filterPlaceholder = this.$translate.instant('directoryNumberPanel.searchNumber');
  }

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject }): void {
    const { companyCallerId } = changes;

    if (companyCallerId && companyCallerId.currentValue) {
      this.companyCallerIdEnabled = true;
      this.selectedNumber = this.TelephoneNumberService.getDIDLabel(companyCallerId.currentValue.pattern);
    } else if (companyCallerId && !companyCallerId.currentValue) {
      this.companyCallerIdEnabled = false;
    }
  }

  public onCompanyCallerIdToggled(toggleValue: boolean): void {
    if (toggleValue) {
      this.selectedNumber = this.externalNumbers[0].value;
      let companyNumber = new CompanyNumber({
        name: this.customerName,
        pattern: this.selectedNumber,
        externalCallerIdType: ExternalCallerIdType.COMPANY_CALLER_ID_TYPE,
      });
      this.onChange(companyNumber);
    } else {
      this.onChange(undefined);
    }
  }

  public onCompanyCallerIdNameChanged(): void {
    this.onChange(this.companyCallerId);
  }

  public onCompanyCallerIdNumberChanged(): void {
    this.companyCallerId.pattern = _.get<string>(this.selectedNumber, 'value');
    this.onChange(this.companyCallerId);
  }

  public getNumbers(filter: string): void {
    this.onNumberFilter({
      filter: filter,
    });
  }

  public onChange(companyNumber: CompanyNumber | string | undefined): void {
    this.onChangeFn({
      companyCallerId: _.cloneDeep(companyNumber),
    });
  }

}

export class CompanyCallerIdComponent implements ng.IComponentOptions {
  public controller = CompanyCallerId;
  public templateUrl = 'modules/huron/settings/companyCallerId/companyCallerId.html';
  public bindings = {
    customerName: '<',
    companyCallerId: '<',
    externalNumbers: '<',
    onNumberFilter: '&',
    onChangeFn: '&',
  };
}
