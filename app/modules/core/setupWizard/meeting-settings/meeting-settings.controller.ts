import './_meeting-settings.scss';
import { IWebExSite, ISiteNameError, IConferenceService, IExistingTrialSites, IWebexLicencesPayload, IPendingLicense } from './meeting-settings.interface';
import { SetupWizardService } from '../setup-wizard.service';

export class MeetingSettingsCtrl {
  public siteModel: IWebExSite = {
    siteUrl: '',
    timezone: '',
    centerType: 'EE',
    quantity: 0,
  };

  public error: ISiteNameError = {
    isError: false,
    errorMsg: '',
  };

  public existingSites: IExistingTrialSites[] = [];
  public disableValidateButton: boolean = false;
  public selectTimeZonePlaceholder = this.$translate.instant('firstTimeWizard.selectTimeZonePlaceholder');
  public timeZoneOptions = this.TrialTimeZoneService.getTimeZones();
  public sitesArray: IWebExSite[] = [];
  public actingSubscriptionId = '';
  public distributedLicensesArray: IWebExSite[][];
  public centerDetails = this.getWebExMeetingsLicenseTypeDetails();

  /* @ngInject */
  constructor(
    public $scope,
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
    this.findExistingWebexTrialSites();

    // If user clicked back after setting WebEx sites in the meeting-settings tab, we want to preserve the entered sites
    const webexSitesData = this.TrialWebexService.getProvisioningWebexSitesData();
    if (!_.isEmpty(webexSitesData)) {
      this.updateSitesArray(_.get(webexSitesData, 'webexLicencesPayload.webexProvisioningParams.webexSiteDetailsList'));
    }

    this.$rootScope.$on('wizard-meeting-settings-setup-save-event', (): void => {
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
    });
  }

  public onInputChange() {
    this.clearError();
  }

  private updateSitesArray(sites) {
    const sitesArray = _.map(sites, (site: any) => {
      const timezone = this.findTimezoneObject(site.timezone);
      return {
        quantity: _.parseInt(site.quantity),
        siteUrl: site.siteUrl.replace(this.Config.siteDomainUrl.webexUrl, ''),
        timezone: timezone,
        centerType: site.centerType,
      };
    });

    this.sitesArray = sitesArray;
  }

  private findTimezoneObject(timezoneId) {
    return _.find(this.timeZoneOptions, { timeZoneId: timezoneId });
  }

  public onClickValidate(): void {
    this.disableValidateButton = true;
    if (_.isEmpty(this.siteModel.siteUrl)) {
      this.showError(this.$translate.instant('firstTimeWizard.pleaseEnterSiteName'));
      return;
    }

    if (_.isEmpty(this.siteModel.timezone)) {
      this.showError(this.$translate.instant('firstTimeWizard.pleaseSelectTimeZone'));
      return;
    }

    const siteName = this.siteModel.siteUrl.concat(this.Config.siteDomainUrl.webexUrl);
    this.validateWebexSiteUrl(siteName).then((response) => {
      if (response.isValid && (response.errorCode === 'validSite')) {
        this.sitesArray.push(_.clone(this.siteModel));
        this.constructDistributedSitesArray();
        this.clearInputs();
      } else if (!response.isValid && (response.errorCode === 'invalidSite')) {
        this.showError(this.$translate.instant('firstTimeWizard.enteredSiteNotValid'));
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

  public getLicensesAssignedTotal(centerType) {
    const siteArray = _.filter(_.flatten(this.distributedLicensesArray), { centerType: centerType });

    return this.sumOfWebExLicensesAssigned(siteArray);
  }

  public getLicensesRemaining(centerType) {
    const licensesRemaining = this.calculateLicensesRemaining(centerType);
    if (licensesRemaining < 0) {
      return 0;
    }

    return licensesRemaining;
  }

  public enableOrDisableNext() {
    let licensesRemaining = 0;

    _.forEach(this.centerDetails, (center) => {
      licensesRemaining += this.calculateLicensesRemaining(center.centerType);
    });

    _.set(this.$scope.wizard, 'isNextDisabled', licensesRemaining !== 0);
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
        return {
          centerType: center.centerType,
          quantity: site.quantity,
          siteUrl: site.siteUrl,
          timezone: site.timezone,
        };
      });
    });
  }

  private findExistingWebexTrialSites(): void {
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

      webexSiteDetailsList.push(webexSiteDetail);
    });

    _.set(webexLicensesPayload, 'webexProvisioningParams', {
      webexSiteDetailsList: webexSiteDetailsList,
      audioPartnerName: null,
    });

    return webexLicensesPayload;
  }

}

angular
  .module('core.meeting-settings', [])
  .controller('MeetingSettingsCtrl', MeetingSettingsCtrl);
