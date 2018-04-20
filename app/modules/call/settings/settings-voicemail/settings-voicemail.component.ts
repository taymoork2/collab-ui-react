import { IOption } from 'modules/huron/dialing/dialing.service';
import { IAvrilFeatures } from 'modules/call/avril';
import { PhoneNumberService } from 'modules/huron/phoneNumber';
import { VoicemailPilotNumber } from 'modules/call/locations/shared';

class VoicemailComponentCtrl implements ng.IComponentController {
  public features: IAvrilFeatures;
  public selectedNumber: IOption;
  public filterPlaceholder: string;
  public externalNumberOptions: IOption[];
  public dialPlanCountryCode: string;
  public companyVoicemailEnabled: boolean;
  public onNumberFilter: Function;
  public onChangeFn: Function;
  public avrilI1559: boolean = false;
  public isMessageEntitled: boolean = false;
  public localAvrilFeatures: IAvrilFeatures;
  public preferredLanguage: string;
  public nonePlaceholder: string;
  public placeholder: string;
  private noneOption: IOption;
  public voicemailPilotNumber: VoicemailPilotNumber;

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private PhoneNumberService: PhoneNumberService,
    private ServiceSetup,
    private Authinfo,
    private FeatureToggleService,
  ) {
    this.filterPlaceholder = this.$translate.instant('directoryNumberPanel.searchNumber');
    this.placeholder = this.$translate.instant('directoryNumberPanel.chooseNumber');
    this.nonePlaceholder = this.$translate.instant('directoryNumberPanel.none');
    this.noneOption = {
      label: this.nonePlaceholder,
      value: '',
    };
  }

  public $onInit(): void {
    this.FeatureToggleService.avrilI1559GetStatus().then((toggle) => {
      this.avrilI1559 = toggle;
    });
    this.isMessageEntitled = this.Authinfo.isMessageEntitled();
  }

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject<any> }): void {
    const {
      features,
      voicemailPilotNumber,
      externalNumberOptions,
      preferredLanguage,
    } = changes;

    if (features && features.currentValue) {
      this.localAvrilFeatures = _.clone(features.currentValue);
    }

    if (!_.isUndefined(voicemailPilotNumber)) {
      if (!_.isUndefined(voicemailPilotNumber.currentValue) && !_.isNull(voicemailPilotNumber.currentValue.number) && !voicemailPilotNumber.currentValue.generated) {
        this.localAvrilFeatures.VM2T = true;
        this.selectedNumber = this.setCurrentOption(_.get<string>(voicemailPilotNumber.currentValue, 'number'), this.externalNumberOptions);
      }
    }
    if (!_.isUndefined(externalNumberOptions)) {
      if (externalNumberOptions.currentValue && _.isArray(externalNumberOptions.currentValue)) {
        if (!_.isUndefined(this.selectedNumber) && !_.isEmpty(this.selectedNumber.value)) {
          this.externalNumberOptions.unshift(this.noneOption);
        } else if (externalNumberOptions.currentValue.length === 0) {
          this.selectedNumber = this.noneOption;
        }
      }
    }
    if (!_.isUndefined(preferredLanguage)) {
      this.preferredLanguage = preferredLanguage.currentValue;
    }
  }

  public onCompanyVoicemailNumberChanged(): void {
    this.onChange(_.get<string>(this.selectedNumber, 'value'), false, true);
  }

  public onVoicemailToPhoneChanged(): void {
    if (this.localAvrilFeatures.VM2T && !_.isUndefined(this.selectedNumber) && !_.isEmpty(this.selectedNumber.value)) {
      this.onChange(_.get<string>(this.selectedNumber, 'value'), false, true);
    } else {
      const pilotNumber = this.ServiceSetup.generateVoiceMailNumber(this.Authinfo.getOrgId(), this.dialPlanCountryCode);
      this.onChange(pilotNumber, true, true);
    }
  }

  public onVoicemailFeaturesChanged(): void {
    if (this.isVM2EChanged()) {
      this.localAvrilFeatures.VM2E_Transcript = this.localAvrilFeatures.VM2E && this.isLanguageEnglish();
      this.localAvrilFeatures.VM2E_Attachment = this.localAvrilFeatures.VM2E;
      this.localAvrilFeatures.VM2E_TLS = this.localAvrilFeatures.VM2E;
    }
    if (this.isVM2SChanged()) {
      this.localAvrilFeatures.VM2S_Transcript = this.localAvrilFeatures.VM2S && this.isLanguageEnglish();
      this.localAvrilFeatures.VM2S_Attachment = this.localAvrilFeatures.VM2S;
    }
    if (!this.isLanguageEnglish()) {
      this.localAvrilFeatures.VM2E_Transcript = this.localAvrilFeatures.VM2S_Transcript = false;
    }
    this.localAvrilFeatures.VMOTP = this.isMessageEntitled ? this.localAvrilFeatures.VMOTP : false;
    this.onCompanyVoicemailChange(true, false);
  }

  public isVM2EChanged(): boolean {
    return (_.isUndefined(this.features) || this.localAvrilFeatures.VM2E !== this.features.VM2E);
  }

  public isVM2SChanged(): boolean {
    return (this.localAvrilFeatures.VM2S !== this.features.VM2S);
  }

  public isLanguageEnglish(): boolean {
    return (this.preferredLanguage === 'en_US');
  }

  public onCompanyVoicemailChange(value: boolean, initFeatures: boolean = true): void {
    if (value) {
      let pilotNumber: string = '';
      if (initFeatures) {
        this.initVoicemailFeatures();
      }
      if (this.selectedNumber && this.selectedNumber.value) {
        this.onCompanyVoicemailNumberChanged();
      } else {
        pilotNumber = this.ServiceSetup.generateVoiceMailNumber(this.Authinfo.getOrgId(), this.dialPlanCountryCode);
        this.onChange(pilotNumber, true, value);
      }
    } else {
      this.initVoicemailFeatures();
      this.onChange(null, false, value);
    }
  }

  public initVoicemailFeatures() {
    if (!_.isUndefined(this.localAvrilFeatures)) {
      this.localAvrilFeatures.VM2T = this.isMessageEntitled && this.isLanguageEnglish() ? false : true;
      this.localAvrilFeatures.VM2E_Attachment = false;
      this.localAvrilFeatures.VM2S = this.isMessageEntitled ? true : false;
      this.localAvrilFeatures.VM2S_Attachment = this.isMessageEntitled ? true : false;
      this.localAvrilFeatures.VM2S_Transcript = this.isLanguageEnglish() && this.isMessageEntitled ? true : false;
      this.localAvrilFeatures.VMOTP = this.isLanguageEnglish() && this.isMessageEntitled ? true : false;
    }
  }

  public onChange(number: string | null, voicemailPilotNumberGenerated: boolean, companyVoicemailEnabled: boolean): void {
    const pilotNumber: VoicemailPilotNumber = new VoicemailPilotNumber();
    pilotNumber.number =  number;
    pilotNumber.generated = voicemailPilotNumberGenerated;
    this.onChangeFn({
      companyVoicemailEnabled: companyVoicemailEnabled,
      voicemailPilotNumber: number ? pilotNumber : null,
      features: this.localAvrilFeatures,
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

export class VoicemailComponent implements ng.IComponentOptions {
  public controller = VoicemailComponentCtrl;
  public template = require('modules/call/settings/settings-voicemail/settings-voicemail.component.html');
  public bindings = {
    features: '<',
    voicemailPilotNumber: '<',
    dialPlanCountryCode: '<',
    externalNumberOptions: '<',
    companyVoicemailEnabled: '<',
    preferredLanguage: '<',
    onChangeFn: '&',
    onNumberFilter: '&',
  };
}
