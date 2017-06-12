import { Site } from 'modules/huron/sites';
import { IOption } from 'modules/huron/dialing/dialing.service';
import { IAvrilFeatures } from 'modules/huron/avril';
import { PhoneNumberService } from 'modules/huron/phoneNumber';

const VM_TO_SPARK: string = 'vmToSpark';
const VM_TO_PHONE: string = 'vmToPhone';
const VM_TO_SPARK_AND_PHONE: string = 'vmToSparkAndPhone';
const VM_TO_EMAIL_WITH_ATTACH: string = 'withAttachment';
const VM_TO_EMAIL_WITHOUT_ATTACH: string = 'withoutAttachment';

class CompanyVoicemailAvrilComponentCtrl implements ng.IComponentController {
  public site: Site;
  public features: IAvrilFeatures;
  public selectedNumber: IOption;
  public missingDirectNumbers: boolean;
  public filterPlaceholder: string;
  public externalNumberOptions: Array<IOption>;
  public dialPlanCountryCode: string;
  public companyVoicemailEnabled: boolean;
  public onNumberFilter: Function;
  public onChangeFn: Function;
  public companyVoicemailAvrilForm: ng.IFormController;
  public deliveryMethod: string;
  public attachmentPref: string;
  public voicemailToEmail: boolean = false;
  public missingDirectNumbersHelpText: string = '';

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private PhoneNumberService: PhoneNumberService,
    private ServiceSetup,
    private Authinfo,
  ) {
    this.filterPlaceholder = this.$translate.instant('directoryNumberPanel.searchNumber');
  }

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject }): void {
    const {
      features,
      site,
      externalNumberOptions,
    } = changes;

    if (externalNumberOptions) {
      if (externalNumberOptions.currentValue && _.isArray(externalNumberOptions.currentValue)) {
        if (externalNumberOptions.currentValue.length === 0) {
          this.missingDirectNumbers = true;
          this.missingDirectNumbersHelpText = this.$translate.instant('serviceSetupModal.voicemailNoDirectNumbersError');
        } else {
          this.missingDirectNumbers = false;
          this.missingDirectNumbersHelpText = '';
        }
      }
    }

    if (features && features.currentValue) {
      if (!_.get<boolean>(features.currentValue, 'VM2S') && _.get<boolean>(features.currentValue, 'VM2T')) {
        this.deliveryMethod = VM_TO_PHONE;
      } else if (_.get<boolean>(features.currentValue, 'VM2S') && _.get<boolean>(features.currentValue, 'VM2T')) {
        this.deliveryMethod = VM_TO_SPARK_AND_PHONE;
      } else if (_.get<boolean>(features.currentValue, 'VM2S')) {
        this.deliveryMethod = VM_TO_SPARK;
      }

      if (_.get<boolean>(features.currentValue, 'VM2E')) {
        this.voicemailToEmail = true;
        this.attachmentPref = VM_TO_EMAIL_WITH_ATTACH;
      } else if (_.get<boolean>(features.currentValue, 'VM2E_PT')) {
        this.voicemailToEmail = true;
        this.attachmentPref = VM_TO_EMAIL_WITHOUT_ATTACH;
      } else {
        this.voicemailToEmail = false;
        this.attachmentPref = '';
      }
    }

    if (site && site.currentValue) {
      if (!_.isUndefined(_.get(site.currentValue, 'voicemailPilotNumber')) && !_.get(site.currentValue, 'voicemailPilotNumberGenerated')) {
        this.selectedNumber = this.setCurrentOption(_.get<string>(site.currentValue, 'voicemailPilotNumber'), this.externalNumberOptions);
      }
    }
  }

  public onDeliveryMethodChanged(): void {
    if (this.deliveryMethod === VM_TO_SPARK) {
      this.features.VM2S = true;
      this.features.VM2T = false;
      let pilotNumber = this.ServiceSetup.generateVoiceMailNumber(this.Authinfo.getOrgId(), this.dialPlanCountryCode);
      this.onChange(pilotNumber, 'true', true);
    } else if (this.deliveryMethod === VM_TO_PHONE) {
      this.features.VM2S = false;
      this.features.VM2T = true;
      this.onCompanyVoicemailChange(true);
    } else if (this.deliveryMethod === VM_TO_SPARK_AND_PHONE) {
      this.features.VM2S = true;
      this.features.VM2T = true;
      this.onCompanyVoicemailChange(true);
    }
  }

  public onCompanyVoicemailNumberChanged(): void {
    this.onChange(this.selectedNumber.value, 'false', true);
  }

  public onVoicemailToEmailChanged(): void {
    if (this.voicemailToEmail) {
      this.features.VM2E = true;
      this.features.VM2E_PT = false;
      this.attachmentPref = VM_TO_EMAIL_WITH_ATTACH;
    } else {
      this.features.VM2E = false;
      this.features.VM2E_PT = false;
      this.attachmentPref = '';
    }
    this.onCompanyVoicemailChange(true);
  }

  public onVoicemailToEmailPrefChanged(): void {
    if (this.attachmentPref === VM_TO_EMAIL_WITH_ATTACH) {
      this.features.VM2E = true;
      this.features.VM2E_PT = false;
    } else if (this.attachmentPref === VM_TO_EMAIL_WITHOUT_ATTACH) {
      this.features.VM2E = false;
      this.features.VM2E_PT = true;
    }
    this.onCompanyVoicemailChange(true);
  }

  public onCompanyVoicemailChange(value: boolean): void {
    if (value) {
      let pilotNumber: string = '';
      if (this.selectedNumber && this.selectedNumber.value) {
        this.onCompanyVoicemailNumberChanged();
      } else {
        pilotNumber = this.ServiceSetup.generateVoiceMailNumber(this.Authinfo.getOrgId(), this.dialPlanCountryCode);
        this.onChange(pilotNumber, 'true', value);
      }
    } else {
      this.onChange(null, null, value);
    }
  }

  public onChange(voicemailPilotNumber: string | null, voicemailPilotNumberGenerated: string | null, companyVoicemailEnabled: boolean): void {
    this.onChangeFn({
      voicemailPilotNumber: voicemailPilotNumber,
      voicemailPilotNumberGenerated: voicemailPilotNumberGenerated,
      companyVoicemailEnabled: companyVoicemailEnabled,
      features: this.features,
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
        label: this.PhoneNumberService.getNationalFormat(currentValue),
      };
      existingOptions.unshift(currentExternalNumberOption);
      return currentExternalNumberOption;
    } else {
      return existingOption;
    }
  }

}

export class CompanyVoicemailAvrilComponent implements ng.IComponentOptions {
  public controller = CompanyVoicemailAvrilComponentCtrl;
  public templateUrl = 'modules/huron/settings/companyVoicemailAvril/companyVoicemailAvril.html';
  public bindings = {
    site: '<',
    features: '<',
    dialPlanCountryCode: '<',
    externalNumberOptions: '<',
    companyVoicemailEnabled: '<',
    onNumberFilter: '&',
    onChangeFn: '&',
  };
}
