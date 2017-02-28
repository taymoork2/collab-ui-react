import { Notification } from 'modules/core/notifications';

interface ISipForm extends ng.IFormController {
  sipDomainInput: ng.INgModelController;
}

export class SipDomainSettingController {
  public isError: boolean = false;
  private _validatedValue: string;
  public isDisabled: boolean = false;
  public isButtonDisabled: boolean = false;
  public isLoading: boolean = false;
  public isConfirmed: boolean = false;
  public errorMsg: string;

  public saving: boolean;
  public toggle: boolean;
  public showSaveButton: boolean;
  public currentDisplayName: string;
  public domainSuffix: string;
  public isRoomLicensed: boolean = false;
  public isSSAReserved: boolean = false;
  public sipForm: boolean = false;
  public verified: boolean = false;
  public subdomainCount: number = 0;
  public form: ISipForm;
  public messages = {
    invalidSubdomain: this.$translate.instant('firstTimeWizard.subdomainInvalid'),
    maxlength: this.$translate.instant('firstTimeWizard.longSubdomain'),
    required: this.$translate.instant('firstTimeWizard.required'),
    subdomainUnavailable: this.$translate.instant('firstTimeWizard.subdomainUnavailable'),
  };

  private isCsc: boolean = false;
  private _inputValue: string = '';

  private readonly ACTIVATE_SAVE_BUTTONS: string = 'settings-control-activate-footer';
  private readonly REMOVE_SAVE_BUTTONS: string = 'settings-control-remove-footer';
  private readonly SAVE_BROADCAST: string = 'settings-control-save';
  private readonly CANCEL_BROADCAST: string = 'settings-control-cancel';
  private readonly WIZARD_BROADCAST: string = 'wizard-enterprise-sip-url-event';
  private readonly DISMISS_BROADCAST: string = 'DISMISS_SIP_NOTIFICATION';
  private readonly DISMISS_DISABLE: string = 'wizardNextButtonDisable';

  /* @ngInject */
  constructor(
    private $scope: ng.IScope,
    private $rootScope: ng.IRootScopeService,
    private Notification: Notification,
    private FeatureToggleService,
    private Config,
    private Orgservice,
    private SparkDomainManagementService,
    private $translate: ng.translate.ITranslateService,
    private $window,
    private UrlConfig,
    private $modal,
    private ServiceDescriptor,
  ) {
    this.FeatureToggleService.atlasSubdomainUpdateGetStatus().then((status: boolean): void => {
      this.toggle = status;

      $scope.$emit(this.DISMISS_DISABLE, true);
      this.domainSuffix = UrlConfig.getSparkDomainCheckUrl();
      this.subdomainCount++;
      this.checkRoomLicense();

      if (this.toggle) {
        this.ServiceDescriptor.isServiceEnabled('squared-fusion-ec', (error: any, enabled: boolean): void => {
          if (!error) {
            this.isCsc = enabled;
          }
        });

        let onSaveEventDeregister = this.$rootScope.$on(this.WIZARD_BROADCAST, (): void => {
          if (this.inputValue === this.currentDisplayName) {
            return;
          } else {
            this.saveSubdomain();
          }
        });

        let onSettingsSaveEventDeregister = this.$rootScope.$on(this.SAVE_BROADCAST, (): void => {
          this.updateSubdomain();
        });

        let onSettingsCancelEventDeregister = this.$rootScope.$on(this.CANCEL_BROADCAST, (): void => {
          this.toggleSipForm();
        });

        $scope.$on('$destroy', onSaveEventDeregister);
        $scope.$on('$destroy', onSettingsSaveEventDeregister);
        $scope.$on('$destroy', onSettingsCancelEventDeregister);

        this.loadSubdomains();
      } else {
        this.errorMsg = $translate.instant('firstTimeWizard.setSipDomainErrorMessage');
        let onSaveEventDeregister = $rootScope.$on(this.WIZARD_BROADCAST, this.saveDomain.bind(this));
        $scope.$on('$destroy', onSaveEventDeregister);

        this.loadSipDomain();
        this.checkSSAReservation();
      }
    });
  }

  get isUrlAvailable(): boolean {
    return !!this._inputValue && (this._inputValue === this._validatedValue);
  }

  // TODO: convert 'inputValue' back into normal variable upon removing the feature toggle
  get inputValue(): string {
    return this._inputValue;
  }

  set inputValue(newValue: string) {
    if (newValue !== this._validatedValue && !this.isDisabled) {
      this.isError = false;
      this.isButtonDisabled = false;
      this.isConfirmed = false;
    }
    this._inputValue = newValue;
  }

  public checkSSAReservation() {
    if (this.isSSAReserved || this.Config.isE2E()) {
      this.$scope.$emit(this.DISMISS_DISABLE, false);
    } else {
      this.$scope.$emit(this.DISMISS_DISABLE, !this.isConfirmed);
    }
  }

  public validateSipDomain() {
    if (this._inputValue.length > 40) {
      this.isError = true;
    }
    return this.isError;
  }

