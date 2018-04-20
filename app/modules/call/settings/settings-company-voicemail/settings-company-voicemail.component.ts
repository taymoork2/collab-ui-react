import { Site } from 'modules/huron/sites';
import { IOption } from 'modules/huron/dialing/dialing.service';
import { PhoneNumberService } from 'modules/huron/phoneNumber';

class CompanyVoicemailCtrl implements ng.IComponentController {
  public site: Site;
  public selectedNumber: IOption;
  public companyVoicemailEnabled: boolean;
  public externalVoicemailAccess: boolean;
  public voicemailToEmail: boolean;
  public missingDirectNumbers: boolean;
  public filterPlaceholder: string;
  public externalNumberOptions: IOption[];
  public dialPlanCountryCode: string;
  public onChangeFn: Function;
  public onVoicemailToEmailChangedFn: Function;
  public onNumberFilter: Function;

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private PhoneNumberService: PhoneNumberService,
    private ServiceSetup,
    private Authinfo,
  ) {
    this.filterPlaceholder = this.$translate.instant('directoryNumberPanel.searchNumber');
  }

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject<any> }): void {
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
      if (_.get(site.currentValue, 'voicemailPilotNumber') &&
        _.get(site.currentValue, 'voicemailPilotNumberGenerated') === false) {
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
      const pilotNumber = this.ServiceSetup.generateVoiceMailNumber(this.Authinfo.getOrgId(), this.dialPlanCountryCode);
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
        pilotNumber = this.ServiceSetup.generateVoiceMailNumber(this.Authinfo.getOrgId(), this.dialPlanCountryCode);
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

  private setCurrentOption(currentValue: string, existingOptions: IOption[]): IOption {
    const existingOption: IOption = _.find(existingOptions, { value: currentValue });
    if (!existingOption) {
      const currentExternalNumberOption: IOption = {
        value: currentValue,
        label: this.PhoneNumberService.getNationalFormat(currentValue),
      };
      existingOptions.unshift(currentExternalNumberOption);
      return currentExternalNumberOption;
    } else {
      return existingOption;
    }
  }

}

export class CompanyVoicemailComponent implements ng.IComponentOptions {
  public controller = CompanyVoicemailCtrl;
  public template = require('modules/call/settings/settings-company-voicemail/settings-company-voicemail.component.html');
  public bindings = {
    site: '<',
    dialPlanCountryCode: '<',
    companyVoicemailEnabled: '<',
    voicemailToEmail: '<',
    externalNumberOptions: '<',
    onVoicemailToEmailChangedFn: '&',
    onNumberFilter: '&',
    onChangeFn: '&',
  };
}
