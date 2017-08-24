import './_meeting-settings.scss';
import { IWebExSite, ISiteNameError, IConferenceService, IExistingTrialSites, IWebexLicencesPayload, IPendingLicense, IConferenceLicense } from './meeting-settings.interface';
import { SetupWizardService } from '../setup-wizard.service';

export enum Steps {
  SITES_SETUP = 'SITES_SETUP',
  SITES_LICENSES = 'SITES_LICENSES',
}

export class MeetingSettingsCtrl {
  public siteModel: IWebExSite = {
    siteUrl: '',
    timezone: '',
    centerType: '',
    quantity: 1,
  };

  public steps = Steps;
  public error: ISiteNameError = {
    isError: false,
    errorMsg: '',
  };


  public licenseDistributionForm: ng.IFormController;
  public ccaspForm: ng.IFormController;
  public existingSites: IExistingTrialSites[] = [];
  public existingWebexSites: IWebExSite[] = [];
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
  public transferSiteUrl = '';
  public transferSiteCode = '';
  private nextButtonDisabledStatus = false;
  public ccasp = {
    partnerOptions: [],
    partnerNameSelected: null,
    subscriptionId: '',
    isError: false,
  };

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
    this.findExistingWebexSites();

    // If user clicked back after setting WebEx sites in the meeting-settings tab, we want to preserve the entered sites
    const webexSitesData = this.TrialWebexService.getProvisioningWebexSitesData();
    if (!_.isEmpty(webexSitesData)) {
      this.updateSitesArray(_.get(webexSitesData, 'webexLicencesPayload.webexProvisioningParams.webexSiteDetailsList'));
    }

    if (this.SetupWizardService.hasTSPAudioPackage()) {
      this.populateTSPPartnerOptions();
    }

    this.hasTrialSites = this.SetupWizardService.hasWebexMeetingTrial();

    if (this.SetupWizardService.hasCCASPPackage()) {
      this.populateCCASPPartnerOptions();
    }
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
          return this.$q.reject();
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
      return this.$q.reject();
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

  public migrateTrialNext(): ng.IPromise<any> {
    if (_.isEmpty(this.transferSiteUrl) && _.isEmpty(this.transferSiteCode)) {
      this.nextButtonDisabledStatus = false;
      this.stripTransferredSitesFromSitesArray();
      return this.$q.resolve();
    }
    const transferSiteDetails = {
      siteUrl: this.transferSiteUrl,
      transferCode: this.transferSiteCode,
    };
    if (!(_.endsWith(transferSiteDetails.siteUrl, '.webex.com'))) {
      transferSiteDetails.siteUrl += this.Config.siteDomainUrl.webexUrl;
    }
    return this.SetupWizardService.validateTransferCode(transferSiteDetails).then((response) => {
      const status = _.get(response, 'data.status');
      if (!status || status !== 'INVALID') {
        // if transferred sites have already been added and the back button clicked, strip old sites.
        if (!_.isEmpty(this.sitesArray)) {
          this.stripTransferredSitesFromSitesArray();
        }
        const transferredSitesArray = _.get(response, 'data.siteList');
        _.forEach(transferredSitesArray, (site) => {
          if (!(_.some(this.sitesArray, { siteUrl: site.siteUrl }))) {
            const transferredSiteModel = _.clone(this.siteModel);
            transferredSiteModel.siteUrl = site.siteUrl.replace(this.Config.siteDomainUrl.webexUrl, ''),
            transferredSiteModel.timezone = this.findTimezoneObject(site.timezone);
            transferredSiteModel.setupType = this.Config.setupTypes.transfer;
            this.sitesArray.push(transferredSiteModel);
          }
        });
        this.constructDistributedSitesArray();
        return this.$q.resolve();
      } else {
        this.nextButtonDisabledStatus = true;
        _.set(this.$scope.wizard, 'isNextDisabled', true);
        this.showError(this.$translate.instant('firstTimeWizard.transferCodeInvalidError'));
        return this.$q.reject();
      }
    }).catch((response) => {
      if (response) {
        this.Notification.errorWithTrackingId(response, 'firstTimeWizard.transferCodeError');
      }
      return this.$q.reject();
    });
  }

  private updateSitesArray(sites) {
    const sitesArray = _.map(sites, (site: any) => {
      const timezone = this.findTimezoneObject(site.timezone);
      const siteObj = {
        quantity: _.parseInt(site.quantity),
        siteUrl: site.siteUrl.replace(this.Config.siteDomainUrl.webexUrl, ''),
        timezone: timezone,
        centerType: site.centerType,
        setupType: site.setupType,
      };
      if (!site.setupType) {
        delete siteObj.setupType;
      }
      return siteObj;
    });

    this.sitesArray = sitesArray;
  }

  private stripTransferredSitesFromSitesArray() {
    this.sitesArray = _.filter(this.sitesArray, (site) => {
      return _.isUndefined(site.setupType);
    });
  }

