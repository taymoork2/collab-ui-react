class CustomerReportsHeaderCtrl {
  /* @ngInject */
  constructor(
    private $q: ng.IQService,
    private $state,
    private Authinfo,
    private FeatureToggleService,
    private MediaServiceActivationV2,
    private ProPackService,
    private WebexMetricsService,
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
        this.headerTabs.push({
          title: this.$translate.instant('reportsPage.sparkReports'),
          state: 'reports.sparkMetrics',
        });
      } else {
        this.headerTabs.push({
          title: this.$translate.instant('reportsPage.sparkReports'),
          state: 'reports.spark',
        });
      }
      if (features.hasClassicEnabled) {
        this.isWebexClassicEnabled = true;
      }
      if (features.webexMetrics) {
        this.isWebexMetricsEnabled = true;
        this.WebexMetricsService.checkWebexAccessiblity().then((supports: any): void => {
          const isSupported: any[] = this.WebexMetricsService.isAnySupported(supports);
          if (isSupported) {
            this.headerTabs.push({
              title: this.$translate.instant('reportsPage.webexMetrics.title'),
              state: 'reports.webex-metrics',
            });
          }
        });
      } else {
        this.headerTabs.push({
          title: this.$translate.instant('reportsPage.webex'),
          state: 'reports.webex',
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
      if (this.$state.current.name === 'reports') {
        this.goToFirstReportsTab();
      }
    });
  }

  public isWebexClassicEnabled: boolean = false;
  public isWebexMetricsEnabled: boolean = false;
  public headerTabs = new Array<any>();

  private promises: any = {
    mf: this.FeatureToggleService.atlasMediaServiceMetricsMilestoneOneGetStatus(),
    mfMilestoneTwo: this.FeatureToggleService.atlasMediaServiceMetricsMilestoneTwoGetStatus(),
    isMfEnabled: this.MediaServiceActivationV2.getMediaServiceState(),
    webexMetrics: this.FeatureToggleService.webexMetricsGetStatus(),
    proPackEnabled: this.ProPackService.hasProPackEnabled(),
    hasClassicEnabled: this.WebexMetricsService.hasClassicEnabled(),
  };

  public goToFirstReportsTab(): void {
    const firstTab = this.headerTabs[0];
    this.$state.go(firstTab.state);
  }
}

angular
  .module('Core')
  .controller('CustomerReportsHeaderCtrl', CustomerReportsHeaderCtrl);
