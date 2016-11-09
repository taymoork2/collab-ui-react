class CustomerReportsHeaderCtrl {
  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private $q: ng.IQService,
    private Authinfo,
    private FeatureToggleService,
    private MediaServiceActivationV2,
    private WebExApiGatewayService,
  ) {
    this.$q.all(this.promises).then((features: any): void => {
      if (features.mf && features.isMfEnabled) {
        this.headerTabs.unshift({
          title: $translate.instant('mediaFusion.page_title'),
          state: 'reports.metrics',
        });
      }
      if (Authinfo.isCare() && features.care) {
        this.headerTabs.push({
          title: $translate.instant('reportsPage.careTab'),
          state: 'reports.care',
        });
      }
      if (features.deviceUsage) {
        this.headerTabs.push({
          title: $translate.instant('reportsPage.usageReports.usageReportTitle'),
          state: 'reports.device-usage.total',
        });
      }
    });
    this.checkWebex();
  }

  public pageTitle = this.$translate.instant('reportsPage.pageTitle');
  public headerTabs = [{
    title: this.$translate.instant('reportsPage.sparkReports'),
    state: 'reports.spark',
  }];

  private webex: boolean = false;
  private promises: any = {
    mf: this.FeatureToggleService.atlasMediaServiceMetricsGetStatus(),
    care: this.FeatureToggleService.atlasCareTrialsGetStatus(),
    isMfEnabled: this.MediaServiceActivationV2.getMediaServiceState(),
    deviceUsage: this.FeatureToggleService.atlasDeviceUsageReportGetStatus(),
  };

  private checkWebex (): void {
    let webexSiteUrls = this.getUniqueWebexSiteUrls(); // strip off any duplicate webexSiteUrl to prevent unnecessary XML API calls

    webexSiteUrls.forEach((url: string): void => {
      this.WebExApiGatewayService.siteFunctions(url).then((result: any): void => {
        if (result.isAdminReportEnabled && result.isIframeSupported) {
          if (!this.webex) {
            this.headerTabs.push({
              title: this.$translate.instant('reportsPage.webex'),
              state: 'reports.webex',
            });
            this.webex = true;
          }
        }
      }).catch(_.noop);
    });
  }

  private getUniqueWebexSiteUrls() {
    let conferenceServices: Array<any> = this.Authinfo.getConferenceServicesWithoutSiteUrl() || [];
    let webexSiteUrls: Array<any> = [];

    conferenceServices.forEach((conferenceService: any): void => {
      webexSiteUrls.push(conferenceService.license.siteUrl);
    });

    return webexSiteUrls.filter((value: any, index: number, self: any): boolean => {
      return self.indexOf(value) === index;
    });
  }
}

angular
  .module('Core')
  .controller('CustomerReportsHeaderCtrl', CustomerReportsHeaderCtrl);
