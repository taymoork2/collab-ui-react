import './_meeting-settings.scss';
import { IWebExSite, ISiteNameError, IConferenceService, IExistingTrialSites, IWebexLicencesPayload } from './meeting-settings.interface';

export class MeetingSettingsCtrl {
  public siteModel: IWebExSite = {
    siteUrl: '',
    timezone: '',
    centerType: 'EE',
    quantity: 0,
  };

  // hardcoded till we can get this info from an API
  private licensesPurchased = 100;

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
    private SetupWizardService,
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
      this.SetupWizardService.addProvisioningCallbacks({meetingSettings: () => {
        return this.TrialWebexService.provisionWebexSites().then(() => {
          this.Notification.success('firstTimeWizard.webexProvisioningSuccess');
        }).catch((response) => {
          this.Notification.errorWithTrackingId(response, 'firstTimeWizard.webexProvisioningError');
        });
      }});
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
  }

  public sumOfWebExLicensesAssigned() {
    const result = _.sumBy(this.sitesArray, (site: IWebExSite) => {
      return Number(site.quantity);
    });

    return result;
  }

  public calculateLicensesRemaining() {
    const licensesRemaining = this.licensesPurchased - this.sumOfWebExLicensesAssigned();
    if (licensesRemaining < 0) {
      return 0;
    }

    return licensesRemaining;
  }

  public enableOrDisableNext() {
    _.set(this.$scope.wizard, 'isNextDisabled', this.sumOfWebExLicensesAssigned() !== this.licensesPurchased);
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

  private findExistingWebexTrialSites(): void {
    const conferencingServices = _.filter(this.Authinfo.getConferenceServices(), { license: { isTrial: true } });
    const existingTrials = _.find(conferencingServices, (service: IConferenceService) => {
      return service.license.offerName === this.Config.offerCodes.EE || service.license.offerName === this.Config.offerCodes.MC;
    });

    _.forEach(existingTrials, (trial) => {
      if (_.has(trial, 'siteUrl')) {
        this.existingSites.push({
          siteUrl: trial.siteUrl.replace(this.Config.siteDomainUrl.webexUrl, ''),
          quantity: 0,
          centerType: 'MC',
          keepExistingSite: true,
        });
      }
    });
  }

  private validateWebexSiteUrl(siteName): ng.IPromise<any> {
    return this.TrialWebexService.validateSiteUrl(siteName);
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
      serviceOrderUUID: this.SetupWizardService.getActingSubscriptionServiceOrderUUID(),
    };

    if (_.isEmpty(this.sitesArray)) {
      return webexLicensesPayload;
    }

    _.forEach(this.sitesArray, (site) => {
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
