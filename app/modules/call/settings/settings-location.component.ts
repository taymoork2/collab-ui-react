import { CallSettingsService, CallSettingsData } from 'modules/call/settings/shared';
import { Config } from 'modules/core/config/config';
import { VoicemailPilotNumber } from 'modules/call/locations/shared';
import { HuronSettingsOptionsService, HuronSettingsOptions } from 'modules/call/settings/shared';
import { CompanyNumber } from 'modules/call/settings/settings-company-caller-id';
import { IAvrilFeatures } from 'modules/call/avril';
import { IOption } from 'modules/huron/dialing/dialing.service';
import { Notification } from 'modules/core/notifications';
import { CustomerConfigService } from 'modules/call/shared/customer-config-ces/customerConfig.service';

// TODO: (jlowery) This component will eventually replace
// HuronSettingsComponent when multilocation goes GA.
class CallSettingsCtrl implements ng.IComponentController {

  public form: ng.IFormController;
  public callSettingsData: CallSettingsData;
  public showRegionAndVoicemail: boolean = false;
  public loading: boolean = false;
  public processing: boolean = false;
  public settingsOptions: HuronSettingsOptions = new HuronSettingsOptions();
  public showDialPlanChangedDialog: boolean = false;
  public showVoiceMailDisableDialog: boolean = false;
  public avrilI1559: boolean;
  public countryCode: string;
  public isHI1484: boolean = false;

  /* @ngInject */
  constructor(
    private CallSettingsService: CallSettingsService,
    private HuronSettingsOptionsService: HuronSettingsOptionsService,
    private $q: ng.IQService,
    private $translate: ng.translate.ITranslateService,
    private $state: ng.ui.IStateService,
    private Authinfo,
    private Config: Config,
    private ModalService,
    private Notification: Notification,
    private FeatureToggleService,
    private Orgservice,
    private CustomerConfigService: CustomerConfigService,
  ) { }

  public $onInit(): void {
    this.FeatureToggleService.supports(this.FeatureToggleService.features.hI1484)
    .then(isSupported => {
      this.isHI1484 = isSupported;
      this.Orgservice.getOrg(_.noop, null, { basicInfo: true }).then( response => {
        if (response.data.countryCode) {
          this.countryCode = response.data.countryCode;
        } else {
          this.countryCode = 'US';
        }
      });
    });
    this.showRegionAndVoicemail = this.Authinfo.getLicenses().filter(license => {
      return license.licenseType === this.Config.licenseTypes.COMMUNICATION;
    }).length > 0;
    this.FeatureToggleService.avrilI1559GetStatus().then((toggle) => {
      this.avrilI1559 = toggle;
    });
    this.loading = true;
    this.$q.resolve(this.initComponentData()).finally(() => this.loading = false);
  }

  private initComponentData() {
    return this.HuronSettingsOptionsService.getOptions()
      .then(settingsOptions => this.settingsOptions = settingsOptions)
      .then(() => {
        return this.CallSettingsService.get()
          .then(callSettings => this.callSettingsData = callSettings)
          .catch(error => this.Notification.processErrorResponse(error, 'serviceSetupModal.error.getSettings'));
      });
  }

  public onExtensionLengthChanged(extensionLength: number): void {
    this.callSettingsData.customerVoice.extensionLength = extensionLength;
    this.setShowDialPlanChangedDialogFlag();
    this.checkForChanges();
  }

  public onDecreaseExtensionLength(extensionLength: number): void {
    this.callSettingsData.customerVoice.extensionLength = extensionLength;
    this.setShowDialPlanChangedDialogFlag();
    this.checkForChanges();
  }

  public onExtensionLengthSaved(): void {
    this.$onInit();
  }

  public onRoutingPrefixLengthSaved(): void {
    this.$onInit();
  }

  public onCompanyCallerIdChanged(companyCallerId: CompanyNumber): void {
    this.callSettingsData.companyCallerId = companyCallerId;
    this.checkForChanges();
  }

  public onCompanyMohChanged(companyMoh: string): void {
    this.callSettingsData.companyMoh = companyMoh;
    this.checkForChanges();
  }

  public onCompanyVoicemailChanged(companyVoicemailEnabled: boolean, voicemailPilotNumber: VoicemailPilotNumber, features: IAvrilFeatures): void {
    _.set(this.callSettingsData.customer, 'hasVoicemailService', companyVoicemailEnabled);
    _.set(this.callSettingsData.defaultLocation, 'voicemailPilotNumber', voicemailPilotNumber);
    _.set(this.callSettingsData.avrilCustomer, 'features', features);
    this.setShowVoiceMailDisableDialogFlag();
    this.checkForChanges();
  }

