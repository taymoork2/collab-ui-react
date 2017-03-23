import { HuronSettingsService, HuronSettingsOptionsService, HuronSettingsOptions, HuronSettingsData, IEmergencyNumberOption } from 'modules/huron/settings';
import { Notification } from 'modules/core/notifications';
import { IExtensionRange } from 'modules/huron/settings/extensionRange';
import { CompanyNumber } from 'modules/huron/settings/companyCallerId';
import { IOption } from 'modules/huron/dialing/dialing.service';
import { EmergencyCallbackNumber } from 'modules/huron/sites';

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
  public errors: Array<string> = [];
  public voicemailTimeZone: IVoicemailTimeZone;
  public voicemailMessageAction;
  public voicemailToEmail;
  public showRegionAndVoicemail: boolean = false;
  public callDateTimeFormat: boolean = true;

  public huronSettingsData: HuronSettingsData;

  /* @ngInject */
  constructor(
    private HuronSettingsService: HuronSettingsService,
    private Notification: Notification,
    private $q: ng.IQService,
    private HuronSettingsOptionsService: HuronSettingsOptionsService,
    private $scope: ng.IScope,
    private $translate: ng.translate.ITranslateService,
    private ModalService,
    private PstnSetupService,
    private PstnSetup,
    private Authinfo,
    private Config,
    private Orgservice,
  ) { }

  public $onInit(): void {
    this.loading = true;

    this.showRegionAndVoicemail = this.Authinfo.getLicenses().filter(license => {
      return license.licenseType === this.Config.licenseTypes.COMMUNICATION;
    }).length > 0;

    let params = {
      basicInfo: true,
    };
    this.Orgservice.getOrg(data => {
      if (data.countryCode) {
        this.PstnSetup.setCountryCode(data.countryCode);
      }
    }, null, params);


    this.PstnSetupService.getCustomer(this.Authinfo.getOrgId()).then(() => {
      this.isTerminusCustomer = true;
    });

    this.PstnSetupService.listCustomerCarriers(this.Authinfo.getOrgId()).then(carriers => {
      if (_.get(carriers, '[0].apiImplementation') !== API_IMPL_SWIVEL) {
        this.PstnSetup.setProvider(_.get(carriers, '[0]'));
        this.showEmergencyServiceAddress = true;
      }
    });

    this.$q.resolve(this.initSettingsComponent()).finally( () => this.loading = false);

    this.$scope.$watch(() => {
      return _.get(this.form, '$invalid');
    }, (invalid) => {
      this.$scope.$emit('wizardNextButtonDisable', !!invalid);
    });

    this.$scope.$watch(() => {
      return this.loading;
    }, (loading) => {
      this.$scope.$emit('wizardNextButtonDisable', !!loading);
    });
  }

  private initSettingsComponent(): ng.IPromise<any> {
    return this.HuronSettingsOptionsService.getOptions().then(options => this.settingsOptions = options)
    .then( () => {
      return this.HuronSettingsService.get(this.siteId).then(huronSettingsData => this.huronSettingsData = huronSettingsData);
    });
  }

  // This is the hook to call save from ftsw.
  public initNext(): ng.IPromise<void> {
    return this.saveHuronSettings();
  }

  public saveHuronSettings(): ng.IPromise<void> {
    this.processing = true;
    return this.HuronSettingsService.save(this.huronSettingsData).then(huronSettingsData => {
      this.huronSettingsData = huronSettingsData;
      this.Notification.success('serviceSetupModal.saveSuccess');
    }).finally( () => {
      this.processing = false;
      this.resetForm();
    });
  }

  public openDialPlanChangeModal() {
    return this.ModalService.open({
      title: this.$translate.instant('serviceSetupModal.saveModal.title'),
      message: this.$translate.instant('serviceSetupModal.saveModal.message1') + '<br/><br/>'
        + this.$translate.instant('serviceSetupModal.saveModal.message2'),
      close: this.$translate.instant('common.yes'),
      dismiss: this.$translate.instant('common.no'),
    })
      .result.then(() => this.saveHuronSettings());
  }

  public onTimeZoneChanged(timeZone: string): void {
    this.huronSettingsData.site.timeZone = timeZone;
    this.checkForChanges();
  }

  public onPreferredLanguageChanged(preferredLanguage: string): void {
    this.huronSettingsData.site.preferredLanguage = preferredLanguage;
    this.checkForChanges();
  }

  public onExtensionLengthChanged(extensionLength: string): void {
    this.huronSettingsData.site.extensionLength = extensionLength;
    this.checkForChanges();
  }

  public onSteeringDigitChanged(steeringDigit: string): void {
    this.huronSettingsData.site.steeringDigit = steeringDigit;
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
    this.checkForChanges();
  }

  public onExtensionRangeChanged(extensionRanges: Array<IExtensionRange>): void {
    this.huronSettingsData.internalNumberRanges = extensionRanges;
    this.checkForChanges();
  }

  public onRegionCodeChanged(regionCode: string): void {
    this.huronSettingsData.customerVoice.regionCode = regionCode;
    this.checkForChanges();
  }

  public onCompanyVoicemailChanged(voicemailPilotNumber: string, voicemailPilotNumberGenerated: string, companyVoicemailEnabled: boolean): void {
    _.set(this.huronSettingsData.customer, 'hasVoicemailService', companyVoicemailEnabled);
    if (!companyVoicemailEnabled) {
      this.huronSettingsData.site.disableVoicemail = true;
    }
    this.huronSettingsData.site.voicemailPilotNumber = voicemailPilotNumber;
    this.huronSettingsData.site.voicemailPilotNumberGenerated = voicemailPilotNumberGenerated;
    this.checkForChanges();
  }

  public onVoicemailToEmailChanged(voicemailToEmail: boolean) {
    _.set(this.huronSettingsData.voicemailToEmailSettings, 'voicemailToEmail', voicemailToEmail);
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

  public onCompanyCallerIdFilter(filter: string): ng.IPromise<Array<IOption>> {
    return this.HuronSettingsOptionsService.loadCompanyCallerIdNumbers(filter)
      .then(numbers => this.settingsOptions.companyCallerIdOptions = numbers);
  }

  public onCompanyVoicemailFilter(filter: string): ng.IPromise<Array<IOption>> {
    return this.HuronSettingsOptionsService.loadCompanyVoicemailNumbers(filter)
      .then(numbers => this.settingsOptions.companyVoicemailOptions = numbers);
  }

  public onEmergencyServiceNumberFilter(filter: string): ng.IPromise<Array<IEmergencyNumberOption>> {
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
    this.form.$setPristine();
    this.form.$setUntouched();
  }

}

export class HuronSettingsComponent implements ng.IComponentOptions {
  public controller = HuronSettingsCtrl;
  public templateUrl = 'modules/huron/settings/settings.html';
  public bindings = {
    ftsw: '<',
  };
}
