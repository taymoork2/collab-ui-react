import { HuronSettingsService, HuronSettingsOptionsService, HuronSettingsOptions, HuronSettingsData, IEmergencyNumberOption } from 'modules/call/settings/shared';
import { Notification } from 'modules/core/notifications';
import { InternalNumberRange } from 'modules/call/shared/internal-number-range';
import { CompanyNumber } from 'modules/call/settings/settings-company-caller-id';
import { IOption } from 'modules/huron/dialing/dialing.service';
import { EmergencyCallbackNumber } from 'modules/huron/sites';
import { PstnService } from 'modules/huron/pstn/pstn.service';
import { PstnModel } from 'modules/huron/pstn/pstn.model';
import { PstnCarrier } from 'modules/huron/pstn/pstnProviders/pstnCarrier';
import { IAvrilFeatures } from 'modules/call/avril';
import { SetupWizardService } from 'modules/core/setupWizard/setup-wizard.service';
import { Config } from 'modules/core/config/config';

const API_IMPL_SWIVEL = 'SWIVEL';

interface IVoicemailTimeZone {
  enum: string;
  objectId: string;
  timeZoneName: string;
}

class HuronSettingsCtrl implements ng.IComponentController {
  public ftsw: boolean;
  public siteId: string;
  public form: ng.IFormController;
  public settingsOptions: HuronSettingsOptions = new HuronSettingsOptions();

  public hasVoicemailService: boolean = false;
  public hasVoiceService: boolean = false;
  public isTerminusCustomer: boolean = false;
  public loading: boolean = false;
  public processing: boolean = false;
  public showEmergencyServiceAddress: boolean = false;
  public errors: string[] = [];
  public voicemailTimeZone: IVoicemailTimeZone;
  public voicemailMessageAction;
  public voicemailToEmail;
  public showRegionAndVoicemail: boolean = false;
  public callDateTimeFormat: boolean = true;
  public showDialPlanChangedDialog: boolean = false;
  public showVoiceMailDisableDialog: boolean = false;
  public supportsAvrilVoicemail: boolean = false;
  public supportsAvrilVoicemailMailbox: boolean = false;
  public hI1484: boolean;
  public hasPendingCallLicenses: boolean = false;
  public avrilI1559: boolean = false;
  public huronSettingsData: HuronSettingsData;

  /* @ngInject */
  constructor(
    private HuronSettingsService: HuronSettingsService,
    private Notification: Notification,
    private $q: ng.IQService,
    private HuronSettingsOptionsService: HuronSettingsOptionsService,
    private $scope: ng.IScope,
    private $translate: ng.translate.ITranslateService,
    private $state: ng.ui.IStateService,
    private ModalService,
    private PstnService: PstnService,
    private PstnModel: PstnModel,
    private Authinfo,
    private Config: Config,
    private Orgservice,
    private FeatureToggleService,
    private SetupWizardService: SetupWizardService,
  ) { }

  public $onInit(): void {
    this.loading = true;

    this.hasPendingCallLicenses = this.SetupWizardService.hasPendingCallLicenses();

    this.showRegionAndVoicemail = this.Authinfo.getLicenses().filter(license => {
      return license.licenseType === this.Config.licenseTypes.COMMUNICATION;
    }).length > 0 || this.hasPendingCallLicenses;

    const params = {
      basicInfo: true,
    };
    this.Orgservice.getOrg(data => {
      if (data.countryCode) {
        this.PstnModel.setCountryCode(data.countryCode);
      }
    }, null, params);

    this.PstnService.getCustomer(this.Authinfo.getOrgId()).then(() => {
      this.isTerminusCustomer = true;
    });

    this.PstnService.listCustomerCarriers(this.Authinfo.getOrgId()).then(carriers => {
      if (_.get(carriers, '[0].apiImplementation') !== API_IMPL_SWIVEL) {
        this.PstnModel.setProvider(<PstnCarrier>_.get(carriers, '[0]'));
        this.showEmergencyServiceAddress = true;
      }
    });

    this.loadFeatureToggles();
    this.$q.resolve(this.initSettingsComponent()).finally(() => this.loading = false);

    if (this.ftsw) {
      this.$scope.$watch(() => {
        return _.get(this.form, '$invalid');
      }, invalid => {
        this.$scope.$emit('wizardNextButtonDisable', !!invalid);
      });

      this.$scope.$watch(() => {
        return this.loading;
      }, loading => {
        this.$scope.$emit('wizardNextButtonDisable', !!loading);
      });
    }
  }

  private initSettingsComponent(): ng.IPromise<any> {
    return this.HuronSettingsOptionsService.getOptions().then(options => this.settingsOptions = options)
      .then(() => {
        return this.HuronSettingsService.get(this.siteId).then(huronSettingsData => this.huronSettingsData = huronSettingsData);
      });
  }

