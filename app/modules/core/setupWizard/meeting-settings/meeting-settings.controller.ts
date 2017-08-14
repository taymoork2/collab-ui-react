import './_meeting-settings.scss';
import { IWebExSite, ISiteNameError, IConferenceService, IExistingTrialSites, IWebexLicencesPayload, IPendingLicense } from './meeting-settings.interface';
import { SetupWizardService } from '../setup-wizard.service';

export enum Steps {
  SITES_SETUP = 'SITES_SETUP',
  SITES_LICENSES = 'SITES_LICENSES',
}

export class MeetingSettingsCtrl {
  public siteModel: IWebExSite = {
    siteUrl: '',
    timezone: '',
    centerType: 'EE',
    quantity: 1,
  };

  public steps = Steps;
  public error: ISiteNameError = {
    isError: false,
    errorMsg: '',
  };

  public meetingSettingsForm: ng.IFormController;
  public existingSites: IExistingTrialSites[] = [];
  public disableValidateButton: boolean = false;
  public selectTimeZonePlaceholder = this.$translate.instant('firstTimeWizard.selectTimeZonePlaceholder');
  public timeZoneOptions = this.TrialTimeZoneService.getTimeZones();
  public sitesArray: IWebExSite[] = [];
  public actingSubscriptionId = '';
  public distributedLicensesArray: IWebExSite[][];
  public centerDetails = this.getWebExMeetingsLicenseTypeDetails();
  public tspPartnerOptions = [];
  public audioPartnerName = null;
  public dropdownPlaceholder = this.$translate.instant('common.select');
  public licenseDistributionErrors = {
    required: this.$translate.instant('firstTimeWizard.required'),
    min: this.$translate.instant('firstTimeWizard.meetingSettingsError.invalidLicense'),
    step: this.$translate.instant('firstTimeWizard.meetingSettingsError.invalidLicense'),
  };
  public showTransferCodeInput: boolean = false;
  public hasTrialSites: boolean = false;
  public transferSiteDetails = {
    siteUrl: '',
    transferCode: '',
  };
  private nextButtonDisabledStatus = false;

  /* @ngInject */
  constructor(
    private $q: ng.IQService,
    public $scope,
    private $stateParams,
    private $translate: ng.translate.ITranslateService,
    private $rootScope: ng.IRootScopeService,
    private Authinfo,
    private Config,
    private Notification,
    private TrialTimeZoneService,
    private TrialWebexService,
    private SetupWizardService: SetupWizardService,
  ) {
    this.init();
  }

  private init(): void {
    this.$scope.$watch(() => { return this.sitesArray.length; }, () => {
      this.enableOrDisableNext(Steps.SITES_SETUP);
    });
    this.findExistingWebexTrialSites();

    // If user clicked back after setting WebEx sites in the meeting-settings tab, we want to preserve the entered sites
    const webexSitesData = this.TrialWebexService.getProvisioningWebexSitesData();
    if (!_.isEmpty(webexSitesData)) {
      this.updateSitesArray(_.get(webexSitesData, 'webexLicencesPayload.webexProvisioningParams.webexSiteDetailsList'));
    }
    const validateTransferCodeSitePair = this.$rootScope.$on('wizard-meeting-settings-migrate-site-event', (): void => {
      if (_.isEmpty(this.transferSiteDetails.siteUrl) && _.isEmpty(this.transferSiteDetails.transferCode)) {
        this.nextButtonDisabledStatus = false;
        this.$rootScope.$emit('wizard-meeting-settings-transfer-code-validated');
        return;
      }
      if (!(_.endsWith(this.transferSiteDetails.siteUrl, '.webex.com'))) {
        this.transferSiteDetails.siteUrl += this.Config.siteDomainUrl.webexUrl;
      }
      this.SetupWizardService.validateTransferCode(this.transferSiteDetails).then((response) => {
        const status = _.get(response, 'data.status');
        if (!status || status !== 'INVALID') {
          this.transferSiteDetails = {
            siteUrl: '',
            transferCode: '',
          };
          // if transferred sites have already been added and the back button clicked, strip old sites.
          if (!_.isEmpty(this.sitesArray)) {
            this.stripTransferredSitesFromSitesArray();
          }
          const transferredSitesArray = _.get(response, 'data.siteList');
          _.forEach(transferredSitesArray, (site) => {
            if (!(_.some(this.sitesArray, { siteUrl: site.siteUrl }))) {
              const transferredSiteModel = _.clone(this.siteModel);
              transferredSiteModel.siteUrl = site.siteUrl;
              transferredSiteModel.timezone = this.findTimezoneObject(site.timezone);
              transferredSiteModel.isTransferSite = true;
              this.sitesArray.push(transferredSiteModel);
            }
          });
          this.constructDistributedSitesArray();
          return this.$rootScope.$emit('wizard-meeting-settings-transfer-code-validated');
        } else {
          this.nextButtonDisabledStatus = true;
          _.set(this.$scope.wizard, 'isNextDisabled', true);
          this.showError(this.$translate.instant('firstTimeWizard.transferCodeInvalidError'));
        }
      }).catch((response) => {
        this.Notification.errorWithTrackingId(response, 'firstTimeWizard.webexProvisioningError');
      });
    });
    this.$scope.$on('$destroy', () => {
      validateTransferCodeSitePair();
    });

    if (this.SetupWizardService.hasTSPAudioPackage()) {
      this.populateTSPPartnerOptions();
    }
    this.hasTrialSites = this.SetupWizardService.hasWebexMeetingTrial();

  }

