import './_meeting-settings.scss';
import { Config } from 'modules/core/config/config';
import { IConferenceLicense, IConferenceService, IPendingLicense, IWebexLicencesPayload, IWebExSite } from './meeting-settings.interface';
import { WebExSite, ExistingWebExSite } from './meeting-settings.model';
import { SetupWizardService } from '../setup-wizard.service';
import { Notification } from 'modules/core/notifications';

interface ICCASPData {
  partnerOptions: string[];
  partnerNameSelected: string | null;
  subscriptionId: string;
  isError: boolean;
}

interface IDecouplingFlowAnalyticsProperties {
  subscriptionId: string | undefined;
  view: string;
  clientVersionSelected?: string | undefined;
  webexSiteUrl?: string;
  siteUrl?: string;
  transferCode?: string;
  trackingId?: string;
  keepExistingSiteCheckboxSelected?: boolean;
  audioPartnerSelected?: string;
}

export class MeetingSettingsCtrl {
  public siteModel: IWebExSite = {
    siteUrl: '',
    timezone: '',
    centerType: '',
    quantity: 0,
  };

  public setupTypeLegacy = this.Config.setupTypes.legacy;
  public ccaspForm: ng.IFormController;
  public existingTrialSites: ExistingWebExSite[] = [];
  public existingWebexSites: WebExSite[] = [];
  public webexSitesFromTransferredSubscriptionServices: WebExSite[] = [];
  public disableValidateButton: boolean = false;
  public timeZoneOptions = this.TrialTimeZoneService.getTimeZones();
  public sitesArray: IWebExSite[] = [];
  public actingSubscriptionId = '';
  public tspPartnerOptions: any[] = [];
  public audioPartnerName: string | null = null;
  public dropdownPlaceholder = this.$translate.instant('common.select');
  public hasTrialSites: boolean = false;
  public transferSiteUrl = '';
  private transferSiteCode = '';
  public ccasp: ICCASPData = {
    partnerOptions: [],
    partnerNameSelected: null,
    subscriptionId: '',
    isError: false,
  };

  private result = null;
  public migrateSiteUrl = this.Config.webexSiteMigrationUrl;
  public pendingMeetingLicenses;
  public sitesLicensesData: IWebExSite[];

  /* @ngInject */
  constructor(
    private $q: ng.IQService,
    public $scope,
    public $timeout: ng.ITimeoutService,
    private $stateParams: ng.ui.IStateParamsService,
    private $state: ng.ui.IStateService,
    private $translate: ng.translate.ITranslateService,
    private $rootScope: ng.IRootScopeService,
    private Analytics,
    private Authinfo,
    private Config: Config,
    private Notification: Notification,
    private SetupWizardService: SetupWizardService,
    private TrialTimeZoneService,
    private TrialWebexService,
    private Utils,
  ) {
    this.init();
  }

  /**************************************************
  / Initialization code
  */

