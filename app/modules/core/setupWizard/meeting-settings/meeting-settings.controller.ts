import './_meeting-settings.scss';
import { IWebExSite, ISiteNameError, IConferenceService, IExistingTrialSites, IWebexSiteDetail, IWebexLicencesPayload } from './meeting-settings.interface';

export class MeetingSettingsCtrl {
  public siteModel: IWebExSite = {
    name: '',
    timeZone: '',
    centerType: 'MC',
    licenseCount: 0,
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
    private Orgservice,
    private TrialTimeZoneService,
    private TrialWebexService,
  ) {
    this.init();
  }

  private init(): void {
    this.findExistingWebexTrialSites();
    this.Orgservice.getLicensesUsage().then((subscriptions) => {
      this.actingSubscriptionId = subscriptions[0].internalSubscriptionId;
    });
    this.$rootScope.$on('wizard-meeting-settings-setup-save-event', (): void => {
      this.provisionWebexSites();
    });
  }

  public onInputChange() {
    this.clearError();
  }

  public onClickValidate(): void {
    this.disableValidateButton = true;
    if (_.isEmpty(this.siteModel.name)) {
      this.showError(this.$translate.instant('firstTimeWizard.pleaseEnterSiteName'));
      return;
    }

    if (_.isEmpty(this.siteModel.timeZone)) {
      this.showError(this.$translate.instant('firstTimeWizard.pleaseSelectTimeZone'));
      return;
    }

    const siteName = this.siteModel.name.concat(this.Config.siteDomainUrl.webexUrl);
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
      return Number(site.licenseCount);
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
        return s.name === site.name;
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
          name: trial.siteUrl.replace(this.Config.siteDomainUrl.webexUrl, ''),
          licenseCount: 0,
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
    this.siteModel.name = '';
    this.siteModel.timeZone = '';
  }

  private constructWebexLicensesPayload() {
    const webexSiteDetailsList: IWebexSiteDetail[] = [];
    _.forEach(this.sitesArray, (site) => {
      const webexSiteDetail: IWebexSiteDetail = {
        siteUrl: site.name + this.Config.siteDomainUrl.webexUrl,
        timezone: _.get<string>(site, 'timeZone.timeZoneId'),
        centerType: site.centerType,
        quantity: _.get<number>(site, 'licenseCount'),
      };

      webexSiteDetailsList.push(webexSiteDetail);
    });

    const webexLicensesPayload: IWebexLicencesPayload = {
      provisionOrder: true,
      serviceOrderUUID: null,
      webexProvisioningParams: {
        webexSiteDetailsList: webexSiteDetailsList,
        audioPartnerName: 'somepartner@gmail.com',
      },
    };

    return webexLicensesPayload;
  }

  private getActingSubscriptionId(): string {
    return this.actingSubscriptionId;
  }

  private provisionWebexSites(): void {
    const webexLicenses: IWebexLicencesPayload = this.constructWebexLicensesPayload();
    const subscriptionId: string = this.getActingSubscriptionId();

    this.TrialWebexService.provisionWebexSites(webexLicenses, subscriptionId)
      .then(() => {
        this.handleWebexProvisioningSuccess();
      })
      .catch((response) => {
        this.handleWebexProvisioningError(response);
      });
  }

  private handleWebexProvisioningSuccess() {
    this.Notification.success('firstTimeWizard.webexProvisioningSuccess');
  }

  private handleWebexProvisioningError(response) {
    this.Notification.errorWithTrackingId(response, 'firstTimeWizard.webexProvisioningError');
  }

}

angular
  .module('core.meeting-settings', [])
  .controller('MeetingSettingsCtrl', MeetingSettingsCtrl);
