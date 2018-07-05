import { Config } from 'modules/core/config/config';
import { Notification } from 'modules/core/notifications';
import { ServiceDescriptorService } from 'modules/hercules/services/service-descriptor.service';

interface ISipForm extends ng.IFormController {
  sipDomainInput: ng.INgModelController;
}

export class SipDomainSettingController {
  public showSaveButton: boolean;

  public isSubdomainLoading = false;
  public saving = false;
  public domainSuffix = '';
  public isRoomLicensed = false;
  public isSSAReserved = false;
  public sipForm = false;
  public verified = false;
  public subdomainCount = 0;
  public form: ISipForm;
  public messages = {
    invalidSubdomain: this.$translate.instant('firstTimeWizard.subdomainInvalid'),
    maxlength: this.$translate.instant('firstTimeWizard.longSubdomain'),
    required: this.$translate.instant('firstTimeWizard.required'),
    subdomainUnavailable: this.$translate.instant('firstTimeWizard.subdomainUnavailable'),
  };
  public inputValue = '';

  private currentDisplayName: string;
  private isCsc = false;

  private readonly ACTIVATE_SAVE_BUTTONS: string = 'settings-control-activate-footer';
  private readonly REMOVE_SAVE_BUTTONS: string = 'settings-control-remove-footer';
  private readonly SAVE_BROADCAST: string = 'settings-control-save';
  private readonly CANCEL_BROADCAST: string = 'settings-control-cancel';
  private readonly WIZARD_BROADCAST: string = 'wizard-enterprise-sip-url-event';
  private readonly WIZARD_EMIT: string = 'wizard-enterprise-sip-save';
  private readonly DISMISS_BROADCAST: string = 'DISMISS_SIP_NOTIFICATION';
  private readonly DISMISS_DISABLE: string = 'wizardNextButtonDisable';
  private readonly WIZARD_NEXT_LOADING: string = 'wizardNextButtonLoading';

  /* @ngInject */
  constructor(
    private $element: ng.IRootElementService,
    private $modal,
    private $rootScope: ng.IRootScopeService,
    private $scope: ng.IScope,
    private $timeout: ng.ITimeoutService,
    private $translate: ng.translate.ITranslateService,
    private $window: ng.IWindowService,
    private Config: Config,
    private Notification: Notification,
    private Orgservice,
    private ServiceDescriptorService: ServiceDescriptorService,
    private SparkDomainManagementService,
    private UrlConfig,
  ) {}

  public $onInit() {
    this.$scope.$emit(this.DISMISS_DISABLE, true);
    this.domainSuffix = this.UrlConfig.getSparkDomainCheckUrl();
    this.subdomainCount++;
    this.checkRoomLicense();

    const onSaveEventDeregister = this.$scope.$on(this.WIZARD_BROADCAST, (): void => {
      if (this.inputValue === this.currentDisplayName) {
        this.$rootScope.$emit(this.WIZARD_EMIT);
      } else if (this.isSSAReserved) {
        this.$timeout(() => this.updateSubdomain());
      } else {
        this.$timeout(() => this.saveSubdomain());
      }
    });
    this.$scope.$on('$destroy', onSaveEventDeregister);

    this.ServiceDescriptorService.isServiceEnabled('squared-fusion-ec').then((enabled: boolean): void => {
      this.isCsc = enabled;
    });

    const onSettingsSaveEventDeregister = this.$rootScope.$on(this.SAVE_BROADCAST, (): void => {
      this.updateSubdomain();
    });

    const onSettingsCancelEventDeregister = this.$rootScope.$on(this.CANCEL_BROADCAST, (): void => {
      this.toggleSipForm();
    });

    this.$scope.$on('$destroy', onSettingsSaveEventDeregister);
    this.$scope.$on('$destroy', onSettingsCancelEventDeregister);
    this.loadSubdomains();
  }

  public resetFocus() {
    this.$timeout(() => { this.$element.find('#editSubdomainLink').focus(); });
  }

  public editSubdomain() {
    if (!this.isCsc) {
      this.toggleSipForm();
      this.$timeout(() => { this.$element.find('#sipDomainInput').focus(); });
    }
  }

  public emptyOrUnchangedInput(): boolean {
    return this.inputValue === '' || _.isUndefined(this.inputValue) || _.isNull(this.inputValue) || this.inputValue === this.currentDisplayName;
  }

  public notVerified(): void {
    this.verified = false;
    this.$scope.$emit(this.DISMISS_DISABLE, true);
  }

  public openSipHelpWiki() {
    this.$window.open('https://collaborationhelp.cisco.com/article/en-us/DOC-7763', '_blank');
  }

  public toggleSipForm(): void {
    this.sipForm = !this.sipForm;
    this.inputValue = this.currentDisplayName;
    this.resetForm();
    this.verified = false;
    if (this.isSSAReserved) {
      this.$scope.$emit(this.DISMISS_DISABLE, false);
      this.$rootScope.$broadcast(this.REMOVE_SAVE_BUTTONS);
    } else {
      this.$scope.$emit(this.DISMISS_DISABLE, true);
    }
  }

