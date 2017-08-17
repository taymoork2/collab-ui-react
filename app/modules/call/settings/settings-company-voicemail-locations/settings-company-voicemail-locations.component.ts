import { IAvrilCustomerFeatures } from 'modules/huron/avril';

const VM_TO_EMAIL_WITH_ATTACH: string = 'withAttachment';
const VM_TO_EMAIL_WITHOUT_ATTACH: string = 'withoutAttachment';

class LocationCompanyVoicemailCtrl implements ng.IComponentController {
  public ftsw: boolean;
  public features: IAvrilCustomerFeatures;
  public companyVoicemailEnabled: boolean;
  public onChangeFn: Function;

  public attachmentPref: string;
  public voicemailToEmail: boolean = false;
  public useTLS: boolean = true;
  public enableOTP: boolean = true;
  public avrilI1558: boolean = false;
  public isMessage: boolean = false;

  /* @ngInject */
  constructor(
    private FeatureToggleService,
    private Authinfo,
  ) {}

  public $onInit(): void {
    this.FeatureToggleService.avrilI1558GetStatus().then((toggle) => {
      this.avrilI1558 = toggle;
    });
    this.isMessage = this.Authinfo.isMessageEntitled();
  }

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject<any> }): void {
    const { features } = changes;

    if (features && features.currentValue) {
      this.voicemailToEmail = _.get<boolean>(features.currentValue, 'VM2E');
      this.attachmentPref = _.get<boolean>(features.currentValue, 'VM2E_Attachment') ? VM_TO_EMAIL_WITH_ATTACH : VM_TO_EMAIL_WITHOUT_ATTACH;
      if (this.voicemailToEmail) {
        this.useTLS = _.get<boolean>(features.currentValue, 'VM2E_TLS');
      }
      this.enableOTP = _.get<boolean>(features.currentValue, 'VMOTP');
    }
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

  public onCompanyVoicemailChange(value: boolean, setOTP: boolean = true): void {
    if (value) {
      if (setOTP && this.isMessage) {
        this.enableOTP = this.features.VMOTP = true;
      }
    }
    this.onChange(value);
  }

  public onUseTLS(): void {
    this.features.VM2E_TLS = !this.features.VM2E_TLS;
    this.onCompanyVoicemailChange(true, false);
  }

  public onEnableOTPChanged(): void {
    this.features.VMOTP = !this.features.VMOTP;
    this.onCompanyVoicemailChange(true, false);
  }

  public onChange(companyVoicemailEnabled: boolean) {
    this.onChangeFn({
      companyVoicemailEnabled: companyVoicemailEnabled,
      features: this.features,
    });
  }
}

export class LocationCompanyVoicemailComponent implements ng.IComponentOptions {
  public controller = LocationCompanyVoicemailCtrl;
  public templateUrl = 'modules/call/settings/settings-company-voicemail-locations/settings-company-voicemail-locations.component.html';
  public bindings = {
    ftsw: '<',
    features: '<',
    companyVoicemailEnabled: '<',
    onChangeFn: '&',
  };
}
