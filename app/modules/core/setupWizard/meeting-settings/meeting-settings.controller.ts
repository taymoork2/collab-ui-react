import './_meeting-settings.scss';
import { Config } from 'modules/core/config/config';
import { IWebExSite, ISiteNameError, SiteErrorType, IConferenceService, IExistingWebExTrialSite, IWebexLicencesPayload, IPendingLicense, IConferenceLicense } from './meeting-settings.interface';
import { SetupWizardService } from '../setup-wizard.service';

export enum Steps {
  SITES_SETUP = 'SITES_SETUP',
  SITES_LICENSES = 'SITES_LICENSES',
}


class WebExSite {
  public centerType: string;
  public quantity: number;
  public siteUrl: string;
  public audioPackageDisplay?: string;
  public timezone?: string | object;
  public setupType?: string;

  constructor({
    centerType,
    quantity,
    siteUrl,
    timezone,
    setupType,
  }: IWebExSite) {
    this.centerType = centerType;
    this.quantity = quantity || 0;
    this.siteUrl = siteUrl;
    this.timezone = timezone;
    this.setupType = setupType;

    if (!setupType) {
      delete this.setupType;
    }
  }
}

class ExistingWebexTrialSite extends WebExSite {
  public keepExistingSite: boolean;
  constructor({
    centerType,
    quantity,
    siteUrl,
    timezone,
    setupType,
    keepExistingSite,
  }: IExistingWebExTrialSite) {
    super({
      centerType,
      quantity,
      siteUrl,
      timezone,
      setupType,
    });
    this.keepExistingSite = keepExistingSite;
  }
}

interface ICCASPData {
  partnerOptions: string[];
  partnerNameSelected: string | null;
  subscriptionId: string;
  isError: boolean;
}

export class MeetingSettingsCtrl {
  public siteModel: IWebExSite = {
    siteUrl: '',
    timezone: '',
    centerType: '',
    quantity: 0,
  };
  private static showUserMgmntEmailPattern = '^ordersimp-.*@mailinator.com';
  public setupTypeLegacy = this.Config.setupTypes.legacy;

  public steps = Steps;
  public siteErrorType = SiteErrorType;
  public error: ISiteNameError = {
    isError: false,
    errorMsg: '',
  };


  public licenseDistributionForm: ng.IFormController;
  public ccaspForm: ng.IFormController;
  public existingSites: ExistingWebexTrialSite[] = [];
  public existingWebexSites: IWebExSite[] = [];
  public disableValidateButton: boolean = false;
  public selectTimeZonePlaceholder = this.$translate.instant('firstTimeWizard.selectTimeZonePlaceholder');
  public timeZoneOptions = this.TrialTimeZoneService.getTimeZones();
  public sitesArray: IWebExSite[] = [];
  public actingSubscriptionId = '';
  public distributedLicensesArray: IWebExSite[][];
  public centerDetails = this.getWebExMeetingsLicenseTypeDetails();
  public tspPartnerOptions = [];
  public audioPartnerName: string | null = null;
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
  public ccasp: ICCASPData = {
    partnerOptions: [],
    partnerNameSelected: null,
    subscriptionId: '',
    isError: false,
  };
  public isShowUserManagement = false;

