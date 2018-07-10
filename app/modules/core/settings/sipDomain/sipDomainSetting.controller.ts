import { Config } from 'modules/core/config/config';
import { IToolkitModalService } from 'modules/core/modal';
import { Notification } from 'modules/core/notifications';
import { SipAddressModel } from 'modules/core/shared/sip-address/sip-address.model';
import { SipAddressService } from 'modules/core/shared/sip-address/sip-address.service';
import { ServiceDescriptorService } from 'modules/hercules/services/service-descriptor.service';

interface ISipForm extends ng.IFormController {
  sipDomainInput: ng.INgModelController;
}

export class SipDomainSettingController implements ng.IComponentController {
  public showSaveButton: boolean;

  public form: ISipForm;
  public isLoaded = false;
  public isSubdomainLoading = false;
  public isSaving = false;
  public isRoomLicensed = false;
  public isDomainReserved = false;
  public isDomainAvailable = false;
  public messages = {
    invalidSubdomain: this.$translate.instant('firstTimeWizard.subdomainInvalid'),
    maxlength: this.$translate.instant('firstTimeWizard.longSubdomain'),
    required: this.$translate.instant('firstTimeWizard.required'),
    subdomainUnavailable: this.$translate.instant('firstTimeWizard.subdomainUnavailable'),
  };
  public sipHelpLink = 'https://collaborationhelp.cisco.com/article/en-us/DOC-7763';
  public subdomainCount = 0;

  private isCsc = false;
  private isEditMode = false;
  private sipAddressModel?: SipAddressModel;
  private sipAddressModelOrig?: SipAddressModel;

  private readonly ACTIVATE_SAVE_BUTTONS = 'settings-control-activate-footer';
  private readonly REMOVE_SAVE_BUTTONS = 'settings-control-remove-footer';
  private readonly SAVE_BROADCAST = 'settings-control-save';
  private readonly CANCEL_BROADCAST = 'settings-control-cancel';
  private readonly WIZARD_BROADCAST = 'wizard-enterprise-sip-url-event';
  private readonly WIZARD_EMIT = 'wizard-enterprise-sip-save';
  private readonly DISMISS_BROADCAST = 'DISMISS_SIP_NOTIFICATION';
  private readonly DISMISS_DISABLE = 'wizardNextButtonDisable';
  private readonly WIZARD_NEXT_LOADING = 'wizardNextButtonLoading';

  /* @ngInject */
  constructor(
    private $element: ng.IRootElementService,
    private $modal: IToolkitModalService,
    private $rootScope: ng.IRootScopeService,
    private $scope: ng.IScope,
    private $timeout: ng.ITimeoutService,
    private $translate: ng.translate.ITranslateService,
    private Config: Config,
    private Notification: Notification,
    private Orgservice,
    private ServiceDescriptorService: ServiceDescriptorService,
    private SipAddressService: SipAddressService,
  ) {}

