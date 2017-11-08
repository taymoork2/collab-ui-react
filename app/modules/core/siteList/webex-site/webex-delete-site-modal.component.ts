import './webex-site.scss';

import { IWebExSite, IConferenceLicense } from 'modules/core/setupWizard/meeting-settings/meeting-settings.interface';
import { SetupWizardService } from 'modules/core/setupWizard/setup-wizard.service';
import { WebExSiteService, Actions } from './webex-site.service';
import { Notification } from 'modules/core/notifications';

class WebexDeleteSiteModalController implements ng.IComponentController {

  // parameters for child controls
  public sitesArray: IWebExSite[] = [];
  public conferenceLicensesInSubscription: IConferenceLicense[];
  public siteUrl: string;

  // parameters received
  public subscriptionId: string;
  public dismiss: Function;

  // used in own ui
  public isLoading = false;
  private isCanProceed = false;
  private webexSiteDetailsList = [];

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private Notification: Notification,
    private SetupWizardService: SetupWizardService,
    private WebExSiteService: WebExSiteService,
  ) { }

  public $onChanges(changes: ng.IOnChangesObject): void {
    if (changes.subscriptionId) {
      this.changeCurrentSubscription(changes.subscriptionId.currentValue);
    }
  }

  // wizard navigation logic
  public cancel(): void {
    this.dismiss();
  }

  public isNextDisabled(): boolean {
    return !this.isCanProceed;
  }

  public next(): void {
    this.saveData();
  }


  private changeCurrentSubscription(subscriptionId) {
    this.subscriptionId = subscriptionId;
    this.conferenceLicensesInSubscription = this.SetupWizardService.getConferenceLicensesBySubscriptionId(subscriptionId);
    const licensesWithoutDeletedSite = _.reject(this.conferenceLicensesInSubscription, { siteUrl: this.siteUrl });
    this.sitesArray = this.WebExSiteService.transformExistingSites(licensesWithoutDeletedSite);
  }

  // callbacks from components
  public updateSitesWithNewDistribution(sitesWithLicenseDetail, isValid) {
    if (isValid) {
      this.webexSiteDetailsList = sitesWithLicenseDetail;
      this.isCanProceed = true;
    } else {
      this.webexSiteDetailsList = [];
      this.isCanProceed = false;
    }
  }

  private saveData() {
    const audioData = this.WebExSiteService.getAudioPackageInfo(this.subscriptionId);
    const payload = this.WebExSiteService.constructWebexLicensesPayload(this.webexSiteDetailsList, this.subscriptionId, Actions.DELETE,
    audioData.audioPartnerName, audioData.ccaspSubscriptionId);
    this.SetupWizardService.updateSitesInActiveSubscription(payload)
      .then(() => {
        // TODO algendel: 10/30/17 - get real copy.
        this.Notification.success(this.$translate.instant('webexSiteManagement.deleteSiteSuccess'));
        this.dismiss();
      })
      .catch((response) => {
        this.Notification.errorWithTrackingId(response);
      })
      .finally(() => {
        this.dismiss();
      });
  }
}

export class WebexDeleteSiteModalComponent implements ng.IComponentOptions {
  public controller = WebexDeleteSiteModalController;
  public template = require('./webex-delete-site-modal.html');
  public bindings = {
    subscriptionId: '<',
    dismiss: '&',
    siteUrl: '<',
  };
}

