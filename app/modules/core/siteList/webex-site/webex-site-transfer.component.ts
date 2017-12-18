import { IWebExSite, ISiteNameError } from 'modules/core/setupWizard/meeting-settings/meeting-settings.interface';
import { SetupWizardService } from 'modules/core/setupWizard/setup-wizard.service';
import { Config } from 'modules/core/config/config';
import { TrialTimeZoneService } from 'modules/core/trials/trialTimeZone.service';
import { Notification } from 'modules/core/notifications';
import { EventNames } from './webex-site.constants';

class WebexSiteTransferCtrl implements ng.IComponentController {

  public currentSubscription;
  public showTransferCodeInput;
  public transferSiteCode;
  public migrateSiteUrl;
  public transferSiteUrl;
  public introCopy;
  public error: ISiteNameError = {
    isError: false,
    errorMsg: '',
  };
  public sitesArray: IWebExSite[] = [];
  public onValidationStatusChange: Function;
  public onSitesReceived: Function;
  public onSendTracking: Function;

  public siteModel: IWebExSite = {
    siteUrl: '',
    timezone: '',
    centerType: '',
    quantity: 0,
  };

  private timeZoneOptions;

  private errorCodes = {
    400303: 'firstTimeWizard.transferCodeInvalidError',
    400304: 'firstTimeWizard.transferCodeInvalidSite',
  };

  /* @ngInject */
  constructor(
    private $q: ng.IQService,
    private $scope: ng.IScope,
    private $translate: ng.translate.ITranslateService,
    private Analytics,
    private Config: Config,
    private Notification: Notification,
    private SetupWizardService: SetupWizardService,
    private TrialTimeZoneService: TrialTimeZoneService,
    private Utils,
  ) {
    this.migrateSiteUrl = this.Config.webexSiteMigrationUrl;
  }

  public $onInit() {
    this.timeZoneOptions = this.TrialTimeZoneService.getTimeZones();
    this.showTransferCodeInput = !_.isEmpty(this.transferSiteCode) &&  !_.isEmpty(this.transferSiteUrl);
    this.$scope.$on(EventNames.VALIDATE_TRANSFER_SITE, () => {
      this.processNext();
    });
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
    } else {
      this.transferSiteUrl = null;
      this.transferSiteCode = null;
    }
    this.onValidationStatusChange({ isValid: !invalid });

  }

  public processNext() {
    this.migrateTrialNext().then(() => {
      this.onSitesReceived({
        sites: this.sitesArray,
        transferCode: this.transferSiteCode,
        isValid: true,
        transferSiteUrl: this.transferSiteUrl,
      });
    })
      .catch(() => {
        this.onValidationStatusChange({ isValid: false });
        this.onSitesReceived({ sites: null, transferCode: null, isValid: false });
      });
  }

  public migrateTrialNext(): ng.IPromise<any> {
    if (_.isEmpty(this.transferSiteUrl) && _.isEmpty(this.transferSiteCode)) {
      this.sitesArray = [];
      return this.$q.resolve();
    }
    const transferSiteDetails = {
      siteUrl: this.transferSiteUrl,
      transferCode: this.transferSiteCode,
    };
    if (!(_.endsWith(transferSiteDetails.siteUrl, this.Config.siteDomainUrl.webexUrl))) {
      transferSiteDetails.siteUrl += this.Config.siteDomainUrl.webexUrl;
    }

    return this.SetupWizardService.validateTransferCodeDecorator(transferSiteDetails,  this.currentSubscription).then((response) => {
      const status = _.get(response, 'data.status');
      if (!status || status !== 'INVALID') {
        // if transferred sites have already been added and the back button clicked, strip old sites.
        this.sitesArray = [];
        const transferredSitesArray = _.get(response, 'data.siteList');
        _.forEach(transferredSitesArray, (site) => {
          if (!(_.some(this.sitesArray, { siteUrl: site.siteUrl }))) {
            const transferredSiteModel = _.clone(this.siteModel);
            transferredSiteModel.siteUrl = site.siteUrl.replace(this.Config.siteDomainUrl.webexUrl, '');
            transferredSiteModel.timezone = this.findTimezoneObject(site.timezone);
            transferredSiteModel.setupType = this.Config.setupTypes.transfer;
            this.sitesArray.push(transferredSiteModel);
            const properties = _.assignIn({}, transferSiteDetails , { trackingId: this.Utils.extractTrackingIdFromResponse(response) });
            this.sendTracking(this.Analytics.sections.WEBEX_SITE_MANAGEMENT.eventNames.TRANSFER_SITE_ADDED, properties);
          }
        });
        return this.$q.resolve();
      } else {
        this.showAndTrackValidationError({ apiResponse: response, details: transferSiteDetails, msg: 'firstTimeWizard.transferCodeInvalidError' });
        return this.$q.reject();
      }
    }).catch((response) => {
      if (_.get(response, 'data')) {
        const errorMessage = this.errorCodes[response.data.errorCode] || 'firstTimeWizard.transferCodeError';
        if (errorMessage !== 'firstTimeWizard.transferCodeError') {
          this.showAndTrackValidationError({ apiResponse: response, details: transferSiteDetails, msg: errorMessage });
        } else {
          this.Notification.errorWithTrackingId(response, errorMessage);
          const properties = _.assignIn(transferSiteDetails , { trackingId: this.Utils.extractTrackingIdFromResponse(response) });
          this.sendTracking(this.Analytics.sections.WEBEX_SITE_MANAGEMENT.eventNames.TRANSFER_CODE_CALL_FAILED, properties);
        }
      }
      return this.$q.reject();
    });
  }

  private showAndTrackValidationError(errorDetails: { apiResponse: Object, details: Object, msg: string }) {
    this.showError(this.$translate.instant(errorDetails.msg));
    const properties = _.assignIn({}, errorDetails.details , { trackingId: this.Utils.extractTrackingIdFromResponse(errorDetails.apiResponse) });
    this.sendTracking(this.Analytics.sections.WEBEX_SITE_MANAGEMENT.eventNames.INVALID_TRANSFER_CODE, properties);
  }

  private findTimezoneObject(timezoneId) {
    return _.find(this.timeZoneOptions, { timeZoneId: timezoneId });
  }

  private showError(msg) {
    this.error.isError = true;
    this.error.errorMsg = msg;
  }

  private clearError(): void {
    this.error.isError = false;
    this.error.errorMsg = '';
    delete this.error.errorType;
  }

  private sendTracking(event: string, properties: {}) {
    if (typeof this.onSendTracking === 'function') {
      this.onSendTracking({
        event: event,
        properties: properties,
      });
    }
  }
}

export class WebexSiteTransferComponent implements ng.IComponentOptions {
  public controller = WebexSiteTransferCtrl;
  public template = require('./webex-site-transfer.html');
  public bindings = {
    onSitesReceived: '&',
    onValidationStatusChange: '&',
    onSendTracking: '&?',
    currentSubscription: '<?',
    introCopy: '<',
    transferSiteCode: '<?',
    transferSiteUrl: '<?',
  };
}