  private loadFeatureToggles(): ng.IPromise<any> {
    this.FeatureToggleService.supports(this.FeatureToggleService.features.avrilVmEnable)
      .then(result => this.supportsAvrilVoicemail = result);

    this.FeatureToggleService.supports(this.FeatureToggleService.features.avrilVmMailboxEnable)
      .then(result => this.supportsAvrilVoicemailMailbox = result);

    this.FeatureToggleService.supports(this.FeatureToggleService.features.hI1484)
      .then(result => this.hI1484 = result);

    this.FeatureToggleService.avrilI1559GetStatus()
      .then(result => this.avrilI1559 = result);

    return this.$q.resolve();
  }

  public setupCallSiteNext(): ng.IPromise<void> | void {
    if (this.hasPendingCallLicenses) {
      this.SetupWizardService.addProvisioningCallbacks({
        call: this.saveHuronSettings.bind(this),
      });
    } else {
      // TODO: samwi - remove when super onboard goes GA
      return this.saveHuronSettings();
    }
  }

  public saveHuronSettings(): ng.IPromise<void> {
    this.processing = true;
    let showEnableVoicemailModal: boolean = false;
    if (this.huronSettingsData.customer.hasVoicemailService && !this.HuronSettingsService.getOriginalConfig().customer.hasVoicemailService) {
      showEnableVoicemailModal = true;
    }
    return this.HuronSettingsService.save(this.huronSettingsData)
      .then(huronSettingsData => {
        this.huronSettingsData = huronSettingsData;
        this.Notification.success('serviceSetupModal.saveSuccess');
      }).finally(() => {
        this.processing = false;
        this.resetForm();
        if (showEnableVoicemailModal && !this.ftsw) {
          this.$state.go('users.enableVoicemail');
        }
      });
  }

