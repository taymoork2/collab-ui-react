import { Config } from 'modules/core/config/config';
import { IOfferData } from 'modules/core/myCompany/mySubscriptions/subscriptionsInterfaces';
import { ProPackService } from 'modules/core/proPack/proPack.service';
import { SharedMeetingsReportService } from 'modules/core/myCompany/mySubscriptions/sharedMeetings/sharedMeetingsReport.service';

class SubscriptionRowCtrl {
  public isProPackEnabled: boolean = false;
  public offer: IOfferData;
  public wrapped: boolean;

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private $window: ng.IWindowService,
    private Config: Config,
    private ProPackService: ProPackService,
    private SharedMeetingsReportService: SharedMeetingsReportService,
    private WebExUtilsFact,
  ) { }

  public $onInit(): void {
    this.ProPackService.hasProPackEnabled().then((isProPackEnabled: boolean): void => {
      this.isProPackEnabled = isProPackEnabled;
    });
  }

  public determineLicenseType(): string {
    return this.isSharedMeetingsLicense() ? this.$translate.instant('firstTimeWizard.sharedLicenses') : this.$translate.instant('firstTimeWizard.namedLicenses');
  }

  public displayUsage(usage: number): string {
    return `${usage}/${this.offer.volume}`;
  }

  public getLicenseName(): string {
    const offerName = _.get(this.offer, 'offerName');
    if (offerName) {
      return this.$translate.instant(`subscriptions.licenseTypes.${offerName}`);
    } else {
      return '';
    }
  }

  public getWarning(usage: number): boolean {
    return usage > _.get(this.offer, 'volume');
  }

  public hideUsage(): boolean {
    const isCI = _.get(this.offer, 'isCI');
    return !_.isUndefined(isCI) && !isCI;
  }

  public isSharedMeetingsLicense(): boolean {
    return _.toLower(_.get(this.offer, 'licenseModel', '')) === this.Config.licenseModel.cloudSharedMeeting;
  }

  public isTotalUsage(): boolean {
    return _.isNumber(_.get(this.offer, 'totalUsage'));
  }

  public isUsage(): boolean {
    return _.isNumber(_.get(this.offer, 'usage'));
  }

  public launchSharedMeetingsLicenseUsageReport(): void {
    if (this.offer.siteUrl) {
      this.SharedMeetingsReportService.openModal(this.offer.siteUrl);
    }
  }

  public nonCISignIn(): void {
    if (this.offer.siteUrl) {
      this.$window.open(this.WebExUtilsFact.getSiteAdminUrl(this.offer.siteUrl), '_blank');
    }
  }
}

export class SubscriptionRowComponent implements ng.IComponentOptions {
  public template = require('modules/core/myCompany/mySubscriptions/subscription-row/subscriptionRow.tpl.html');
  public controller = SubscriptionRowCtrl;
  public bindings = {
    offer: '<',
    wrapped: '<',
  };
}