  public saveDomain() {
    if (this.isUrlAvailable && this.isConfirmed) {
      this.SparkDomainManagementService.addSipDomain(this._validatedValue)
        .then((response) => {
          if (response.data.isDomainReserved) {
            this.isError = false;
            this.isDisabled = true;
            this.isButtonDisabled = true;
            this.Notification.success('firstTimeWizard.setSipDomainSuccessMessage');
            this.$rootScope.$broadcast(this.DISMISS_BROADCAST);
          }
        })
        .catch((response) => {
          this.Notification.errorWithTrackingId(response, 'firstTimeWizard.sparkDomainManagementServiceErrorMessage');
        });
    }
  }

  public checkSipDomainAvailability() {
    let domain = this._inputValue;
    this.isLoading = true;
    this.isButtonDisabled = true;
    this.errorMsg = this.$translate.instant('firstTimeWizard.setSipDomainErrorMessage');

    return this.SparkDomainManagementService.checkDomainAvailability(domain)
      .then((response) => {
        if (response.data.isDomainAvailable) {
          this._validatedValue = domain;
          this.isError = false;
        } else {
          this.isError = true;
          this.isButtonDisabled = false;
        }
        this.isLoading = false;
      })
      .catch((response) => {
        if (response.status === 400) {
          this.errorMsg = this.$translate.instant('firstTimeWizard.setSipDomainErrorMessageInvalidDomain');
          this.isError = true;
        } else {
          this.Notification.error('firstTimeWizard.sparkDomainManagementServiceErrorMessage');
        }
        this.isLoading = false;
        this.isButtonDisabled = false;
      });
  }

  private loadSipDomain() {
    this.Orgservice.getOrg((data, status) => {
      let displayName = '';
      let sparkDomainStr = this.UrlConfig.getSparkDomainCheckUrl();
      if (status === 200) {
        if (data.orgSettings.sipCloudDomain) {
          displayName = data.orgSettings.sipCloudDomain.replace(sparkDomainStr, '');
          this.isDisabled = true;
          this.isButtonDisabled = true;
          this.isSSAReserved = true;
          this.checkSSAReservation();
        }
      } else {
        this.Notification.error('firstTimeWizard.sparkDomainManagementServiceErrorMessage');
      }
      this._inputValue = displayName;
      this.currentDisplayName = displayName;
    }, false, true);
  }

  // Used in New Feature
  public editSubdomain() {
    if (this.isCsc) {
      this.cscWarning();
    } else {
      this.toggleSipForm();
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
    this.$window.open('https://help.webex.com/docs/DOC-7763', '_blank');
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
      });
  }

  private saveSubdomain(): void {
    this.saving = true;
    this.SparkDomainManagementService.addSipDomain(this.inputValue).then((response: any): void => {
      this.verified = false;
      if (response.data.isDomainReserved) {
        this.sipForm = false;
        this.currentDisplayName = this.inputValue;
        this.resetForm();
        if (this.isSSAReserved && this.showSaveButton) {
          this.Notification.success('firstTimeWizard.subdomainSaveSuccess');
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
    });
  }

  private updateSubdomain(): void {
    let vm = this;
    this.saving = true;
    this.$modal.open({
      templateUrl: 'modules/core/settings/sipDomain/updateSipDomainWarning.tpl.html',
      controller: function () {
        this.isCsc = vm.isCsc;
        this.openDocumentation = vm.openSipHelpWiki;
      },
      controllerAs: 'subdomain',
      type: 'dialog',
    }).result.then((): void => {
      this.saveSubdomain();
    }).catch((): void => {
      this.$rootScope.$broadcast(this.ACTIVATE_SAVE_BUTTONS);
      this.saving = false;
    });
  }

  private cscWarning(): void {
    let vm = this;
    this.saving = true;
    this.$modal.open({
      templateUrl: 'modules/core/settings/sipDomain/editCSCWarning.tpl.html',
      controller: function () {
        this.openDocumentation = vm.openSipHelpWiki;
      },
      controllerAs: 'subdomain',
      type: 'dialog',
    }).result.then((): void => {
      this.toggleSipForm();
    });
  }

  private checkRoomLicense() {
    this.Orgservice.getLicensesUsage().then((response) => {
      let licenses: any = _.get(response, '[0].licenses');
      let roomLicensed = _.find(licenses, {
        offerName: 'SD',
      });
      this.isRoomLicensed = !_.isUndefined(roomLicensed);
      this.subdomainCount++;
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
    this.Orgservice.getOrg((data, status) => {
      let displayName = '';
      let sparkDomainStr = this.UrlConfig.getSparkDomainCheckUrl();
      if (status === 200 && _.get(data, 'orgSettings.sipCloudDomain', false)) {
        displayName = data.orgSettings.sipCloudDomain.replace(sparkDomainStr, '');
        this.isSSAReserved = true;
        this.$scope.$emit(this.DISMISS_DISABLE, false);
      } else if (status !== 200) {
        this.errorResponse({
          status: status,
        });
        this.$scope.$emit(this.DISMISS_DISABLE, true);
      }
      this._inputValue = displayName;
      this.currentDisplayName = displayName;

      if (this.Config.isE2E()) {
        this.$scope.$emit(this.DISMISS_DISABLE, false);
      }
    }, false, true);
  }

}
angular.module('Core')
  .controller('SipDomainSettingController', SipDomainSettingController);