  public onInputChange() {
    this.clearError();
  }

  private pushProvisioningCallIntoQueue(): void {
    const webexLicenses: IWebexLicencesPayload = this.constructWebexLicensesPayload();
    this.TrialWebexService.setProvisioningWebexSitesData(webexLicenses, this.SetupWizardService.getInternalSubscriptionId());
    this.SetupWizardService.addProvisioningCallbacks({
      meetingSettings: () => {
        return this.TrialWebexService.provisionWebexSites().then(() => {
          this.Notification.success('firstTimeWizard.webexProvisioningSuccess');
        }).catch((response) => {
          this.Notification.errorWithTrackingId(response, 'firstTimeWizard.webexProvisioningError');
        });
      },
    });
  }

  private callProvisioning(): ng.IPromise<any> {
    const webexLicenses: IWebexLicencesPayload = this.constructWebexLicensesPayload();
    this.TrialWebexService.setProvisioningWebexSitesData(webexLicenses, this.SetupWizardService.getInternalSubscriptionId());
    return this.TrialWebexService.provisionWebexSites().then(() => {
      this.Notification.success('firstTimeWizard.webexProvisioningSuccess');
      this.$rootScope.$emit('meeting-settings-services-setup-successful');
    }).catch((response) => {
      this.Notification.errorWithTrackingId(response, 'firstTimeWizard.webexProvisioningError');
    });
  }

  // wizard PromiseHook
  public summaryNext(): ng.IPromise<any> {
    if (this.$stateParams.onlyShowSingleTab) {
      // Call provisioning directly from the meeting-settings modal on overview page
      return this.callProvisioning();
    }

    this.pushProvisioningCallIntoQueue();
    return this.$q.resolve();
  }

  private updateSitesArray(sites) {
    const sitesArray = _.map(sites, (site: any) => {
      const timezone = this.findTimezoneObject(site.timezone);
      const siteObj = {
        quantity: _.parseInt(site.quantity),
        siteUrl: site.siteUrl.replace(this.Config.siteDomainUrl.webexUrl, ''),
        timezone: timezone,
        centerType: site.centerType,
        isTransferSite: site.isTransferSite,
      };
      if (!site.isTransferSite) {
        delete siteObj.isTransferSite;
      }
      return siteObj;
    });

    this.sitesArray = sitesArray;
  }

  private stripTransferredSitesFromSitesArray () {
    this.sitesArray = _.filter(this.sitesArray, (site) => {
      return _.isUndefined(site.isTransferSite);
    });
  }

  private updateSitesLicenseCount() {
    const sourceArray = _.flatten(this.distributedLicensesArray);
    _.forEach(this.sitesArray, (site) => {
      const matchingSite = _.find(sourceArray, { siteUrl: site.siteUrl });
      if (matchingSite) {
        site.quantity = matchingSite.quantity;
      }
    });
  }

  private updateSitesAudioPackageDisplay() {
    const audioPackage = this.SetupWizardService.getPendingAudioLicenses();
    if (audioPackage && audioPackage[0]) {
      let audioPackageDisplay = 'subscriptions.licenseTypes.' + audioPackage[0].offerName;
      audioPackageDisplay = this.$translate.instant(audioPackageDisplay);
      if (this.audioPartnerName) {
        audioPackageDisplay += this.$translate.instant('firstTimeWizard.providedBy') + this.audioPartnerName;
      }
      _.forEach(this.sitesArray, (site) => {
        site.audioPackageDisplay = audioPackageDisplay;
      });
    }
  }

  private findTimezoneObject(timezoneId) {
    return _.find(this.timeZoneOptions, { timeZoneId: timezoneId });
  }