  public onCompanyVoicemailFilter(filter: string): ng.IPromise<IOption[]> {
    return this.HuronSettingsOptionsService.loadCompanyVoicemailNumbers(filter)
      .then(numbers => this.settingsOptions.companyVoicemailOptions = numbers);
  }

  public save(): ng.IPromise<void> {
    this.processing = true;
    let showEnableVoicemailModal: boolean = false;
    if (this.isHI1484) {
      this.CustomerConfigService.createCompanyLevelCustomerConfig(this.callSettingsData.customerVoice.routingPrefixLength, this.callSettingsData.customerVoice.extensionLength, this.countryCode);
    }
    if (this.callSettingsData.customer.hasVoicemailService && !this.CallSettingsService.getOriginalConfig().customer.hasVoicemailService) {
      showEnableVoicemailModal = true;
    }
    return this.CallSettingsService.save(this.callSettingsData)
    .then(callSettingsData => {
      if (callSettingsData) {
        this.callSettingsData = callSettingsData;
      }
      this.Notification.success('serviceSetupModal.saveSuccess');
    }).finally(() => {
      this.processing = false;
      this.resetForm();
      if (showEnableVoicemailModal) {
        this.$state.go('users.enableVoicemail');
      }
    });
  }

  public showSaveDialogs(): void {
    if (this.showDialPlanChangedDialog && this.showVoiceMailDisableDialog) {
      this.openDialPlanChangeDialog()
        .then(() => this.openDisableVoicemailWarningDialog()
        .then(() => this.save()));
    } else if (this.showDialPlanChangedDialog) {
      this.openDialPlanChangeDialog()
        .then(() => this.save());
    } else if (this.showVoiceMailDisableDialog) {
      this.openDisableVoicemailWarningDialog()
        .then(() => this.save());
    } else {
      this.save();
    }
  }

  public openDialPlanChangeDialog() {
    return this.ModalService.open({
      title: this.$translate.instant('serviceSetupModal.saveModal.title'),
      message: this.$translate.instant('serviceSetupModal.saveModal.message1') + '<br/><br/>'
        + this.$translate.instant('serviceSetupModal.saveModal.message2'),
      close: this.$translate.instant('common.yes'),
      dismiss: this.$translate.instant('common.no'),
    }).result;
  }

  public openDisableVoicemailWarningDialog() {
    return this.ModalService.open({
      title: this.$translate.instant('huronSettings.disableCompanyVoicemailTitle'),
      message: this.$translate.instant('huronSettings.disableCompanyVoicemailMessage'),
      close: this.$translate.instant('common.disable'),
      dismiss: this.$translate.instant('common.cancel'),
      btnType: 'negative',
    }).result;
  }

  private setShowDialPlanChangedDialogFlag(): void {
    const originalConfig = this.CallSettingsService.getOriginalConfig();
    if (this.callSettingsData.customerVoice.extensionLength !== originalConfig.customerVoice.extensionLength
      || this.callSettingsData.customerVoice.routingPrefixLength !== originalConfig.customerVoice.routingPrefixLength) {
      this.showDialPlanChangedDialog = true;
    } else {
      this.showDialPlanChangedDialog = false;
    }
  }

  private setShowVoiceMailDisableDialogFlag(): void {
    if (!this.callSettingsData.customer.hasVoicemailService &&
      this.callSettingsData.customer.hasVoicemailService !== this.CallSettingsService.getOriginalConfig().customer.hasVoicemailService) {
      this.showVoiceMailDisableDialog = true;
    } else {
      this.showVoiceMailDisableDialog = false;
    }
  }

  public checkForChanges(): void {
    if (this.CallSettingsService.matchesOriginalConfig(this.callSettingsData)) {
      this.resetForm();
    }
  }

  public onCancel(): void {
    this.callSettingsData = this.CallSettingsService.getOriginalConfig();
    this.resetForm();
  }

  private resetForm(): void {
    if (this.form) {
      this.form.$setPristine();
      this.form.$setUntouched();
    }
  }

}

export class CallSettingsComponent implements ng.IComponentOptions {
  public controller = CallSettingsCtrl;
  public template = require('modules/call/settings/settings-location.component.html');
  public bindings = {};
}
