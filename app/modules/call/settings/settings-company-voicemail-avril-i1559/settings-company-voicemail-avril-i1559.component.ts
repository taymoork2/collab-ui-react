import { Site } from 'modules/huron/sites';
import { IOption } from 'modules/huron/dialing/dialing.service';
import { IAvrilSiteFeatures } from 'modules/call/avril';
import { PhoneNumberService } from 'modules/huron/phoneNumber';

class CompanyVoicemailAvrilI1559ComponentCtrl implements ng.IComponentController {
  public site: Site;
  public features: IAvrilSiteFeatures;
  public selectedNumber: IOption;
  public filterPlaceholder: string;
  public externalNumberOptions: IOption[];
  public dialPlanCountryCode: string;
  public companyVoicemailEnabled: boolean;
  public voicemailToPhone: boolean;
  public onNumberFilter: Function;
  public onChangeFn: Function;
  public avrilI1558: boolean = false;
  public avrilI1559: boolean = false;
  public isMessageEntitled: boolean = false;
  public localAvrilFeatures: IAvrilSiteFeatures;
  public siteLanguage: string;
  public isFirstTime: boolean;
  public nonePlaceholder: string;
  public placeholder: string;
  private noneOption: IOption;
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
    this.FeatureToggleService.avrilI1558GetStatus().then((toggle) => {
      this.avrilI1558 = toggle;
    });
    this.FeatureToggleService.avrilI1559GetStatus().then((toggle) => {
      this.avrilI1559 = toggle;
    });
    this.isMessageEntitled = this.Authinfo.isMessageEntitled();
  }

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject<any> }): void {
    const {
      features,
      site,
      externalNumberOptions,
    } = changes;

    if (features && features.currentValue) {
      this.localAvrilFeatures = _.clone(features.currentValue);
    }

    if (site && site.currentValue) {
      if (_.get(site.currentValue, 'voicemailPilotNumber') &&
          _.get(site.currentValue, 'voicemailPilotNumberGenerated') === false) {
        this.localAvrilFeatures.VM2T = true;
        this.selectedNumber = this.setCurrentOption(_.get<string>(site.currentValue, 'voicemailPilotNumber'), this.externalNumberOptions);
      }
      this.siteLanguage = _.get<string>(site.currentValue, 'preferredLanguage');
    }
    if (externalNumberOptions) {
      if (externalNumberOptions.currentValue && _.isArray(externalNumberOptions.currentValue)) {
        if (!_.isUndefined(this.selectedNumber) && !_.isEmpty(this.selectedNumber.value)) {
          this.externalNumberOptions.unshift(this.noneOption);
        } else if (externalNumberOptions.currentValue.length === 0) {
          this.selectedNumber = this.noneOption;
        }
      }
    }
  }

  public onCompanyVoicemailNumberChanged(): void {
    this.onChange(_.get<string>(this.selectedNumber, 'value'), 'false', true);
  }

  public onVoicemailToPhoneChanged(): void {
    if (this.localAvrilFeatures.VM2T && !_.isUndefined(this.selectedNumber) && !_.isEmpty(this.selectedNumber.value)) {
      this.onChange(_.get<string>(this.selectedNumber, 'value'), 'false', true);
    } else {
      const pilotNumber = this.ServiceSetup.generateVoiceMailNumber(this.Authinfo.getOrgId(), this.dialPlanCountryCode);
      this.onChange(pilotNumber, 'true', true);
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
    return (this.localAvrilFeatures.VM2E !== this.features.VM2E);
  }

  public isVM2SChanged(): boolean {
    return (this.localAvrilFeatures.VM2S !== this.features.VM2S);
  }

  public isLanguageEnglish(): boolean {
    return (this.siteLanguage === 'en_US');
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
        this.onChange(pilotNumber, 'true', value);
      }
    } else {
      this.onChange(null, null, value);
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

  public onChange(voicemailPilotNumber: string | null, voicemailPilotNumberGenerated: string | null, companyVoicemailEnabled: boolean): void {
    this.onChangeFn({
      voicemailPilotNumber: voicemailPilotNumber,
      voicemailPilotNumberGenerated: voicemailPilotNumberGenerated,
      companyVoicemailEnabled: companyVoicemailEnabled,
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

export class CompanyVoicemailAvrilI1559Component implements ng.IComponentOptions {
  public controller = CompanyVoicemailAvrilI1559ComponentCtrl;
  public template = require('modules/call/settings/settings-company-voicemail-avril-i1559/settings-company-voicemail-avril-i1559.component.html');
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
