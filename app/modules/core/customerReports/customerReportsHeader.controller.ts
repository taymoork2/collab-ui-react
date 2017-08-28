class CustomerReportsHeaderCtrl {
  /* @ngInject */
  constructor(
    private $q: ng.IQService,
    private $state,
    private Authinfo,
    private FeatureToggleService,
    private MediaServiceActivationV2,
    private ProPackService,
    private WebExApiGatewayService,
    private $translate: ng.translate.ITranslateService,
  ) {
    if (this.Authinfo.isCare()) {
      this.headerTabs.push({
        title: this.$translate.instant('reportsPage.careTab'),
        state: 'reports.care',
      });
    }
    this.$q.all(this.promises).then((features: any): void => {
      if (features.webexMetrics && features.proPackEnabled) {
        this.isWebexMetricsEnabled = true;
        this.headerTabs.push({
          title: this.$translate.instant('reportsPage.sparkReports'),
          state: 'reports.sparkMetrics',
        });
        this.headerTabs.push({
          title: this.$translate.instant('reportsPage.webexMetrics.title'),
          state: 'reports.webex-metrics',
        });
      } else {
        this.headerTabs.push({
          title: this.$translate.instant('reportsPage.sparkReports'),
          state: 'reports.spark',
        });
      }
      if (features.isMfEnabled) {
        if (features.mf) {
          this.headerTabs.push({
            title: this.$translate.instant('mediaFusion.report.title'),
            state: 'reports.media',
          });
        } else if (features.mfMilestoneTwo) {
          this.headerTabs.push({
            title: this.$translate.instant('mediaFusion.report.title'),
            state: 'reports.mediaservice',
          });
        } else {
          this.headerTabs.push({
            title: this.$translate.instant('mediaFusion.report.title'),
            state: 'reports.metrics',
          });
        }
      }
      this.headerTabs.push({
        title: this.$translate.instant('reportsPage.usageReports.usageReportTitle'),
        state: 'reports.device-usage',
      });
      this.checkWebex();
      if (this.$state.current.name === 'reports') {
        this.goToFirstReportsTab();
      }
    });
  }

  private webex: boolean = false;
  public isWebexClassicEnabled: boolean = false;
  public isWebexMetricsEnabled = false;
  public headerTabs = new Array<any>();
  private promises: any = {
    mf: this.FeatureToggleService.atlasMediaServiceMetricsMilestoneOneGetStatus(),
    mfMilestoneTwo: this.FeatureToggleService.atlasMediaServiceMetricsMilestoneTwoGetStatus(),
    isMfEnabled: this.MediaServiceActivationV2.getMediaServiceState(),
    webexMetrics: this.FeatureToggleService.webexMetricsGetStatus(),
    proPackEnabled: this.ProPackService.hasProPackEnabled(),
  };

  private checkWebex (): void {
    const webexSiteUrls = this.getUniqueWebexSiteUrls(); // strip off any duplicate webexSiteUrl to prevent unnecessary XML API calls

    webexSiteUrls.forEach((url: string): void => {
      this.WebExApiGatewayService.siteFunctions(url).then((result: any): void => {
        if (result.isAdminReportEnabled && result.isIframeSupported) {
          if (!this.webex) {
            this.isWebexClassicEnabled = true;
            this.webex = true;
            this.checkWebexTab();
          }
        }
      }).catch(_.noop);
    });
  }

  private  checkWebexTab(): void {
    if (!this.isWebexMetricsEnabled) {
      this.headerTabs.push({
        title: this.$translate.instant('reportsPage.webex'),
        state: 'reports.webex',
      });
    }
  }

  public goToFirstReportsTab(): void {
    const firstTab = this.headerTabs[0];
    this.$state.go(firstTab.state);
  }
  private getUniqueWebexSiteUrls() {
    const conferenceServices: any[] = this.Authinfo.getConferenceServicesWithoutSiteUrl() || [];
    const webexSiteUrls: any[] = [];

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
