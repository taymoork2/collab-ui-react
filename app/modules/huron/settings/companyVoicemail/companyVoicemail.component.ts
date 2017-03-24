import { Site } from 'modules/huron/sites';
import { CustomerVoice } from 'modules/huron/customer';
import { IOption } from 'modules/huron/dialing/dialing.service';

class ComapnyVoicemailCtrl implements ng.IComponentController {
  public site: Site;
  public selectedNumber: IOption;
  public companyVoicemailEnabled: boolean;
  public externalVoicemailAccess: boolean;
  public voicemailToEmail: boolean;
  public missingDirectNumbers: boolean;
  public filterPlaceholder: string;
  public externalNumberOptions: Array<IOption>;
  public customerVoice: CustomerVoice;
  public onChangeFn: Function;
  public onVoicemailToEmailChangedFn: Function;
  public onNumberFilter: Function;

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private TelephoneNumberService,
    private ServiceSetup,
    private Authinfo,
  ) {
    this.filterPlaceholder = this.$translate.instant('directoryNumberPanel.searchNumber');
  }

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject }): void {
    const {
      externalNumberOptions,
      site,
   } = changes;

    if (externalNumberOptions) {
      if (externalNumberOptions.currentValue && _.isArray(externalNumberOptions.currentValue)) {
        if (externalNumberOptions.currentValue.length === 0) {
          this.missingDirectNumbers = true;
        } else {
          this.missingDirectNumbers = false;
        }
      }
    }

    if (site && site.currentValue) {
      if (!_.isUndefined(_.get(site.currentValue, 'voicemailPilotNumber')) &&
        _.get(site.currentValue, 'voicemailPilotNumberGenerated') === 'false') {
        this.externalVoicemailAccess = true;
        this.selectedNumber = this.setCurrentOption(_.get<string>(site.currentValue, 'voicemailPilotNumber'), this.externalNumberOptions);
      } else {
        this.externalVoicemailAccess = false;
      }
    }
  }

  public onCompanyVoicemailNumberChanged() {
    this.onChange(this.selectedNumber.value, 'false', true);
  }

  public onExternalVoicemailAccessChanged(): void {
    if (this.externalVoicemailAccess) {
      this.onChange(_.get<string>(this.selectedNumber, 'value'), 'false', true);
    } else {
      let pilotNumber = this.ServiceSetup.generateVoiceMailNumber(this.Authinfo.getOrgId(), this.customerVoice.dialPlanDetails.countryCode);
      this.onChange(pilotNumber, 'true', true);
    }
  }

  public onCompanyVoicemailChange(value: boolean): void {
    if (value) {
      let pilotNumber: string = '';
      if (this.selectedNumber && this.selectedNumber.value) {
        pilotNumber = this.selectedNumber.value;
        this.onChange(pilotNumber, 'false', value);
      } else {
        pilotNumber = this.ServiceSetup.generateVoiceMailNumber(this.Authinfo.getOrgId(), this.customerVoice.dialPlanDetails.countryCode);
        this.onChange(pilotNumber, 'true', value);
      }
    } else {
      this.onChange(null, null, value);
    }
  }

  public onChange(voicemailPilotNumber: string | null, voicemailPilotNumberGenerated: string | null, companyVoicemailEnabled: boolean) {
    this.onChangeFn({
      voicemailPilotNumber: voicemailPilotNumber,
      voicemailPilotNumberGenerated: voicemailPilotNumberGenerated,
      companyVoicemailEnabled: companyVoicemailEnabled,
    });
  }

  public onVoicemailToEmailChanged(): void {
    this.onVoicemailToEmailChangedFn({
      voicemailToEmail: _.clone(this.voicemailToEmail),
    });
  }

  public getNumbers(filter: string): void {
    this.onNumberFilter({
      filter: filter,
    });
  }

  private setCurrentOption(currentValue: string, existingOptions: Array<IOption>): IOption {
    let existingOption: IOption = _.find(existingOptions, { value: currentValue });
    if (!existingOption) {
      let currentExternalNumberOption: IOption = {
        value: currentValue,
        label: this.TelephoneNumberService.getDIDLabel(currentValue),
      };
      existingOptions.unshift(currentExternalNumberOption);
      return currentExternalNumberOption;
    } else {
      return existingOption;
    }
  }

}

export class CompanyVoicemailComponent implements ng.IComponentOptions {
  public controller = ComapnyVoicemailCtrl;
  public templateUrl = 'modules/huron/settings/companyVoicemail/companyVoicemail.html';
  public bindings = {
    site: '<',
    customerVoice: '<',
    companyVoicemailEnabled: '<',
    voicemailToEmail: '<',
    externalNumberOptions: '<',
    onVoicemailToEmailChangedFn: '&',
    onNumberFilter: '&',
    onChangeFn: '&',
  };
}