  private updateSitesLicenseCount() {
    const sourceArray = _.flatten(this.distributedLicensesArray);
    _.forEach(this.sitesArray, (site) => {
      const matchingSite = _.filter(sourceArray, { siteUrl: site.siteUrl });
      if (matchingSite.length) {
        site.quantity = _.sumBy(matchingSite, 'quantity');
      } else {
        site.quantity = 0;
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

  public validateMeetingSite(): void {
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
        _.each(this.licenseDistributionForm.$$controls, (control) => { control.$validate(); });
        _.set(this.$scope.wizard, 'isNextDisabled', licensesRemaining !== 0 || this.licenseDistributionForm.$invalid);
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

  public checkValidTransferData() {
    this.clearError();
    let invalid = false;
    if (this.showTransferCodeInput) {
      const siteUrlEmpty = _.isEmpty(this.transferSiteUrl);
      const transferCodeEmpty = _.isEmpty(this.transferSiteCode);
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

  private populateCCASPPartnerOptions() {
    this.SetupWizardService.getCCASPPartners().then((partners) => {
      this.ccasp.partnerOptions = partners;
    });
  }

  private ccaspSetInvalid(isInvalid) {
    this.setNextDisableStatus(isInvalid);
    this.ccasp.isError = isInvalid;
    this.disableValidateButton = false;
  }

  public ccaspResetValidation() {
    this.setNextDisableStatus(true);
    this.audioPartnerName = null;
  }
  public ccaspValidate() {
    this.disableValidateButton = true;
    this.setNextDisableStatus(true);
    if (!(this.ccasp.partnerNameSelected && this.ccasp.subscriptionId)) {
      return false;
    }
    this.SetupWizardService.validateCCASPPartner(this.ccasp.subscriptionId, this.ccasp.partnerNameSelected || '')
      .then((isValid) => {
        this.ccaspSetInvalid(!isValid);
        if (isValid) {
          this.audioPartnerName = this.ccasp.partnerNameSelected || null;
        }
      })
      .catch(() => {
        this.ccaspSetInvalid(true);
      });
  }
  public ccaspSetNextDisabled() {
    if (!this.audioPartnerName || ! this.ccasp.subscriptionId) {
      this.setNextDisableStatus(true);
    }
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

  public initLicenseDistributionStep(): void {
    this.constructDistributedSitesArray();
    this.enableOrDisableNext(this.steps.SITES_LICENSES);
  }

  public constructDistributedSitesArray(): void {
    this.distributedLicensesArray = _.map(this.sitesArray, (site: IWebExSite) => {
      return _.map(this.centerDetails, (center) => {
        const siteObject: IWebExSite = {
          centerType: center.centerType,
          quantity: site.quantity,
          siteUrl: site.siteUrl,
          timezone: site.timezone,
          setupType: site.setupType,
        };
        if (!site.setupType) {
          delete siteObject.setupType;
        }
        return siteObject;
      });
    });

    this.mergeExistingWebexSites();
  }

  private mergeExistingWebexSites(): void {
    _.forEach(this.distributedLicensesArray, (sitesArray) => {
      _.forEach(this.existingWebexSites, (siteObj) => {
        const site = _.find(sitesArray, { siteUrl: siteObj.siteUrl, centerType: siteObj.centerType });
        if (_.has(site, 'quantity')) {
          site.quantity = siteObj.quantity;
        }
      });
    });
  }

  public findExistingWebexTrialSites(): void {
    const conferencingServices = _.filter(this.Authinfo.getConferenceServices(), { license: { isTrial: true } });
    const existingTrials = _.find(conferencingServices, (service: IConferenceService) => {
      return _.includes([this.Config.offerCodes.EE, this.Config.offerCodes.MC, this.Config.offerCodes.EC, this.Config.offerCodes.TC, this.Config.offerCodes.SC], service.license.offerName);
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

  // In the case of modify orders, the order will apply to an active subscription.
  // If we have WebEx licenses, we need pull those siteUrls and include them in the provision context
  public findExistingWebexSites(): void {
    const actingSubscriptionLicenses = _.get<IConferenceLicense[]>(this.SetupWizardService.getActingSubscription(), 'licenses', []);
    const existingConferenceServicesInActingSubscripton = _.filter(actingSubscriptionLicenses, (license: IConferenceLicense) => _.includes([this.Config.offerCodes.EE, this.Config.offerCodes.MC, this.Config.offerCodes.EC, this.Config.offerCodes.TC, this.Config.offerCodes.SC], license.offerName));

    // Create an array of existing sites
    this.existingWebexSites = _.map(existingConferenceServicesInActingSubscripton, (license) => {
      return {
        siteUrl: _.replace(_.get<string>(license, 'siteUrl'), this.Config.siteDomainUrl.webexUrl, ''),
        quantity: license.volume,
        centerType: license.offerName,
      };
    });

    // Push unique sites to sitesArray
    this.sitesArray = this.sitesArray.concat(_.map(_.uniqBy(this.existingWebexSites, 'siteUrl'), (site) => {
      return {
        siteUrl: _.replace(_.get<string>(site, 'siteUrl'), this.Config.siteDomainUrl.webexUrl, ''),
        quantity: 1,
        centerType: '',
        keepExistingSite: true,
      };
    }));
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
      if (_.get(site, 'quantity', 0) > 0) {
        const webexSiteDetail: IWebExSite = {
          siteUrl: site.siteUrl + this.Config.siteDomainUrl.webexUrl,
          timezone: _.get<string>(site, 'timezone.timeZoneId'),
          centerType: site.centerType,
          quantity: _.get<number>(site, 'quantity'),
        };
        if (site.setupType) {
          webexSiteDetail.setupType = site.setupType;
        }
        webexSiteDetailsList.push(webexSiteDetail);
      }
    });

    _.set(webexLicensesPayload, 'webexProvisioningParams', {
      webexSiteDetailsList: webexSiteDetailsList,
      audioPartnerName: this.audioPartnerName,
    });
    if (!_.isEmpty(this.ccasp.subscriptionId)) {
      _.set(webexLicensesPayload, 'webexProvisioningParams.ccaspSubscriptionId', this.ccasp.subscriptionId);
    }

    if (!_.isEmpty(this.transferSiteCode)) {
      _.set(webexLicensesPayload, 'webexProvisioningParams.transferCode', this.transferSiteCode);
    }
    return webexLicensesPayload;
  }
}

angular
  .module('core.meeting-settings', [])
  .controller('MeetingSettingsCtrl', MeetingSettingsCtrl);
