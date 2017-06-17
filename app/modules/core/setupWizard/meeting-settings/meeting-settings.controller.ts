import './_meeting-settings.scss';
import { IWebExSite, ISiteNameError, IConferenceService, IExistingTrialSites } from './meeting-settings.interface';

export class MeetingSettingsCtrl {
  public siteModel: IWebExSite = {
    name: '',
    timeZone: '',
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

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private Authinfo,
    private Config,
    private TrialTimeZoneService,
    private TrialWebexService,
  ) {
    this.init();
  }

  private init(): void {
    this.findExistingWebexTrialSites();
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

}

angular
  .module('core.meeting-settings', [])
  .controller('MeetingSettingsCtrl', MeetingSettingsCtrl);