  public onClickValidate(): void {
    this.disableValidateButton = true;
    if (_.isEmpty(this.siteModel.siteUrl)) {
      this.showError(this.$translate.instant('firstTimeWizard.meetingSettingsError.pleaseEnterSiteName'));
      return;
    }

    if (_.isEmpty(this.siteModel.timezone)) {
      this.showError(this.$translate.instant('firstTimeWizard.meetingSettingsError.pleaseSelectTimeZone'));
      return;
    }
    if (_.some(this.sitesArray, { siteUrl: this.siteModel.siteUrl })) {
      this.showError(this.$translate.instant('firstTimeWizard.meetingSettingsError.duplicateSite'));
      return;
    }

    const siteName = this.siteModel.siteUrl.concat(this.Config.siteDomainUrl.webexUrl);
    this.validateWebexSiteUrl(siteName).then((response) => {
      if (response.isValid && (response.errorCode === 'validSite')) {
        this.sitesArray.push(_.clone(this.siteModel));
        this.constructDistributedSitesArray();
        this.clearInputs();
      } else {
        if (response.errorCode === 'duplicateSite') {
          this.showError(this.$translate.instant('firstTimeWizard.meetingSettingsError.duplicateSite'));
        } else {
          this.showError(this.$translate.instant('firstTimeWizard.meetingSettingsError.enteredSiteNotValid'));
        }
        return;
      }
    }).catch(() => {
      this.clearInputs();
    }).finally(() => {
      this.disableValidateButton = false;
    });
  }

  public removeSite(index: number): void {
    this.sitesArray.splice(index, 1);
    this.constructDistributedSitesArray();
  }

  public sumOfWebExLicensesAssigned(siteArray) {
    const result = _.sumBy(siteArray, (site: IWebExSite) => {
      return Number(site.quantity);
    });

    return result;
  }

  private calculateLicensesRemaining(centerType) {
    const siteArray = _.filter(_.flatten(this.distributedLicensesArray), { centerType: centerType });
    const centerDetail = _.find(this.getWebExMeetingsLicenseTypeDetails(), { centerType: centerType });
    const licenseVolume = _.get<number>(centerDetail, 'volume');

    return (licenseVolume - this.sumOfWebExLicensesAssigned(siteArray));
  }

  public getMinForSiteType(siteUrl) {
    const total = _.sumBy(_.filter(_.flatten(this.distributedLicensesArray), { siteUrl: siteUrl }), 'quantity');
    return (total === 0) ? 1 : 0;
  }

  public getLicensesAssignedTotal(centerType) {
    const siteArray = _.filter(_.flatten(this.distributedLicensesArray), { centerType: centerType });

    return this.sumOfWebExLicensesAssigned(siteArray);
  }

  public getLicensesRemaining(centerType) {
    const licensesRemaining = this.calculateLicensesRemaining(centerType);

    return licensesRemaining;
  }

  public enableOrDisableNext(step: Steps) {
    switch (step) {
      case Steps.SITES_LICENSES: {
        let licensesRemaining = 0;
        _.forEach(this.centerDetails, (center) => {
          licensesRemaining += this.calculateLicensesRemaining(center.centerType);
          if (licensesRemaining === 0) {
            this.updateSitesLicenseCount();
            this.updateSitesAudioPackageDisplay();
          }
        });
        _.set(this.$scope.wizard, 'isNextDisabled', licensesRemaining !== 0);
        break;
      }
      case Steps.SITES_SETUP: {
        if (_.get(this.$scope.wizard, 'current.step.name') === 'siteSetup') {
          _.set(this.$scope.wizard, 'isNextDisabled', this.sitesArray.length === 0);
        }
        break;
      }
    }
  }

  public checkValidTransferData () {
    this.clearError();
    let invalid = false;
    if (this.showTransferCodeInput) {
      const siteUrlEmpty = _.isEmpty(this.transferSiteDetails.siteUrl);
      const transferCodeEmpty = _.isEmpty(this.transferSiteDetails.transferCode);
      if ((siteUrlEmpty && !transferCodeEmpty) || (transferCodeEmpty && !siteUrlEmpty)) {
        invalid = true;
      }
    }

    if (invalid !== this.nextButtonDisabledStatus) {
      this.nextButtonDisabledStatus = invalid;
      _.set(this.$scope.wizard, 'isNextDisabled', invalid);
    }
  }

  public setNextDisableStatus(status) {
    _.set(this.$scope.wizard, 'isNextDisabled', status);
    if (this.audioPartnerName) {
      this.updateSitesAudioPackageDisplay();
    }
  }

  public addOrRemoveExistingWebExSite(site) {
    if (site.keepExistingSite) {
      this.sitesArray.push(site);
    } else {
      _.remove(this.sitesArray, (s) => {
        return s.siteUrl === site.siteUrl;
      });
    }
    this.sitesArray = _.uniq(this.sitesArray);
    this.constructDistributedSitesArray();
  }

