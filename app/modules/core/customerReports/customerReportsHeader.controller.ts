class CustomerReportsHeaderCtrl {
  /* @ngInject */
  constructor(
    private $q: ng.IQService,
    private $scope: ng.IScope,
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
      if (!features.isQlikEnabled) {
        this.headerTabs.push({
          title: this.$translate.instant('mediaFusion.report.title'),
          state: 'reports.hybridMedia',
        });
      } else if (features.isMfEnabled) {
        this.headerTabs.push({
          title: this.$translate.instant('mediaFusion.report.title'),
          state: 'reports.mediaservice',
        });
      }
      this.headerTabs.push({
        title: this.$translate.instant('reportsPage.usageReports.usageReportTitle'),
        state: 'reports.device-usage',
      });
      if (features.autoLicenseEnabled) {
        this.headerTabs.push({
          title: this.$translate.instant('reportsPage.autoLicense'),
          state: 'reports.autoLicense',
        });
      }
      if (this.$state.current.name === 'reports') {
        this.goToFirstReportsTab();
      }
    });
    this.checkWebex();
  }

  public isWebexClassicEnabled: boolean = false;
  public isWebexMetricsEnabled: boolean = false;
  public headerTabs = new Array<any>();

  private promises: any = {
    isMfEnabled: this.MediaServiceActivationV2.getMediaServiceState(),
    isQlikEnabled: this.FeatureToggleService.atlasHybridMediaServiceQlikReportsGetStatus(),
    webexMetrics: this.FeatureToggleService.webexMetricsGetStatus(),
    proPackEnabled: this.ProPackService.hasProPackEnabled(),
    autoLicenseEnabled: this.FeatureToggleService.autoLicenseGetStatus(),
  };

  public checkWebex(): void {
    this.FeatureToggleService.webexMetricsGetStatus().then((isMetricsOn: any) => {
      this.isWebexMetricsEnabled = isMetricsOn;
      if (isMetricsOn) {
        this.WebexMetricsService.checkWebexAccessiblity().then((supports: any): void => {
          const isSupported: any[] = this.WebexMetricsService.isAnySupported(supports);
          if (isSupported) {
            this.headerTabs.push({
              title: this.$translate.instant('reportsPage.webexMetrics.title'),
              state: 'reports.webex-metrics',
            });
          }
          this.WebexMetricsService.hasClassicEnabled().then((hasClassicSite: any) => {
            if (hasClassicSite) {
              this.isWebexClassicEnabled = true;
              this.$scope.$broadcast('classicEnabled', this.isWebexMetricsEnabled);
              if (!isSupported) {
                this.headerTabs.push({
                  title: this.$translate.instant('reportsPage.webexMetrics.title'),
                  state: 'reports.webex-metrics',
                });
              }
            }
          });
        });
      } else {
        this.WebexMetricsService.hasClassicEnabled().then((hasClassicSite: any) => {
          if (hasClassicSite) {
            this.headerTabs.push({
              title: this.$translate.instant('reportsPage.webex'),
              state: 'reports.webex',
            });
          }
        });
      }
    });
  }

  public goToFirstReportsTab(): void {
    const firstTab = this.headerTabs[0];
    this.$state.go(firstTab.state);
  }
}

angular
  .module('Core')
  .controller('CustomerReportsHeaderCtrl', CustomerReportsHeaderCtrl);
