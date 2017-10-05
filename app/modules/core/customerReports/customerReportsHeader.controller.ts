class CustomerReportsHeaderCtrl {
  /* @ngInject */
  constructor(
    private $log: ng.ILogService,
    private $q: ng.IQService,
    private $state,
    private Authinfo,
    private Config,
    private FeatureToggleService,
    private MediaServiceActivationV2,
    private ProPackService,
    private WebExApiGatewayService,
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
      this.$log.log('customer tabs');
      if (features.webexMetrics && features.proPackEnabled) {
        this.isWebexMetricsEnabled = true;
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
  public webexSiteList = new Array<any>();
  public headerTabs = new Array<any>();

  private promises: any = {
    mf: this.FeatureToggleService.atlasMediaServiceMetricsMilestoneOneGetStatus(),
    mfMilestoneTwo: this.FeatureToggleService.atlasMediaServiceMetricsMilestoneTwoGetStatus(),
    isMfEnabled: this.MediaServiceActivationV2.getMediaServiceState(),
    webexMetrics: this.FeatureToggleService.webexMetricsGetStatus(),
    proPackEnabled: this.ProPackService.hasProPackEnabled(),
  };

  private filterTestSites (siteUrls): string[] {
    const webexTestSites: string[] = ['.my.dmz.webex.com', '.my.webex.com', '.dmz.webex.com', '.qa.webex.com'];
    let sites: any[] = [];
    sites = _.filter(siteUrls, function (site) {
      return !_.find(webexTestSites, function (testSite) {
        return _.includes(site, testSite);
      });
    });
    return sites;
  }

  private fixWebexSites (siteUrls): string[] {
    const ciscoSites: string[] = ['go.webex.com'/*, 'cisco.webex.com'*/];
    const ciscoOrg: string = '1eb65fdf-9643-417f-9974-ad72cae0e10f';
    let sites: any[] = siteUrls;
    if (this.Authinfo.getOrgId() === ciscoOrg) {
      sites = _.concat(siteUrls, ciscoSites);
    }
    return sites;
  }

  private checkWebex (): void {
    this.$log.log('Check Webex Report');
    if (this.isWebexMetricsEnabled) {
      this.$log.log('New Webex report: check site list...');
      const siteUrls: any[] = this.getConferenceServiceWebexSiteUrls() || [];
      let webexSiteUrls: any[] = this.filterSiteList(siteUrls) || [];

      if (this.Config.isIntegration()) {
        webexSiteUrls = this.filterTestSites(webexSiteUrls);
        webexSiteUrls = this.fixWebexSites(webexSiteUrls);
      }

      if (webexSiteUrls.length > 0) {
        this.headerTabs.push({
          title: this.$translate.instant('reportsPage.webexMetrics.title'),
          state: 'reports.webex-metrics',
        });
        this.webexSiteList = _.clone(webexSiteUrls);
      }
      this.$log.log('ConferenceService site list: ' + webexSiteUrls.length);
      this.$log.log(webexSiteUrls);

      const accountSiteList = this.getWebexMetricsServiceWebexSiteUrls() || [];
      const accountWebexSiteUrls: any[] = this.filterSiteList(accountSiteList) || [];
      this.$log.log('WebexMetricsService site Urls: ');
      this.$log.log(accountWebexSiteUrls);
    }
    this.checkWebexClassic();
  }

  private checkWebexClassic(): void {
    const siteUrls: any[] = this.getConferenceServicesWithoutSiteUrls() || [];
    const webexSiteUrls: any[] = this.filterSiteList(siteUrls) || [];

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
      this.$log.log('Old Webex report with site list');
      this.headerTabs.push({
        title: this.$translate.instant('reportsPage.webex'),
        state: 'reports.webex',
      });
    }
  }

  public goToFirstReportsTab(): void {
    this.$log.log('go to first reports tab...');
    const firstTab = this.headerTabs[0];
    this.$state.go(firstTab.state);
  }
  private getConferenceServicesWithoutSiteUrls() {
    const conferenceServices: any[] = this.Authinfo.getConferenceServicesWithoutSiteUrl() || [];
    const siteUrls: any[] = [];

    conferenceServices.forEach((conferenceService: any): void => {
      siteUrls.push(conferenceService.license.siteUrl);
    });
    this.$log.log('getConferenceServicesWithoutSiteUrls');
    this.$log.log(siteUrls);
    return siteUrls;
  }

  private getConferenceServiceWebexSiteUrls() {
    const conferenceServicesWithoutSiteUrl = this.Authinfo.getConferenceServicesWithoutSiteUrl() || [];
    const conferenceServicesLinkedSiteUrl = this.Authinfo.getConferenceServicesWithLinkedSiteUrl() || [];
    const siteUrls: any[] = [];

    conferenceServicesWithoutSiteUrl.forEach((conferenceService: any): void => {
      siteUrls.push(conferenceService.license.siteUrl);
    });

    conferenceServicesLinkedSiteUrl.forEach((conferenceService: any): void => {
      siteUrls.push(conferenceService.license.linkedSiteUrl);
    });

    this.$log.log('getConferenceWebexSiteUrls');
    this.$log.log(siteUrls);
    return siteUrls;
  }

  private getWebexMetricsServiceWebexSiteUrls() {
    let siteList: any[] = [];
    this.WebexMetricsService.getWebexSites().then(function (response) {
      siteList = response.data;
    });
    this.$log.log('getWebexMetricsServiceWebexSiteUrls');
    this.$log.log(siteList);
    return siteList;
  }

  private filterSiteList(siteUrls) {
    const webexSiteUrls: any[] = [];

    siteUrls.forEach((siteUrls: any): void => {
      webexSiteUrls.push(siteUrls);
    });

    return webexSiteUrls.filter((value: any, index: number, self: any): boolean => {
      return self.indexOf(value) === index;
    });
  }
}

angular
  .module('Core')
  .controller('CustomerReportsHeaderCtrl', CustomerReportsHeaderCtrl);
