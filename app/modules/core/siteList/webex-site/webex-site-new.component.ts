import { IWebExSite, ISiteNameError, SiteErrorType } from 'modules/core/setupWizard/meeting-settings/meeting-settings.interface';
import { Config } from 'modules/core/config/config';
import { TrialTimeZoneService } from 'modules/core/trials/trialTimeZone.service';
import { TrialWebexService } from 'modules/core/trials/trialWebex.service';
import { EventNames } from './webex-site.constants';

class WebexSiteNewCtrl implements ng.IComponentController {

  public siteModel: IWebExSite = {
    siteUrl: '',
    timezone: '',
    centerType: '',
    quantity: 0,
  };
  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private $scope: ng.IScope,
    private Analytics,
    private Config: Config,
    private TrialTimeZoneService: TrialTimeZoneService,
    private TrialWebexService: TrialWebexService,

  ) {

  }
  public siteSetupForm: ng.IFormController;
  public siteErrorType = SiteErrorType;
  public error: ISiteNameError = {
    isError: false,
    errorMsg: '',
  };

  public setupTypeLegacy = this.Config.setupTypes.legacy;
  public currentSubscription = '';
  public selectTimeZonePlaceholder = this.$translate.instant('firstTimeWizard.selectTimeZonePlaceholder');
  public timeZoneOptions;
  public audioPackage;
  public disableValidateButton = false;
  public onSitesAdd: Function;
  public onValidationStatusChange: Function;
  public onSendTracking: Function;
  public sitesArray: IWebExSite[];
  public newSitesArray: IWebExSite[] = [];
  public existingSitesArray: IWebExSite[] = [];
  public audioPartnerName?: string;

  public $onInit(): void {
    this.timeZoneOptions = this.TrialTimeZoneService.getTimeZones();
    this.$scope.$on(EventNames.ADD_SITES, () => {
      this.onSitesAdd({ sites: this.newSitesArray, isValid: true });
    });
    // existingSitesArray has list of sites that can no be deleted: preexisting sites in subscription,
    // trial, or transferred sites
    this.existingSitesArray = _.cloneDeep(this.sitesArray);
    this.newSitesArray = _.remove(this.existingSitesArray, function(site) {
      return site.setupType !== 'TRANSFER' &&  ! _.get(site, 'keepExistingSite');
    });
  }

  public addSite(site) {
    this.newSitesArray.push(site);
    this.onValidationStatusChange({ isValid: true });
  }

  public removeSite(index: number): void {
    const siteObj = this.newSitesArray[index];
    this.newSitesArray.splice(index, 1);
    const properties = { siteUrl: _.get(siteObj, 'siteUrl') + this.Config.siteDomainUrl.webexUrl, timezone: _.get(siteObj, 'timezone') };
    this.sendTracking(this.Analytics.sections.WEBEX_SITE_MANAGEMENT.eventNames.REMOVE_SITE, properties);
    this.onValidationStatusChange({ isValid: this.newSitesArray.length > 0 });
  }

  public userManagementOptionChange() {
    const clientVersion = this.siteModel.setupType === _.get(this.Config, 'setupTypes.legacy')
      ? this.Config.userManagementService.webexSiteAdmin
      : this.Config.userManagementService.sparkControlHub;
    this.sendTracking(this.Analytics.sections.WEBEX_SITE_MANAGEMENT.eventNames.CLIENT_VERSION_RADIO, { clientVersionSelected: clientVersion });
    this.clearError();
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
    if (this.siteModel.setupType === undefined) {
      this.showError(this.$translate.instant('firstTimeWizard.meetingSettingsError.noUserManagementSelected'), this.siteErrorType.USER_MGMT);
      return;
    }
    if (_.some(this.newSitesArray, { siteUrl: this.siteModel.siteUrl })) {
      this.showError(this.$translate.instant('firstTimeWizard.meetingSettingsError.duplicateSite'), this.siteErrorType.URL);
      return;
    }
    const siteName = this.siteModel.siteUrl.concat(this.Config.siteDomainUrl.webexUrl);
    this.validateWebexSiteUrl(siteName).then((response) => {
      if (response.isValid && (response.errorCode === 'validSite')) {
        //SparkControlHub user management means there is no setupType
        if (this.siteModel.setupType !== this.setupTypeLegacy) {
          delete this.siteModel.setupType;
          this.siteModel.isCIUnifiedSite = true;
        }
        this.addSite(_.clone(this.siteModel));
        const properties = {
          siteUrl: this.siteModel.siteUrl + this.Config.siteDomainUrl.webexUrl,
          timezoneSelected: _.get(this.siteModel, 'timezone'),
        };
        this.clearWebexSiteInputs();
        this.sendTracking(this.Analytics.sections.WEBEX_SITE_MANAGEMENT.eventNames.NEW_SITE_ADDED, properties);
      } else {
        if (response.errorCode === 'duplicateSite') {
          this.showError(this.$translate.instant('firstTimeWizard.meetingSettingsError.duplicateSite'), this.siteErrorType.URL);
          this.sendTracking(this.Analytics.sections.WEBEX_SITE_MANAGEMENT.eventNames.DUPLICATE_WEBEX_SITE, { webexSiteUrl: siteName });
        } else {
          this.showError(this.$translate.instant('firstTimeWizard.meetingSettingsError.enteredSiteNotValid'), this.siteErrorType.URL);
          this.sendTracking(this.Analytics.sections.WEBEX_SITE_MANAGEMENT.eventNames.INVALID_WEBEX_SITE, { webexSiteUrl: siteName });
        }
        return;
      }
    }).catch(() => {
      this.clearWebexSiteInputs();
    }).finally(() => {
      this.disableValidateButton = false;
    });
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

  public onInputChange() {
    this.clearError();
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
    this.siteModel.isCIUnifiedSite = undefined;
  }

  private sendTracking(event: string, properties: {}) {
    if (typeof this.onSendTracking === 'function') {
      this.onSendTracking({
        event: event,
        properties: properties,
      });
    }
  }

  public getSitesAudioPackageDisplay() {
    if (!(this.audioPackage)) {
      return null;
    }

    const audioPackageType = this.$translate.instant('subscriptions.licenseTypes.' + this.audioPackage);
    let audioPackageDisplay = this.$translate.instant('firstTimeWizard.audioPackageWithType', { type: audioPackageType });
    if (this.audioPartnerName) {
      audioPackageDisplay = this.$translate.instant('firstTimeWizard.conferencingAudioProvidedShort', {
        partner:  this.audioPartnerName,
        service: audioPackageDisplay,
      });
    }
    return audioPackageDisplay;
  }
}

export class WebexSiteNewComponent implements ng.IComponentOptions {
  public controller = WebexSiteNewCtrl;
  public template = require('./webex-site-new.html');
  public bindings = {
    sitesArray: '<',
    onSitesAdd: '&',
    onValidationStatusChange: '&',
    onSendTracking: '&?',
    audioPackage: '<',
    audioPartnerName: '<',
  };
}