  /* @ngInject */
  constructor(
    private $q: ng.IQService,
    public $scope,
    private $stateParams,
    private $translate: ng.translate.ITranslateService,
    private $rootScope: ng.IRootScopeService,
    private Authinfo,
    private Config: Config,
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
      const sitesLicensesData: WebExSite[] = _.get(webexSitesData, 'webexLicencesPayload.webexProvisioningParams.webexSiteDetailsList');
      this.updateSitesArray(sitesLicensesData);
      this.constructDistributedSitesArray();
      this.updateDistributedSitesArray(sitesLicensesData);
      this.audioPartnerName = _.get(webexSitesData, 'webexLicencesPayload.webexProvisioningParams.audioPartnerName', null);
      this.ccasp.subscriptionId =  _.get(webexSitesData, 'webexLicencesPayload.webexProvisioningParams.ccaspSubscriptionId', '');
      if (this.ccasp.subscriptionId) {
        this.ccasp.partnerNameSelected = this.audioPartnerName;
      }
    }
    // if there is already and active subscription with TSP or CCASP dont display the page - just populate the data.
    if (this.SetupWizardService.hasPendingTSPAudioPackage()) {
      const activeTSPAudioPackage = this.SetupWizardService.getActiveTSPAudioPackage();
      if (activeTSPAudioPackage === undefined) {
        this.populateTSPPartnerOptions();
      } else {
        this.audioPartnerName = activeTSPAudioPackage.tspPartnerName;
      }
    }
    if (this.SetupWizardService.hasPendingCCASPPackage()) {
      const activeCCASPPackage = this.SetupWizardService.getActiveCCASPPackage();
      if (activeCCASPPackage === undefined) {
        this.populateCCASPPartnerOptions();
      } else {
        this.audioPartnerName = activeCCASPPackage.ccaspPartnerName;
        this.ccasp.subscriptionId = activeCCASPPackage.ccaspSubscriptionId;
      }
    }

    this.hasTrialSites = this.SetupWizardService.hasWebexMeetingTrial();

