import { IAvrilCustomerFeatures } from 'modules/call/avril';
import { VoicemailPilotNumber } from 'modules/call/locations/shared';
import { PhoneNumberService } from 'modules/huron/phoneNumber';
import { IOption } from 'modules/huron/dialing';

const VM_TO_EMAIL_WITH_ATTACH: string = 'withAttachment';
const VM_TO_EMAIL_WITHOUT_ATTACH: string = 'withoutAttachment';

class LocationCompanyVoicemailCtrl implements ng.IComponentController {
  public ftsw: boolean;
  public features: IAvrilCustomerFeatures;
  public voicemailPilotNumber: VoicemailPilotNumber;
  public dialPlanCountryCode: string;
  public externalNumberOptions: IOption[];
  public companyVoicemailEnabled: boolean;
  public onNumberFilter: Function;
  public onChangeFn: Function;

  public externalVoicemailAccess: boolean;
  public selectedNumber: IOption | null;
  public attachmentPref: string;
  public missingDirectNumbers: boolean;
  public voicemailToEmail: boolean = false;
  public useTLS: boolean = true;
  public enableOTP: boolean = true;
  public avrilI1558: boolean = false;
  public isMessage: boolean = false;
  public missingDirectNumbersHelpText: string = '';

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private PhoneNumberService: PhoneNumberService,
    private ServiceSetup,
    private Authinfo,
    private FeatureToggleService,
  ) {}

  public $onInit(): void {
    this.FeatureToggleService.avrilI1558GetStatus().then((toggle) => {
      this.avrilI1558 = toggle;
    });
    this.isMessage = this.Authinfo.isMessageEntitled();
  }

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject<any> }): void {
    const {
      features,
      voicemailPilotNumber,
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

    if (voicemailPilotNumber) {
      if (!_.isUndefined(voicemailPilotNumber.currentValue) && !_.isNull(voicemailPilotNumber.currentValue) && !voicemailPilotNumber.currentValue.generated) {
        this.externalVoicemailAccess = true;
        this.selectedNumber = this.setCurrentOption(_.get(voicemailPilotNumber.currentValue, 'number'), this.externalNumberOptions);
      } else {
        this.externalVoicemailAccess = false;
        this.selectedNumber = null;
      }
    }

    if (features && features.currentValue) {
      this.voicemailToEmail = _.get<boolean>(features.currentValue, 'VM2E');
      this.attachmentPref = _.get<boolean>(features.currentValue, 'VM2E_Attachment') ? VM_TO_EMAIL_WITH_ATTACH : VM_TO_EMAIL_WITHOUT_ATTACH;
      if (this.voicemailToEmail) {
        this.useTLS = _.get<boolean>(features.currentValue, 'VM2E_TLS');
      }
      this.enableOTP = _.get<boolean>(features.currentValue, 'VMOTP');
    }
  }

  public onCompanyVoicemailChange(value: boolean, setOTP: boolean = true): void {
    if (value) {
      if (setOTP && this.isMessage && !_.isUndefined(this.features)) {
        this.enableOTP = this.features.VMOTP = true;
      }
      if (this.selectedNumber && this.selectedNumber.value) {
        this.onCompanyVoicemailNumberChanged();
      } else {
        const pilotNumber = this.ServiceSetup.generateVoiceMailNumber(this.Authinfo.getOrgId(), this.dialPlanCountryCode);
        this.onChange(value, new VoicemailPilotNumber({
          number: pilotNumber,
          generated: true,
        }));
      }
    } else {
      this.onChange(value, null);
    }
  }

  public onExternalVoicemailAccessChanged(): void {
    if (this.externalVoicemailAccess) {
      this.selectedNumber = this.externalNumberOptions[0];
      this.onChange(true, new VoicemailPilotNumber({
        number: this.selectedNumber.value,
        generated: false,
      }));
    } else {
      this.selectedNumber = null;
      this.onChange(true, new VoicemailPilotNumber({
        number: this.ServiceSetup.generateVoiceMailNumber(this.Authinfo.getOrgId(), this.dialPlanCountryCode),
        generated: true,
      }));
    }
  }

  public onCompanyVoicemailNumberChanged() {
    this.onChange(true, new VoicemailPilotNumber({
      number: _.get(this.selectedNumber, 'value'),
      generated: false,
    }));
  }

  public onVoicemailToEmailChanged(): void {
    if (this.voicemailToEmail) {
      this.features.VM2E = true;
      this.features.VM2E_Attachment = true;
      this.attachmentPref = VM_TO_EMAIL_WITH_ATTACH;
      this.features.VM2E_TLS = true;
      this.useTLS = true;
    } else {
      this.features.VM2E = false;
      this.features.VM2E_Attachment = false;
      this.attachmentPref = '';
      this.features.VM2E_TLS = false;
    }
    this.features.VMOTP = this.isMessage ? this.enableOTP : false;
    this.onCompanyVoicemailChange(true, false);
  }

  public onVoicemailToEmailPrefChanged(): void {
    if (this.attachmentPref === VM_TO_EMAIL_WITH_ATTACH) {
      this.features.VM2E = true;
      this.features.VM2E_Attachment = true;
    } else if (this.attachmentPref === VM_TO_EMAIL_WITHOUT_ATTACH) {
      this.features.VM2E = true;
      this.features.VM2E_Attachment = false;
    }
    this.onCompanyVoicemailChange(true, false);
  }

  public onUseTLS(): void {
    this.features.VM2E_TLS = !this.features.VM2E_TLS;
    this.onCompanyVoicemailChange(true, false);
  }

  public onEnableOTPChanged(): void {
    this.features.VMOTP = !this.features.VMOTP;
    this.onCompanyVoicemailChange(true, false);
  }

  public onChange(companyVoicemailEnabled: boolean, voicemailPilotNumber: VoicemailPilotNumber | null) {
    this.onChangeFn({
      companyVoicemailEnabled: companyVoicemailEnabled,
      voicemailPilotNumber: voicemailPilotNumber,
      features: this.features,
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

  public getNumbers(filter: string): void {
    this.onNumberFilter({
      filter: filter,
    });
  }
}

export class LocationCompanyVoicemailComponent implements ng.IComponentOptions {
  public controller = LocationCompanyVoicemailCtrl;
  public template = require('modules/call/settings/settings-company-voicemail-locations/settings-company-voicemail-locations.component.html');
  public bindings = {
    ftsw: '<',
    voicemailPilotNumber: '<',
    features: '<',
    dialPlanCountryCode: '<',
    externalNumberOptions: '<',
    companyVoicemailEnabled: '<',
    onNumberFilter: '&',
    onChangeFn: '&',
  };
}
