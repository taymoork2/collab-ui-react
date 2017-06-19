import { Site } from 'modules/huron/sites';
import { CompanyNumber, ExternalCallerIdType } from 'modules/huron/settings/companyCallerId';
import { IOption } from 'modules/huron/dialing/dialing.service';
import { PhoneNumberService } from 'modules/huron/phoneNumber';
import { PstnModel } from 'modules/huron/pstn/pstn.model';

class CompanyCallerId implements ng.IComponentController {
  public site: Site;
  public companyCallerId: CompanyNumber;
  public selectedNumber: string;
  public customerName: string;
  public externalNumberOptions: IOption[];
  public onChangeFn: Function;
  public onNumberFilter: Function;
  public companyCallerIdEnabled: boolean;
  public filterPlaceholder: string;
  public countryCode: string;

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private PhoneNumberService: PhoneNumberService,
    private PstnModel: PstnModel,
  ) { }

  public $onInit(): void {
    this.filterPlaceholder = this.$translate.instant('directoryNumberPanel.searchNumber');
    this.countryCode = this.PstnModel.getCountryCode();
  }

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject }): void {
    const {
      companyCallerId,
      externalNumberOptions,
    } = changes;

    if (externalNumberOptions && externalNumberOptions.currentValue) {
      this.externalNumberOptions = _.filter<IOption>(externalNumberOptions.currentValue, externalNumber => {
        return !_.isEqual(_.get(externalNumber, 'value'), _.get(this.site, 'voicemailPilotNumber'));
      });
    }

    if (companyCallerId && companyCallerId.currentValue) {
      this.companyCallerIdEnabled = true;
      this.selectedNumber = this.PhoneNumberService.getNationalFormat(companyCallerId.currentValue.pattern);
    } else if (companyCallerId && !companyCallerId.currentValue) {
      this.companyCallerIdEnabled = false;
    }
  }

  public onCompanyCallerIdToggled(toggleValue: boolean): void {
    if (toggleValue) {
      this.selectedNumber = _.get<string>(this.externalNumberOptions, '[0].value');
      const companyNumber = new CompanyNumber({
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

  public onCompanyCallerIdNumberChanged(value): void {
    if (_.isObject(value)) {
      this.companyCallerId.pattern = this.PhoneNumberService.getE164Format(_.get<string>(value, 'value'));
    } else {
      this.companyCallerId.pattern = this.PhoneNumberService.getE164Format(value);
    }
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
    isLocation: '<',
    site: '<',
    customerName: '<',
    companyCallerId: '<',
    externalNumberOptions: '<',
    onNumberFilter: '&',
    onChangeFn: '&',
  };
}