  public showSaveDialogs(): void {
    if (this.showDialPlanChangedDialog && this.showVoiceMailDisableDialog) {
      this.openDialPlanChangeDialog()
        .then(() => this.openDisableVoicemailWarningDialog()
          .then(() => this.saveHuronSettings()));
    } else if (this.showDialPlanChangedDialog) {
      this.openDialPlanChangeDialog()
        .then(() => this.saveHuronSettings());
    } else if (this.showVoiceMailDisableDialog) {
      this.openDisableVoicemailWarningDialog()
        .then(() => this.saveHuronSettings());
    } else {
      this.saveHuronSettings();
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

  public onTimeZoneChanged(timeZone: string): void {
    this.huronSettingsData.site.timeZone = timeZone;
    this.checkForChanges();
  }

  public onCompanyMohChanged(companyMoh: string): void {
    this.huronSettingsData.companyMoh = companyMoh;
    this.checkForChanges();
  }

  public onPreferredLanguageChanged(preferredLanguage: string): void {
    this.huronSettingsData.site.preferredLanguage = preferredLanguage;
    this.checkForChanges();
  }

  public onExtensionLengthChanged(extensionLength: number): void {
    this.huronSettingsData.site.extensionLength = extensionLength;
    this.setShowDialPlanChangedDialogFlag();
    this.checkForChanges();
  }

  public onDecreaseExtensionLength(extensionLength: number): void {
    this.huronSettingsData.internalNumberRanges = [];
    this.huronSettingsData.site.extensionLength = extensionLength;
    this.setShowDialPlanChangedDialogFlag();
    this.checkForChanges();
  }

  public onExtensionLengthSaved(): void {
    this.$onInit();
  }

  public onSteeringDigitChanged(steeringDigit: string): void {
    this.huronSettingsData.site.steeringDigit = steeringDigit;
    this.setShowDialPlanChangedDialogFlag();
    this.checkForChanges();
  }

  public onTimeFormatChanged(timeFormat: string): void {
    this.huronSettingsData.site.timeFormat = timeFormat;
    this.checkForChanges();
  }

  public onDateFormatChanged(dateFormat: string): void {
    this.huronSettingsData.site.dateFormat = dateFormat;
    this.checkForChanges();
  }

  public onDefaultCountryChanged(defaultCountry: string): void {
    this.huronSettingsData.site.country = defaultCountry;
    this.checkForChanges();
  }

  public onRoutingPrefixChanged(routingPrefix: string): void {
    this.huronSettingsData.site.routingPrefix = routingPrefix;
    this.setShowDialPlanChangedDialogFlag();
    this.checkForChanges();
  }

  public onExtensionRangeChanged(extensionRanges: InternalNumberRange[]): void {
    this.huronSettingsData.internalNumberRanges = extensionRanges;
    this.checkForChanges();
  }

  public onRegionCodeChanged(regionCode: string, useSimplifiedNationalDialing: boolean): void {
    _.set(this.huronSettingsData.site.regionCodeDialing, 'regionCode', regionCode);
    _.set(this.huronSettingsData.site.regionCodeDialing, 'useSimplifiedNationalDialing', useSimplifiedNationalDialing);
    this.setShowDialPlanChangedDialogFlag();
    this.checkForChanges();
  }

  public onCompanyVoicemailChanged(voicemailPilotNumber: string, voicemailPilotNumberGenerated: boolean, companyVoicemailEnabled: boolean): void {
    _.set(this.huronSettingsData.customer, 'hasVoicemailService', companyVoicemailEnabled);
    if (!companyVoicemailEnabled) {
      this.huronSettingsData.site.disableVoicemail = true;
    } else {
      delete this.huronSettingsData.site['disableVoicemail'];
    }
    this.huronSettingsData.site.voicemailPilotNumber = voicemailPilotNumber;
    this.huronSettingsData.site.voicemailPilotNumberGenerated = voicemailPilotNumberGenerated;
    this.setShowVoiceMailDisableDialogFlag();
    this.checkForChanges();
  }

  public onCompanyVoicemailAvrilChanged(voicemailPilotNumber: string, voicemailPilotNumberGenerated: boolean, companyVoicemailEnabled: boolean, features: IAvrilFeatures) {
    _.set(this.huronSettingsData.customer, 'hasVoicemailService', companyVoicemailEnabled);
    if (!companyVoicemailEnabled) {
      this.huronSettingsData.site.disableVoicemail = true;
    } else {
      delete this.huronSettingsData.site['disableVoicemail'];
    }
    this.huronSettingsData.site.voicemailPilotNumber = voicemailPilotNumber;
    this.huronSettingsData.site.voicemailPilotNumberGenerated = voicemailPilotNumberGenerated;
    this.huronSettingsData.avrilFeatures = features;
    if (this.avrilI1559 && companyVoicemailEnabled) {
      if (!this.huronSettingsData.avrilFeatures.VM2T && !this.huronSettingsData.avrilFeatures.VM2S) {
        this.resetForm();
      }
    }
    this.setShowVoiceMailDisableDialogFlag();
    this.checkForChanges();
  }

  public onVoicemailToEmailChanged(voicemailToEmail: boolean) {
    _.set(this.huronSettingsData, 'voicemailToEmailSettings.voicemailToEmail', voicemailToEmail);
    this.checkForChanges();
  }

  public onCustomerCosRestrictionsChanged(restrictions): void {
    this.huronSettingsData.cosRestrictions = restrictions;
    this.checkForChanges();
  }

  public onEmergencyServiceNumberChanged(emergencyCallbackNumber: EmergencyCallbackNumber): void {
    this.huronSettingsData.site.emergencyCallBackNumber = emergencyCallbackNumber;
    this.checkForChanges();
  }

  public onCompanyCallerIdChanged(companyCallerId: CompanyNumber): void {
    this.huronSettingsData.companyCallerId = companyCallerId;
    this.checkForChanges();
  }

  public onExtTransferChanged(externalTransferAllowed: boolean): void {
    this.huronSettingsData.site.allowExternalTransfer = externalTransferAllowed;
    this.checkForChanges();
  }

  public onCompanyCallerIdFilter(filter: string): ng.IPromise<IOption[]> {
    return this.HuronSettingsOptionsService.loadCompanyCallerIdNumbers(filter)
      .then(numbers => this.settingsOptions.companyCallerIdOptions = numbers);
  }

  public onCompanyVoicemailFilter(filter: string): ng.IPromise<IOption[]> {
    return this.HuronSettingsOptionsService.loadCompanyVoicemailNumbers(filter)
      .then(numbers => this.settingsOptions.companyVoicemailOptions = numbers);
  }

  public onEmergencyServiceNumberFilter(filter: string): ng.IPromise<IEmergencyNumberOption[]> {
    return this.HuronSettingsOptionsService.loadEmergencyServiceNumbers(filter)
      .then(numbers => this.settingsOptions.emergencyServiceNumberOptions = numbers);
  }

  public checkForChanges(): void {
    if (this.HuronSettingsService.matchesOriginalConfig(this.huronSettingsData)) {
      this.resetForm();
    }
  }

  public onCancel(): void {
    this.huronSettingsData = this.HuronSettingsService.getOriginalConfig();
    this.resetForm();
  }

  private resetForm(): void {
    this.showDialPlanChangedDialog = false;
    this.showVoiceMailDisableDialog = false;
    if (this.form) {
      this.form.$setPristine();
      this.form.$setUntouched();
    }
  }

  private setShowDialPlanChangedDialogFlag(): void {
    const originalConfig = this.HuronSettingsService.getOriginalConfig();
    if (this.huronSettingsData.site.extensionLength !== originalConfig.site.extensionLength
      || this.huronSettingsData.site.steeringDigit !== originalConfig.site.steeringDigit
      || this.huronSettingsData.site.routingPrefix !== originalConfig.site.routingPrefix
      || this.huronSettingsData.site.regionCodeDialing !== originalConfig.site.regionCodeDialing) {
      this.showDialPlanChangedDialog = true;
    } else {
      this.showDialPlanChangedDialog = false;
    }
  }

  private setShowVoiceMailDisableDialogFlag(): void {
    if (!this.huronSettingsData.customer.hasVoicemailService &&
      this.huronSettingsData.customer.hasVoicemailService !== this.HuronSettingsService.getOriginalConfig().customer.hasVoicemailService) {
      this.showVoiceMailDisableDialog = true;
    } else {
      this.showVoiceMailDisableDialog = false;
    }
  }

}

export class HuronSettingsComponent implements ng.IComponentOptions {
  public controller = HuronSettingsCtrl;
  public template = require('modules/call/settings/settings.component.html');
  public bindings = {
    ftsw: '<',
  };
}