  private getWebExMeetingsLicenseTypeDetails() {
    const meetingCenterLicenses = _.reject(this.SetupWizardService.getPendingMeetingLicenses(), (license: IPendingLicense) => {
      return license.offerName === 'CF' || license.offerName === 'CMR';
    });

    return _.map(meetingCenterLicenses, (license: IPendingLicense) => {
      return {
        centerType: license.offerName,
        volume: license.volume,
      };
    });
  }

  private populateTSPPartnerOptions() {
    this.SetupWizardService.getTSPPartners().then((partners) => {
      this.tspPartnerOptions = partners;
    });
  }

  public offerCodeToCenterTypeString(offerCode: string) {
    switch (offerCode) {
      case this.Config.offerCodes.EE:
        return this.$translate.instant('firstTimeWizard.enterpriseEditionLicensesRemaining');
      case this.Config.offerCodes.MC:
        return this.$translate.instant('firstTimeWizard.meetingCenterLicensesRemaining');
      case this.Config.offerCodes.EC:
        return this.$translate.instant('firstTimeWizard.eventCenterLicensesRemaining');
      case this.Config.offerCodes.TC:
        return this.$translate.instant('firstTimeWizard.trainingCenterLicensesRemaining');
      case this.Config.offerCodes.SC:
        return this.$translate.instant('firstTimeWizard.supportCenterLicensesRemaining');
      default:
        return this.$translate.instant('firstTimeWizard.invalidCenterType');
    }
  }

  private constructDistributedSitesArray(): void {
    this.distributedLicensesArray = _.map(this.sitesArray, (site: IWebExSite) => {
      return _.map(this.centerDetails, (center) => {
        const siteObject = {
          centerType: center.centerType,
          quantity: site.quantity,
          siteUrl: site.siteUrl,
          timezone: site.timezone,
          isTransferSite: site.isTransferSite,
        };
        if (!site.isTransferSite) {
          delete siteObject.isTransferSite;
        }
        return siteObject;
      });
    });
  }

  public findExistingWebexTrialSites(): void {
    const conferencingServices = _.filter(this.Authinfo.getConferenceServices(), { license: { isTrial: true } });
    const existingTrials = _.find(conferencingServices, (service: IConferenceService) => {
      return _.includes([this.Config.offerCodes.EE, this.Config.offerCodes.MC, this.Config.offerCodes.EC, this.Config.offerCodes.TC, this.Config.offerCodes.SC, this.Config.offerCodes.CMR], service.license.offerName);
    });

    _.forEach(existingTrials, (trial) => {
      if (_.has(trial, 'siteUrl')) {
        this.existingSites.push({
          siteUrl: trial.siteUrl.replace(this.Config.siteDomainUrl.webexUrl, ''),
          quantity: 0,
          centerType: '',
          keepExistingSite: true,
        });
      }
    });
  }

  private validateWebexSiteUrl(siteName): ng.IPromise<any> {
    const source = this.Config.shallowValidationSourceTypes.serviceSetup;
    return this.TrialWebexService.validateSiteUrl(siteName, source);
  }

  private showError(msg) {
    this.error.isError = true;
    this.error.errorMsg = msg;
    this.disableValidateButton = false;
  }

  private clearError(): void {
    this.error.isError = false;
    this.error.errorMsg = '';
  }

  private clearInputs(): void {
    this.siteModel.siteUrl = '';
    this.siteModel.timezone = '';
  }

  private constructWebexLicensesPayload(): IWebexLicencesPayload {
    const webexSiteDetailsList: IWebExSite[] = [];
    const webexLicensesPayload: IWebexLicencesPayload = {
      provisionOrder: true,
      sendCustomerEmail: true,
      serviceOrderUUID: this.SetupWizardService.getActingSubscriptionServiceOrderUUID(),
    };

    const distributedLicenses = _.flatten(this.distributedLicensesArray);
    _.forEach(distributedLicenses, (site) => {
      const webexSiteDetail: IWebExSite = {
        siteUrl: site.siteUrl + this.Config.siteDomainUrl.webexUrl,
        timezone: _.get<string>(site, 'timezone.timeZoneId'),
        centerType: site.centerType,
        quantity: _.get<number>(site, 'quantity'),
      };
      if (site.isTransferSite) {
        webexSiteDetail.isTransferSite = true;
      }

      webexSiteDetailsList.push(webexSiteDetail);
    });

    _.set(webexLicensesPayload, 'webexProvisioningParams', {
      webexSiteDetailsList: webexSiteDetailsList,
      audioPartnerName: this.audioPartnerName,
    });

    if (!_.isEmpty(this.transferSiteDetails.transferCode)) {
      _.set(webexLicensesPayload, 'webexProvisioningParams.transferCode', this.transferSiteDetails.transferCode);
    }
    return webexLicensesPayload;
  }
}

angular
  .module('core.meeting-settings', [])
  .controller('MeetingSettingsCtrl', MeetingSettingsCtrl);