  public verifyAvailabilityAndValidity(): void {
    this.isSubdomainLoading = true;
    this.SparkDomainManagementService.checkDomainAvailability(this.inputValue)
      .then((response) => {
        this.resetErrors();
        this.notVerified();
        if (response.data.isDomainAvailable) {
          this.verified = true;
          this.$scope.$emit(this.DISMISS_DISABLE, false);
          this.$rootScope.$broadcast(this.ACTIVATE_SAVE_BUTTONS);
        } else if (!response.data.isDomainAvailable && this.form) {
          this.form.sipDomainInput.$setValidity('subdomainUnavailable', false);
        }
      })
      .catch((response) => {
        this.notVerified();
        if (response.status === 400) {
          this.resetErrors();
          this.form.sipDomainInput.$setValidity('invalidSubdomain', false);
        } else {
          this.errorResponse(response);
        }
      })
      .finally(() => {
        this.isSubdomainLoading = false;
      });
  }

  private saveSubdomain(): void {
    this.saving = true;
    this.$scope.$emit(this.WIZARD_NEXT_LOADING, true);
    this.SparkDomainManagementService.addSipDomain(this.inputValue).then((response: any): void => {
      this.verified = false;
      if (response.data.isDomainReserved) {
        this.sipForm = false;
        this.currentDisplayName = this.inputValue;
        this.resetForm();
        if (this.isSSAReserved && this.showSaveButton) {
          this.Notification.success('firstTimeWizard.subdomainSaveSuccess');
          this.$rootScope.$broadcast(this.DISMISS_BROADCAST);
        }
      } else {
        this.Notification.error('firstTimeWizard.subdomainSaveError');
      }
      this.saving = false;
    }).catch((response) => {
      this.saving = false;
      if (response.status === 502) {
        this.Notification.errorWithTrackingId(response, 'firstTimeWizard.subdomainSaveError');
      } else {
        this.errorResponse(response);
      }
    }).finally(() => {
      this.$scope.$emit(this.WIZARD_NEXT_LOADING, false);
      this.$rootScope.$emit(this.WIZARD_EMIT);
    });
  }

  private updateSubdomain(): void {
    this.saving = true;
    this.$modal.open({
      template: require('modules/core/settings/sipDomain/updateSipDomainWarning.tpl.html'),
      type: 'dialog',
    }).result.then((): void => {
      this.saveSubdomain();
    }).catch((): void => {
      this.$rootScope.$broadcast(this.ACTIVATE_SAVE_BUTTONS);
      this.saving = false;
    });
  }

  private checkRoomLicense() {
    this.Orgservice.getLicensesUsage().then((response) => {
      this.isRoomLicensed = _.some(response, function (subscription) {
        const licenses = _.get(subscription, 'licenses');
        return _.some(licenses, function (license) {
          return _.get(license, 'offerName') === 'SD' || _.get(license, 'offerName') === 'SB';
        });
      });
      if (this.isRoomLicensed) {
        this.subdomainCount++;
      }
    });
  }

  private errorResponse(error: any): void {
    if (error.status === 401 || error.status === 403) {
      this.Notification.errorWithTrackingId(error, 'firstTimeWizard.subdomain401And403Error');
    } else {
      this.Notification.errorWithTrackingId(error, 'firstTimeWizard.sparkDomainManagementServiceErrorMessage');
    }
  }

  private resetErrors(): void {
    if (_.get(this, 'form.sipDomainInput', false)) {
      this.form.sipDomainInput.$setValidity('subdomainUnavailable', true);
      this.form.sipDomainInput.$setValidity('invalidSubdomain', true);
    }
  }

  private resetForm(): void {
    if (_.get(this, 'form.sipDomainInput', false)) {
      this.resetErrors();
      this.form.$setPristine();
      this.form.$setUntouched();
    }
  }

  private loadSubdomains() {
    const params = {
      basicInfo: true,
      disableCache: true,
    };
    this.Orgservice.getOrg(_.noop, false, params).then((response) => {
      let displayName = '';
      const sparkDomainStr = this.UrlConfig.getSparkDomainCheckUrl();
      const sipCloudDomain = _.get<string>(response.data, 'orgSettings.sipCloudDomain');
      if (sipCloudDomain) {
        displayName = sipCloudDomain.replace(sparkDomainStr, '');
        this.isSSAReserved = true;
        this.$scope.$emit(this.DISMISS_DISABLE, false);
      }
      this.inputValue = displayName;
      this.currentDisplayName = displayName;
    }).catch(response => {
      this.errorResponse(response);
      this.$scope.$emit(this.DISMISS_DISABLE, true);
    }).finally(() => {
      if (this.Config.isE2E()) {
        this.$scope.$emit(this.DISMISS_DISABLE, false);
      }
    });
  }
}