  public $onInit() {
    this.disableWizardButtons();
    this.subdomainCount++;
    this.checkRoomLicense();

    const onSaveEventDeregister = this.$scope.$on(this.WIZARD_BROADCAST, (): void => {
      if (this.subdomain === this.origSubdomain) {
        this.gotoNextWizardStep();
      } else if (this.isDomainReserved) {
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

  public resetFocus(): void {
    this.$timeout(() => this.$element.find('#editSubdomainLink').focus());
  }

  public editSubdomain(): void {
    if (!this.isCsc) {
      this.toggleSipForm();
      this.$timeout(() => this.$element.find('#sipDomainInput').focus());
    }
  }

  public cancel(): void {
    this.toggleSipForm();
    this.resetFocus();
  }

  public resetDomainAvailability(): void {
    this.isDomainAvailable = false;
    this.resetErrors();
    this.hideSettingsButtons();
    this.disableWizardButtons();
  }

  public toggleSipForm(): void {
    this.isEditMode = !this.isEditMode;
    if (this.sipAddressModelOrig) {
      this.sipAddressModel = _.cloneDeep(this.sipAddressModelOrig);
      this.sipAddressModel.reset();
    }
    this.resetForm();
    this.isDomainAvailable = false;
    if (this.isDomainReserved) {
      this.enableWizardButtons();
      this.hideSettingsButtons();
    } else {
      this.disableWizardButtons();
    }
  }

  public get isEmptyOrUnchangedInput(): boolean {
    return !this.subdomain || !this.sipAddressModel || !this.sipAddressModel.isChanged();
  }

  public get showModifyForm(): boolean {
    return this.isEditMode || !this.isDomainReserved;
  }

  public get showEditLink(): boolean {
    return !this.showModifyForm && !this.isCsc;
  }

  public get callFQDN(): string {
    return this.sipAddressModel ? this.sipAddressModel.callFQDN : '';
  }

  public get roomFQDN(): string {
    return this.sipAddressModel ? this.sipAddressModel.roomFQDN : '';
  }

  public get subdomain(): string {
    return this.sipAddressModel ? this.sipAddressModel.subdomain : '';
  }

  public set subdomain(value) {
    if (this.sipAddressModel) {
      this.sipAddressModel.subdomain = value;
    }
  }

  public get origSubdomain(): string {
    return this.sipAddressModelOrig ? this.sipAddressModelOrig.subdomain : '';
  }

  public verifyAvailabilityAndValidity(): void {
    this.isSubdomainLoading = true;
    this.resetDomainAvailability();
    this.SipAddressService.validateSipAddress(this.sipAddressModel!)
      .then((response) => {
        this.resetErrors();
        this.sipAddressModel = response.model;
        if (response.isDomainAvailable) {
          this.isDomainAvailable = true;
          this.enableWizardButtons();
          this.showSettingsButtons();
        } else if (response.isDomainInvalid && this.form) {
          this.form.sipDomainInput.$setValidity('invalidSubdomain', false);
        } else if (!response.isDomainAvailable && this.form) {
          this.form.sipDomainInput.$setValidity('subdomainUnavailable', false);
        }
      })
      .catch((response) => {
        this.errorResponse(response);
      })
      .finally(() => {
        this.isSubdomainLoading = false;
      });
  }

  private showSettingsButtons(): void {
    this.$scope.$emit(this.ACTIVATE_SAVE_BUTTONS);
  }

  private hideSettingsButtons(): void {
    this.$scope.$emit(this.REMOVE_SAVE_BUTTONS);
  }

  private disableWizardButtons(shouldDisable = true): void {
    this.$scope.$emit(this.DISMISS_DISABLE, shouldDisable);
  }

  private enableWizardButtons(): void {
    this.disableWizardButtons(false);
  }

  private dismissOverviewNotification(): void {
    this.$rootScope.$broadcast(this.DISMISS_BROADCAST);
  }

  private setWizardButtonLoading(isLoading: boolean): void {
    this.$scope.$emit(this.WIZARD_NEXT_LOADING, isLoading);
  }

  private gotoNextWizardStep(): void {
    this.$rootScope.$emit(this.WIZARD_EMIT);
  }

  private setIsSaving(isSaving: boolean): void {
    this.isSaving = isSaving;
    this.setWizardButtonLoading(isSaving);
  }

  private saveSubdomain(): void {
    this.setIsSaving(true);
    this.SipAddressService.saveSipAddress(this.sipAddressModel!).then(response => {
      this.isDomainAvailable = false;
      if (response.isDomainReserved) {
        this.resetForm();
        this.isDomainAvailable = true;
        this.isEditMode = false;
        this.sipAddressModel = response.model;
        this.sipAddressModelOrig = _.cloneDeep(response.model);
        if (this.showSaveButton) {
          this.Notification.success('firstTimeWizard.subdomainSaveSuccess');
          this.dismissOverviewNotification();
        }
      } else {
        this.Notification.error('firstTimeWizard.subdomainSaveError');
      }
    }).catch((response) => {
      if (response.status === 502) {
        this.Notification.errorWithTrackingId(response, 'firstTimeWizard.subdomainSaveError');
      } else {
        this.errorResponse(response);
      }
    }).finally(() => {
      this.setIsSaving(false);
      this.gotoNextWizardStep();
    });
  }

  private updateSubdomain(): void {
    this.setIsSaving(true);
    this.$modal.open({
      template: require('./updateSipDomainWarning.tpl.html'),
      type: 'dialog',
    }).result.then((): void => {
      this.saveSubdomain();
    }).catch((): void => {
      this.showSettingsButtons();
      this.setIsSaving(false);
    });
  }

  private checkRoomLicense(): void {
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

  private loadSubdomains(): void {
    this.SipAddressService.loadSipAddressModel()
      .then(sipAddressModel => {
        this.sipAddressModel = sipAddressModel;
        this.sipAddressModelOrig = _.cloneDeep(sipAddressModel);
        if (this.subdomain) {
          this.isDomainReserved = true;
          this.enableWizardButtons();
        }
      })
      .catch(response => {
        this.errorResponse(response);
        this.disableWizardButtons();
      })
      .finally(() => {
        this.isLoaded = true;
        if (this.Config.isE2E()) {
          this.enableWizardButtons();
        }
      });
  }
}