    const regex = new RegExp(MeetingSettingsCtrl.showUserMgmntEmailPattern);
    if (_.includes(this.Authinfo.getUserName(), '@')) {
      this.isShowUserManagement = regex.test(this.Authinfo.getUserName());
    } else {
      this.isShowUserManagement = regex.test(this.Authinfo.getPrimaryEmail());
    }

  }

  public onInputChange() {
    this.clearError();
  }

  public migrateSiteUrl = this.Config.webexSiteMigrationUrl;

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

  private updateDistributedSitesArray(sitesLicensesData) {
    const licenseDistribution = _.flatten(sitesLicensesData);
    _.forEach(this.distributedLicensesArray, (siteGroup) => {
      siteGroup = _.map(siteGroup, (site) => {
        site.quantity = _.get(_.find(licenseDistribution, { siteUrl: site.siteUrl + this.Config.siteDomainUrl.webexUrl, centerType: site.centerType }), 'quantity', 0);
        return site;
      });
    });
  }

  private updateSitesArray(sites) {
    const sitesArray = _.chain(sites).uniqBy('siteUrl').map((site: WebExSite) => {
      const timezone = this.findTimezoneObject(site.timezone);
      const siteUrl = site.siteUrl.replace(this.Config.siteDomainUrl.webexUrl, '');
      return new WebExSite({ centerType: '', quantity: 0, siteUrl: siteUrl, timezone: timezone, setupType: site.setupType });
    }).value();

    this.sitesArray = sitesArray;
  }

  private stripTransferredSitesFromSitesArray() {
    this.sitesArray = _.filter(this.sitesArray, (site) => {
      return site.setupType !== this.Config.setupTypes.transfer;
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

  private findTimezoneObject(timezoneId) {
    return _.find(this.timeZoneOptions, { timeZoneId: timezoneId });
  }

  public validateMeetingSite(): void {
    this.disableValidateButton = true;
    if (_.isEmpty(this.siteModel.siteUrl)) {
      this.showError(this.$translate.instant('firstTimeWizard.meetingSettingsError.pleaseEnterSiteName'), this.siteErrorType.URL);
      return;
    }
    if (_.isEmpty(this.siteModel.timezone)) {
      this.showError(this.$translate.instant('firstTimeWizard.meetingSettingsError.pleaseSelectTimeZone'), this.siteErrorType.TIME_ZONE);
      return;
    }
    if (_.some(this.sitesArray, { siteUrl: this.siteModel.siteUrl })) {
      this.showError(this.$translate.instant('firstTimeWizard.meetingSettingsError.duplicateSite'), this.siteErrorType.URL);
      return;
    }
    if (this.siteModel.setupType === undefined && this.isShowUserManagement ) {
      this.showError(this.$translate.instant('firstTimeWizard.meetingSettingsError.noUserManagementSelected'), this.siteErrorType.USER_MGMT);
      return;
    }
    const siteName = this.siteModel.siteUrl.concat(this.Config.siteDomainUrl.webexUrl);
    this.validateWebexSiteUrl(siteName).then((response) => {
      if (response.isValid && (response.errorCode === 'validSite')) {
        //SparkControlHub user management means there is no setupType
        if (this.siteModel.setupType !== this.setupTypeLegacy) {
          delete this.siteModel.setupType;
        }
        this.sitesArray.push(_.clone(this.siteModel));
        this.addSiteToDistributedArray(_.clone(this.siteModel));
        this.clearWebexSiteInputs();
      } else {
        if (response.errorCode === 'duplicateSite') {
          this.showError(this.$translate.instant('firstTimeWizard.meetingSettingsError.duplicateSite'), this.siteErrorType.URL);
        } else {
          this.showError(this.$translate.instant('firstTimeWizard.meetingSettingsError.enteredSiteNotValid'), this.siteErrorType.URL);
        }
        return;
      }
    }).catch(() => {
      this.clearWebexSiteInputs();
    }).finally(() => {
      this.disableValidateButton = false;
    });
  }

  public removeFromDistributedLicensesArray(site) {
    if (!_.isEmpty(this.distributedLicensesArray)) {
      let i = -1;
      _.forEach(this.distributedLicensesArray, (siteGroup, index) => {
        if (_.find(siteGroup, { siteUrl: site.siteUrl })) {
          i = index;
        }
      });
      this.distributedLicensesArray.splice(i, 1);
    }
  }

  public addSiteToDistributedArray(site) {
    if (!_.isEmpty(this.distributedLicensesArray)) {
      const newSite = _.map(this.centerDetails, (center) => {
        return new WebExSite({ centerType: center.centerType, quantity: site.quantity, siteUrl: site.siteUrl, timezone: site.timezone, setupType: site.setupType });
      });
      this.distributedLicensesArray.push(newSite);
    }
  }

  public removeSite(index: number): void {
    this.removeFromDistributedLicensesArray(this.sitesArray[index]);
    this.sitesArray.splice(index, 1);
  }

  public sumOfWebExLicensesAssigned(siteArray) {
    const result = _.sumBy(siteArray, (site: WebExSite) => {
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


  public getLicensesForSite(siteUrl) {
    const total = _.sumBy(_.filter(_.flatten(this.distributedLicensesArray), { siteUrl: siteUrl }), 'quantity');
    return total;
  }

  public getLicensesAssignedTotal(centerType) {
    const siteArray = _.filter(_.flatten(this.distributedLicensesArray), { centerType: centerType });

    return this.sumOfWebExLicensesAssigned(siteArray);
  }

  public getLicensesRemaining(centerType) {
    const licensesRemaining = this.calculateLicensesRemaining(centerType);

    return licensesRemaining;
  }

  private hasSitesWithoutLicensesAssigned() {
    let result = false;
    _.each(this.sitesArray, (site) => {
      if (this.getLicensesForSite(site.siteUrl) === 0) {
        result = true;
      }
    });
    return result;
  }

  public enableOrDisableNext(step: Steps) {
    switch (step) {
      case Steps.SITES_LICENSES: {
        let licensesRemaining = 0;
        _.forEach(this.centerDetails, (center) => {
          licensesRemaining += this.calculateLicensesRemaining(center.centerType);
        });

        const sitesWithoutLicenses = this.hasSitesWithoutLicensesAssigned();
        _.each(this.licenseDistributionForm.$$controls, (control) => { control.$validate(); });
        const invalidData = this.licenseDistributionForm.$invalid || licensesRemaining !== 0 || sitesWithoutLicenses;
        if (!invalidData) {
          this.updateSitesLicenseCount();
        }
        _.set(this.$scope.wizard, 'isNextDisabled', invalidData);
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

  public getSitesAudioPackageDisplay() {
    const audioPackage = this.SetupWizardService.getPendingAudioLicenses();
    if (_.isEmpty(audioPackage)) {
      return null;
    }
    let audioPackageDisplay = this.$translate.instant('subscriptions.licenseTypes.' + audioPackage[0].offerName);
    if (this.audioPartnerName) {
      audioPackageDisplay = this.$translate.instant('firstTimeWizard.conferencingAudioProvided', {
        partner:  this.audioPartnerName,
        service: audioPackageDisplay,
      });
    }
    return audioPackageDisplay;
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
    if (!this.audioPartnerName || !this.ccasp.subscriptionId) {
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
    //if it doesn't exit build
    if (_.isEmpty(this.distributedLicensesArray)) {
      this.distributedLicensesArray = _.map(this.sitesArray, (site: IWebExSite) => {
        return _.map(this.centerDetails, (center) => {
          return new WebExSite({ centerType: center.centerType, quantity: site.quantity || 0, siteUrl: site.siteUrl, timezone: site.timezone, setupType: site.setupType });
        });
      });
      this.mergeExistingWebexSites();
    }
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

  // For existing trials that have a WebEx site, we will allow the customer to migrate the trial site into a paid subscription
  public findExistingWebexTrialSites(): void {
    const conferencingServices = _.filter(this.Authinfo.getConferenceServices(), { license: { isTrial: true } });
    const existingTrials = _.filter(conferencingServices, (service: IConferenceService) => {
      return _.includes([this.Config.offerCodes.EE, this.Config.offerCodes.MC, this.Config.offerCodes.EC, this.Config.offerCodes.TC, this.Config.offerCodes.SC], service.license.offerName);
    });

    _.forEach(existingTrials, (trial: IConferenceService) => {
      if (_.has(trial, 'license.siteUrl')) {
        this.existingSites.push(new ExistingWebexTrialSite({ centerType: trial.license.offerName, quantity: trial.license.volume, siteUrl: _.get<string>(trial, 'license.siteUrl').replace(this.Config.siteDomainUrl.webexUrl, ''), timezone: undefined, setupType: this.Config.setupTypes.trialConvert, keepExistingSite: true }));
      }
    });
  }

  // In the case of modify orders, the order will apply to an active subscription.
  // If we have WebEx licenses, we need pull those siteUrls and include them in the provision context
  public findExistingWebexSites(): void {
    const actingSubscriptionLicenses = this.SetupWizardService.getActingSubscriptionLicenses();
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

  private showError(msg, errorType?: SiteErrorType) {
    this.error.isError = true;
    this.error.errorMsg = msg;
    if (!_.isUndefined(errorType)) {
      this.error.errorType = errorType;
    }
    this.disableValidateButton = false;
  }

  private clearError(): void {

    this.error.isError = false;
    this.error.errorMsg = '';
    delete this.error.errorType;
  }

  private clearWebexSiteInputs(): void {
    this.siteModel.siteUrl = '';
    this.siteModel.timezone = '';
    this.siteModel.setupType = undefined;
  }

  private constructWebexLicensesPayload(): IWebexLicencesPayload {
    const webexSiteDetailsList: WebExSite[] = [];
    const webexLicensesPayload: IWebexLicencesPayload = {
      provisionOrder: true,
      sendCustomerEmail: false,
      serviceOrderUUID: this.SetupWizardService.getActingSubscriptionServiceOrderUUID(),
    };

    const distributedLicenses = _.flatten(this.distributedLicensesArray);
    _.forEach(distributedLicenses, (site: WebExSite) => {
      if (_.get(site, 'quantity', 0) > 0) {
        const siteUrl = site.siteUrl + this.Config.siteDomainUrl.webexUrl;
        const webexSiteDetail = new WebExSite({ centerType: site.centerType, quantity: _.get<number>(site, 'quantity', 0), siteUrl: siteUrl, timezone: _.get<string>(site, 'timezone.timeZoneId'), setupType: site.setupType });
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