  private init(): void {
    this.$scope.$watch(() => { return this.sitesArray.length; }, () => {
      this.enableOrDisableNextForSiteSetup();
    });
    this.pendingMeetingLicenses = _.reject(this.SetupWizardService.getPendingMeetingLicenses(), (license: IPendingLicense) => {
      return license.offerName === 'CF' || license.offerName === 'CMR';
    });
    this.existingTrialSites = this.findExistingWebexTrialSites();
    this.existingWebexSites = this.findExistingWebexSites();

    /* Sometimes subscription services are transferred to another subscription;
    those WebEx sites need to be merged into the new subscription. */
    const pendingTransferServices = this.SetupWizardService.getActingSubscriptionPendingTransferServices();
    this.webexSitesFromTransferredSubscriptionServices = this.findExistingWebexSites(pendingTransferServices);
    this.existingWebexSites = this.existingWebexSites.concat(this.webexSitesFromTransferredSubscriptionServices);

    // If user clicked back after setting WebEx sites in the meeting-settings tab, we want to preserve the entered sites
    const webexSitesData = this.TrialWebexService.getProvisioningWebexSitesData();
    if (!_.isEmpty(webexSitesData)) {
      this.sitesLicensesData = _.get(webexSitesData, 'webexLicencesPayload.webexProvisioningParams.webexSiteDetailsList');
      this.updateSitesArray(this.sitesLicensesData);
      this.audioPartnerName = _.get(webexSitesData, 'webexLicencesPayload.webexProvisioningParams.audioPartnerName', null);
      this.ccasp.subscriptionId = _.get(webexSitesData, 'webexLicencesPayload.webexProvisioningParams.ccaspSubscriptionId', '');
      if (this.ccasp.subscriptionId) {
        this.ccasp.partnerNameSelected = this.audioPartnerName;
      }
    } else {
      this.addExistingWebexSites(this.existingWebexSites);
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
    if (this.SetupWizardService.hasPendingCCAUserPackage()) {
      const active = _.get(this.SetupWizardService.getActiveCCAUserPackage(), 'ccaspPartnerName', null);
      const pending = _.get(this.SetupWizardService.getPendingCCAUserPackage(), 'ccaspPartnerName', null);
      this.audioPartnerName = active || pending;
    }

    this.hasTrialSites = this.SetupWizardService.hasWebexMeetingTrial();
  }

  private updateSitesArray(sites) {
    const existingSitesUrls = _.map(this.existingWebexSites, 'siteUrl');
    const sitesArray = _.chain(sites).uniqBy('siteUrl').map((site: WebExSite) => {
      const timezone = this.findTimezoneObject(site.timezone);
      const siteUrl = site.siteUrl.replace(this.Config.siteDomainUrl.webexUrl, '');
      const keepExistingSite = _.includes(existingSitesUrls, siteUrl);
      return new ExistingWebExSite({
        centerType: '',
        quantity: 0,
        siteUrl: siteUrl,
        timezone: timezone,
        setupType: site.setupType,
        keepExistingSite: keepExistingSite,
        isCIUnifiedSite: site.isCIUnifiedSite,
      });
    }).value();
    this.sitesArray = sitesArray;
  }

  private findTimezoneObject(timezoneId) {
    return _.find(this.timeZoneOptions, { timeZoneId: timezoneId });
  }

  // For existing trials that have a WebEx site, we will allow the customer to migrate the trial site into a paid subscription
  public findExistingWebexTrialSites(): ExistingWebExSite[] {
    let conferencingServices = _.filter(this.Authinfo.getConferenceServices(), { license: { isTrial: true } });
    // Make sure not to touch online trial sites
    conferencingServices = _.reject(conferencingServices, (service: IConferenceService) => {
      return _.includes(service.license.masterOfferName, SetupWizardService.ONLINE_SUFFIX);
    });
    const existingTrials = _.filter(conferencingServices, (service: IConferenceService) => {
      return _.includes([this.Config.offerCodes.EE, this.Config.offerCodes.MC, this.Config.offerCodes.EC, this.Config.offerCodes.TC, this.Config.offerCodes.SC], service.license.offerName);
    });
    const existingTrialSites: ExistingWebExSite[] = [];
    _.forEach(existingTrials, (trial: IConferenceService) => {
      if (_.has(trial, 'license.siteUrl')) {
        existingTrialSites.push(new ExistingWebExSite({
          centerType: trial.license.offerName,
          quantity: trial.license.volume,
          siteUrl: _.get<string>(trial, 'license.siteUrl').replace(this.Config.siteDomainUrl.webexUrl, ''),
          timezone: undefined,
          setupType: this.Config.setupTypes.trialConvert,
          keepExistingSite: true,
          isCIUnifiedSite: trial.license.isCIUnifiedSite,
        }));
      }
    });
    return existingTrialSites;
  }

  /* In the case of modify orders, the order will apply to an active subscription.
  If we have WebEx licenses, we need to pull those siteUrls and include them in
  the provisioning context. */

  public findExistingWebexSites(actingSubscriptionLicenses = this.SetupWizardService.getActingSubscriptionLicenses()): WebExSite[] {
    const includedOfferNames = [this.Config.offerCodes.EE, this.Config.offerCodes.MC, this.Config.offerCodes.EC, this.Config.offerCodes.TC, this.Config.offerCodes.SC];
    let existingConferenceServicesInActingSubscripton = _.filter(actingSubscriptionLicenses, (license: IConferenceLicense) =>
      _.includes(includedOfferNames, license.offerName)) as IConferenceLicense[];
    // Make sure not to touch online trial sites
    existingConferenceServicesInActingSubscripton = _.reject(existingConferenceServicesInActingSubscripton, (license: IConferenceLicense) => {
      return _.includes(license.masterOfferName, SetupWizardService.ONLINE_SUFFIX);
    });
    // Create an array of existing sites
    const existingWebexSites = _.map(existingConferenceServicesInActingSubscripton, (license) => {
      return new WebExSite({
        siteUrl: _.replace(_.get<string>(license, 'siteUrl'), this.Config.siteDomainUrl.webexUrl, ''),
        quantity: license.volume,
        centerType: license.offerName,
        setupType: (license.isCIUnifiedSite !== true) ? this.setupTypeLegacy : undefined,
        isCIUnifiedSite: license.isCIUnifiedSite,
      });
    });

    return existingWebexSites;
  }

  private addExistingWebexSites(existingWebexSites: WebExSite[]): void {
    // Push unique sites to sitesArray
    if (_.isEmpty(existingWebexSites)) {
      return;
    }
    this.sitesArray = this.sitesArray.concat(_.map(_.uniqBy(existingWebexSites, 'siteUrl'), (site) => {
      return new ExistingWebExSite({
        siteUrl: _.replace(_.get<string>(site, 'siteUrl'), this.Config.siteDomainUrl.webexUrl, ''),
        quantity: 0,
        centerType: '',
        keepExistingSite: true,
        setupType: site.setupType,
        isCIUnifiedSite: site.isCIUnifiedSite,
      });
    }));
  }

  /*******************************************************************************************
  / Migrate Trial Step
  */

  public addTransferredSites(sites, transferCode, isValid, transferSiteUrl) {
    this.result = isValid;
    if (isValid) {
      this.stripTransferredSitesFromSitesArray();
      this.sitesArray = _.concat(this.sitesArray, sites);
      this.transferSiteCode = transferCode;
      this.transferSiteUrl = transferSiteUrl;
    }
  }

  public migrateTrialNext(): ng.IPromise<any> {
    return this.doDeferredNext('core::validateTransferSites');
  }

  private stripTransferredSitesFromSitesArray() {
    this.sitesArray = _.filter(this.sitesArray, (site) => {
      return site.setupType !== this.Config.setupTypes.transfer;
    });
  }

  public addOrRemoveExistingWebExSite(site) {
    if (site.keepExistingSite) {
      this.sitesArray.push(site);
    } else {
      _.remove(this.sitesArray, (s) => {
        return s.siteUrl === site.siteUrl;
      });
    }
    const properties = {
      keepExistingSiteCheckboxSelected: _.get(site, 'keepExistingSite'),
    };
    this.sendMetrics(this.Analytics.sections.SERVICE_SETUP.eventNames.TRIAL_EXISTING_SITES, properties);
    this.sitesArray = _.uniq(this.sitesArray);
  }

  /*******************************************************************************************
  / Add Sites step
  */

  public addNewSites(sites, isValid) {
    if (isValid) {
      //we are sent the array of sites that can be modified.
      // so new sitesArray consists of sites that can not be modified + what we get back
      this.sitesArray = _.concat(this.getUneditableSites(), sites);
    }
    this.result = isValid;
    this.setNextDisableStatus(!isValid);
  }

  public siteSetupNext(): ng.IPromise<any> {
    return this.doDeferredNext('core::sitesAdded');
  }

  private getUneditableSites() {
    return _.filter(this.sitesArray, (site) => {
      return (site.setupType === 'TRANSFER' || _.get(site, 'keepExistingSite', false));
    });
  }

  /***********************************************************************************
  / License Distribution step
  */

  public updateSitesWithNewDistribution(sitesWithLicenseDetail, isValid) {
    this.result = isValid;
    if (isValid) {
      this.sitesLicensesData = sitesWithLicenseDetail;
    }
    _.set(this.$scope.wizard, 'isNextDisabled', !isValid);
  }

  /******************************************************************************************
  / Summary
  */

  // wizard PromiseHook
  public summaryNext(): ng.IPromise<any> {
    if (this.$stateParams.onlyShowSingleTab) {
      // Call provisioning directly from the meeting-settings modal on overview page
      return this.callProvisioning();
    }
    this.pushProvisioningCallIntoQueue();
    return this.$q.resolve();
  }

  public getLicensesForSite(siteUrl) {
    const total = _.sumBy(_.filter(_.flatten(this.sitesLicensesData), { siteUrl: siteUrl + this.Config.siteDomainUrl.webexUrl }), 'quantity');
    return total;
  }

  /**************************************************
 / Storing provisioning data and service calls
 */

  private pushProvisioningCallIntoQueue(): void {
    const webexLicenses: IWebexLicencesPayload = this.constructWebexLicensesPayload();
    this.TrialWebexService.setProvisioningWebexSitesData(webexLicenses, this.SetupWizardService.getInternalSubscriptionId());
    this.SetupWizardService.addProvisioningCallbacks({
      meetingSettings: () => {
        return this.TrialWebexService.provisionWebexSites().then((response) => {
          this.Notification.success('firstTimeWizard.webexProvisioningSuccess');
          const properties = {
            webexLicensesPayload: webexLicenses,
            trackingId: this.Utils.extractTrackingIdFromResponse(response),
          };
          this.sendMetrics(this.Analytics.sections.SERVICE_SETUP.eventNames.PROVISION_CALL_SUCCESS, properties);
        }).catch((response) => {
          this.Notification.errorWithTrackingId(response, 'firstTimeWizard.webexProvisioningError');
          const properties = {
            webexLicensesPayload: webexLicenses,
            trackingId: this.Utils.extractTrackingIdFromResponse(response),
          };
          this.sendMetrics(this.Analytics.sections.SERVICE_SETUP.eventNames.PROVISION_CALL_FAILURE, properties);
          return this.$q.reject();
        });
      },
    });
  }

  private callProvisioning(): ng.IPromise<any> {
    const webexLicenses: IWebexLicencesPayload = this.constructWebexLicensesPayload();
    this.TrialWebexService.setProvisioningWebexSitesData(webexLicenses, this.SetupWizardService.getInternalSubscriptionId());
    return this.TrialWebexService.provisionWebexSites().then((response) => {
      this.Notification.success('firstTimeWizard.webexProvisioningSuccess');
      const properties = {
        webexLicensesPayload: webexLicenses,
        trackingId: this.Utils.extractTrackingIdFromResponse(response),
      };
      this.sendMetrics(this.Analytics.sections.SERVICE_SETUP.eventNames.PROVISION_CALL_SUCCESS, properties);
      this.$rootScope.$emit('meeting-settings-services-setup-successful');
    }).catch((response) => {
      this.Notification.errorWithTrackingId(response, 'firstTimeWizard.webexProvisioningError');
      const properties = {
        webexLicensesPayload: webexLicenses,
        trackingId: this.Utils.extractTrackingIdFromResponse(response),
      };
      this.sendMetrics(this.Analytics.sections.SERVICE_SETUP.eventNames.PROVISION_CALL_FAILURE, properties);
      return this.$q.reject();
    });
  }

  private constructWebexLicensesPayload(): IWebexLicencesPayload {
    const webexLicensesPayload: IWebexLicencesPayload = {
      provisionOrder: true,
      sendCustomerEmail: false,
      serviceOrderUUID: this.SetupWizardService.getActingSubscriptionServiceOrderUUID(),
    };

    _.set(webexLicensesPayload, 'webexProvisioningParams', {
      webexSiteDetailsList: this.sitesLicensesData,
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

  /********************************************************************************************
  / 'Next' behavior and functions
  */

  public setNextDisableStatus(status) {
    _.set(this.$scope.wizard, 'isNextDisabled', status);
  }

  public enableOrDisableNextForSiteSetup() {
    if (_.get(this.$scope.wizard, 'current.step.name') === 'siteSetup') {
      const invalid = this.sitesArray.length === 0;
      this.setNextDisableStatus(invalid);
    }
  }

 /* wizard has a stepNext() promise hook that requires to perform some action and resolve promise that's succesful.
 /* if promise is resolved - we  go to the next screen.
 /* This function emits the event that gets picked up by corresponding control.
 /* control performs some function and calls the ballback function that sets the `result` property.
 /* this uses the `watch` to see if result is updated. If it's succesful it resolves the promise otherwise it rejects
 */

  private doDeferredNext(eventName): ng.IPromise<any> {
    const deferred = this.$q.defer();
    const unbindWatch = this.$scope.$watch(() => { return this.result; }, (newValue) => {
      if (newValue === true) {
        deferred.resolve();
        unbindWatch();
      } else if (newValue === false) {
        deferred.reject();
        unbindWatch();
      }
    });

    this.$rootScope.$broadcast(eventName);
    return deferred.promise;
  }

  /*
  Audio partner
  */

  public getSitesAudioPackageTypeDisplay(): string | null {
    const audioPackage = this.SetupWizardService.getPendingAudioLicense();
    if (_.isUndefined(audioPackage)) {
      return null;
    }
    const audioPackageType = this.$translate.instant('subscriptions.licenseTypes.' + audioPackage.offerName);
    const audioPackageTypeDisplay = this.$translate.instant('firstTimeWizard.audioPackageWithType', { type: audioPackageType });

    return audioPackageTypeDisplay;
  }

  public getSitesAudioPartnerDisplay(): string | null {
    const audioPackage = this.SetupWizardService.getPendingAudioLicense();
    if (!this.audioPartnerName) {
      return null;
    }

    let audioPartnerDisplay = this.$translate.instant('subscriptions.licenseTypes.' + audioPackage.offerName);

    audioPartnerDisplay = this.$translate.instant('firstTimeWizard.conferencingAudioProvided', {
      partner: this.audioPartnerName,
      service: audioPartnerDisplay,
    }, undefined, undefined, 'sceParameters');

    return audioPartnerDisplay;
  }

  public audioPartnerSelectionChange() {
    const properties = {
      audioPartnerSelected: this.audioPartnerName,
    };
    this.sendMetrics(this.Analytics.sections.SERVICE_SETUP.eventNames.AUDIO_PARTNER_SELECTED, properties);
    this.setNextDisableStatus(false);
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
      .then((response) => {
        const isValid = _.get(response, 'isValid');
        this.ccaspSetInvalid(!isValid);
        if (isValid) {
          this.audioPartnerName = this.ccasp.partnerNameSelected || null;
        }
        const properties = {
          trackingId: this.Utils.extractTrackingIdFromResponse(response),
          payload: _.get(response, 'payload'),
        };
        this.sendMetrics(this.Analytics.sections.SERVICE_SETUP.eventNames.CCASP_VALIDATION_SUCCESS, properties);
      })
      .catch((response) => {
        this.ccaspSetInvalid(true);
        const properties = {
          trackingId: this.Utils.extractTrackingIdFromResponse(response),
          payload: _.get(response, 'payload'),
        };
        this.sendMetrics(this.Analytics.sections.SERVICE_SETUP.eventNames.CCASP_VALIDATION_FAILURE, properties);
      });
  }

  public ccaspSetNextDisabled() {
    if (!this.audioPartnerName || !this.ccasp.subscriptionId) {
      this.setNextDisableStatus(true);
    }
  }

  public tspSetNextDisabled() {
    if (!this.audioPartnerName) {
      this.setNextDisableStatus(true);
    }
  }


  public sendMetrics(event, properties?) {
    const analyticsProperties: IDecouplingFlowAnalyticsProperties = {
      subscriptionId: this.SetupWizardService.getActingSubscriptionId(),
      view: _.get(this.$state, 'current.data.firstTimeSetup') ? 'Service Setup' : 'overview: Meeting Settings Modal',
    };
    _.assignIn(analyticsProperties, properties);
    // events sent by components are generic and don't have \'Service Setup\' prefix. If prefix not there -- add it
    if (!_.includes(event, this.Analytics.sections.SERVICE_SETUP.name)) {
      event = this.Analytics.sections.SERVICE_SETUP.name + ': ' + event;
    }
    this.Analytics.trackServiceSetupSteps(event, analyticsProperties);
  }
}

angular
  .module('core.meeting-settings', [])
  .controller('MeetingSettingsCtrl', MeetingSettingsCtrl);
