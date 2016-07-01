namespace globalsettings {

  export class SipDomainSettingController {

    public isError = false;
    private _inputValue = '';
    private _validatedValue = '';
    public isDisabled = false;
    public isButtonDisabled = false;
    public isLoading = false;
    public isConfirmed:boolean = null;

    public isRoomLicensed = false;
    public isSSAReserved = false;
    public subdomainCount = 0;
    public domainSuffix = '';
    public errorMsg = '';

    /* @ngInject */
    constructor(private $scope, private $rootScope, private Notification,
                private Orgservice, private SparkDomainManagementService, private Log, private $translate, private $window, private UrlConfig) {
      
      $scope.$emit('wizardNextButtonDisable', true);
      this.domainSuffix = UrlConfig.getSparkDomainCheckUrl();
      this.subdomainCount++;
      this.errorMsg = $translate.instant('firstTimeWizard.setSipDomainErrorMessage');

      let onSaveEventDeregister = $rootScope.$on('wizard-enterprise-sip-url-event', this.saveDomain.bind(this));

      $scope.$on('$destroy', onSaveEventDeregister);

      this.checkRoomLicense();
      this.loadSipDomain();
      this.checkSSAReservation();
    }

    get isUrlAvailable():boolean {
      return this._inputValue && (this._inputValue === this._validatedValue);
    }

    get inputValue():string {
      return this._inputValue;
    }

    set inputValue(newValue:string) {

      if (newValue !== this._validatedValue && !this.isDisabled) {
        this.isError = false;
        this.isButtonDisabled = false;
        this.isConfirmed = false;
      }
      this._inputValue = newValue;
    }

    public checkSSAReservation() {
      if(this.isSSAReserved)
        this.$scope.$emit('wizardNextButtonDisable', false);
      else
      {
        if(!this.isConfirmed)
        {
          this.$scope.$emit('wizardNextButtonDisable', true);
        }
        else{
          this.$scope.$emit('wizardNextButtonDisable', false);
        }
      }
    }

    public openSipHelpWiki() {
      this.$window.open('https://help.webex.com/docs/DOC-7763', '_blank');
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
              this.$rootScope.$broadcast('DISMISS_SIP_NOTIFICATION');
            }
          })
          .catch((response) => {
            this.Notification.error('firstTimeWizard.sparkDomainManagementServiceErrorMessage');
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


    private checkRoomLicense() {
      this.Orgservice.getLicensesUsage().then((response) => {
        let licenses:any = _.get(response, '[0].licenses');
        let roomLicensed = _.find(licenses, {
          offerName: 'SD'
        });
        this.isRoomLicensed = !_.isUndefined(roomLicensed);
        this.subdomainCount++;
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
          this.Log.debug('Get existing org failed. Status: ' + status);
          this.Notification.error('firstTimeWizard.sparkDomainManagementServiceErrorMessage');
        }
        this._inputValue = displayName;
      }, false, true);
    }

  }
  angular.module('Core')
    .controller('SipDomainSettingController', SipDomainSettingController);
}
