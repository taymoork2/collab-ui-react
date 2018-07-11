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
      if (features.proPackEnabled) {
        this.headerTabs.push(
          {
            title: this.$translate.instant('reportsPage.messageTab'),
            state: `reports.sparkMetrics({sparktype: 'messaging'})`,
          },
          {
            title: this.$translate.instant('reportsPage.callTab'),
            state: `reports.sparkMetrics({sparktype: 'calling'})`,
          });
      } else {
        this.headerTabs.push({
          title: this.$translate.instant('reportsPage.sparkReports'),
          state: 'reports.spark',
        });
      }
      if (features.isQlikEnabled) {
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
      if (this.$state.current.name === 'reports') {
        this.goToFirstReportsTab();
      }
    });
    this.checkWebex();
  }

  public isWebexClassicEnabled: boolean = false;
  public isWebexMetricsEnabled: boolean = false;
  public headerTabs = new Array<{ title: string, state: string}>();

  private promises: any = {
    isMfEnabled: this.MediaServiceActivationV2.getMediaServiceState(),
    isQlikEnabled: this.FeatureToggleService.atlasHybridMediaServiceQlikReportsGetStatus(),
    proPackEnabled: this.ProPackService.hasProPackEnabled(),
    autoLicenseEnabled: this.FeatureToggleService.autoLicenseGetStatus(),
  };

  public checkWebex(): void {
    this.WebexMetricsService.checkWebexAccessiblity().then((supports: boolean[]): void => {
      const isSupported: boolean = this.WebexMetricsService.isAnySupported(supports);

      if (isSupported) {
        this.headerTabs.push({
          title: this.$translate.instant('reportsPage.webexMetrics.title'),
          state: 'reports.webex-metrics',
        });
      }
      this.WebexMetricsService.hasClassicEnabled().then((hasClassicSite: boolean) => {
        if (hasClassicSite) {
          this.isWebexClassicEnabled = true;
          this.$scope.$broadcast('classicEnabled', this.isWebexMetricsEnabled);
          if (!isSupported) {
            this.headerTabs.push(
              {
                title: this.$translate.instant('reportsPage.webexMetrics.title'),
                state: 'reports.webex-metrics',
              },
            );
          }
        }
      });
    });
  }

  public goToFirstReportsTab(): void {
    if (this.headerTabs.length > 0) {
      const firstTabState: string = _.get(this.headerTabs, '[0].state');

      if (!firstTabState) {
        return;
      }

      const sanitizedFirstTabState: string = _.first(_.split(firstTabState, '('));

      this.$state.go(sanitizedFirstTabState);

    }
  }
}

angular
  .module('Core')
  .controller('CustomerReportsHeaderCtrl', CustomerReportsHeaderCtrl);
