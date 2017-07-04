class ReportBMMPBannerCtrl {
  public isProPackEnabled: boolean;
  public isProPackPurchased: boolean;

  /* @ngInject */
  constructor(
    private $q: ng.IQService,
    private Analytics,
    private BmmpService,
    private ProPackService,
  ) {
    this.$q.all({
      isProPackEnabled: this.ProPackService.hasProPackEnabled(),
      isProPackPurchased: this.ProPackService.hasProPackPurchased(),
    }). then((toggles: any): void => {
      this.isProPackEnabled = toggles.isProPackEnabled;
      this.isProPackPurchased = toggles.isProPackPurchased;

      if (this.isProPackEnabled && !this.isProPackPurchased) {
        this.BmmpService.init();
      }
    });
  }

  public callBannerCloseAnalytics(): void {
    this.Analytics.trackPremiumEvent(this.Analytics.sections.PREMIUM.eventNames.BMMP_DISMISSAL, 'reports_banner');
  }
}

export class ReportBMMPBannerComponent implements ng.IComponentOptions {
  public templateUrl = 'modules/core/partnerReports/reportBMMPBanner/reportBMMPBanner.tpl.html';
  public controller = ReportBMMPBannerCtrl;
  public bindings = {  };
}
