describe('Controller: Customer Reports Ctrl', function () {
  let WebexReportService: any;

  let headerTabs: any = [{
    title: 'reportsPage.careTab',
    state: 'reports.care',
  }, {
    title: 'reportsPage.sparkReports',
    state: 'reports.spark',
  }, {
    title: 'reportsPage.webex',
    state: 'reports.webex',
  }, {
    title: 'mediaFusion.report.title',
    state: 'reports.mediaservice',
  }, {
    title: 'reportsPage.usageReports.usageReportTitle',
    state: 'reports.device-usage',
  }, {
    title: 'mediaFusion.report.title',
    state: 'reports.hybridMedia',
  }];

  const propackTabs: any = [{
    title: 'reportsPage.messageTab',
    state: `reports.sparkMetrics({sparktype: 'messaging'})`,
  }, {
    title: 'reportsPage.callTab',
    state: `reports.sparkMetrics({sparktype: 'calling'})`,
  }, {
    title: 'reportsPage.webexMetrics.title',
    state: 'reports.webex-metrics',
  }];

  afterAll(function () {
    headerTabs = undefined;
  });

  afterEach(function () {
    WebexReportService = undefined;
  });

  beforeEach(function () {
    this.initModules('Core', 'Huron', 'Sunlight', 'Mediafusion', 'WebExApp');
    this.injectDependencies('$controller',
      '$scope',
      '$state',
      '$q',
      'Authinfo',
      'FeatureToggleService',
      'ProPackService',
      'WebexMetricsService',
      'MediaServiceActivationV2');

    spyOn(this.$state, 'go');
    spyOn(this.Authinfo, 'isCare').and.returnValue(true);
    spyOn(this.Authinfo, 'getConferenceServicesWithoutSiteUrl').and.returnValue([{
      license: 'url',
    }]);

    WebexReportService = {
      initReportsObject: function () { },
    };

  });

  describe('when all featuretoggles return false and there are no webex sites', function () {
    beforeEach(function () {
      spyOn(this.MediaServiceActivationV2, 'getMediaServiceState').and.returnValue(this.$q.resolve(false));
      spyOn(this.FeatureToggleService, 'atlasHybridMediaServiceQlikReportsGetStatus').and.returnValue(this.$q.resolve(false));
      spyOn(this.ProPackService, 'hasProPackEnabled').and.returnValue(this.$q.resolve(false));
      spyOn(this.WebexMetricsService, 'hasClassicEnabled').and.returnValue(this.$q.resolve([false]));
      spyOn(this.WebexMetricsService, 'checkWebexAccessiblity').and.returnValue(this.$q.resolve([true]));

      this.controller = this.$controller('CustomerReportsHeaderCtrl', {
        $q: this.$q,
        $scope: this.$scope,
        WebexReportService: WebexReportService,
        WebexMetricsService: this.WebexMetricsService,
        FeatureToggleService: this.FeatureToggleService,
        ProPackService: this.ProPackService,
      });

      this.$scope.$apply();
    });

    it('should only display webx metrics and care reports tab', function () {
      expect(this.controller.headerTabs).toContain(headerTabs[0], propackTabs[2]);
    });

  });

  describe('when all featuretoggles return true and there are webex sites', function () {
    beforeEach(function () {
      spyOn(this.MediaServiceActivationV2, 'getMediaServiceState').and.returnValue(this.$q.resolve(true));
      spyOn(this.FeatureToggleService, 'atlasHybridMediaServiceQlikReportsGetStatus').and.returnValue(this.$q.resolve(true));
      spyOn(this.FeatureToggleService, 'autoLicenseGetStatus').and.returnValue(this.$q.resolve(true));
      spyOn(this.ProPackService, 'hasProPackEnabled').and.returnValue(this.$q.resolve(true));
      spyOn(this.WebexMetricsService, 'hasClassicEnabled').and.returnValue(this.$q.resolve([true]));
      spyOn(this.WebexMetricsService, 'checkWebexAccessiblity').and.returnValue(this.$q.resolve([true]));

      this.controller = this.$controller('CustomerReportsHeaderCtrl', {
        $q: this.$q,
        $scope: this.$scope,
        WebexReportService: WebexReportService,
        WebexMetricsService: this.WebexMetricsService,
        FeatureToggleService: this.FeatureToggleService,
        ProPackService: this.ProPackService,
      });

      this.$scope.$apply();
    });

    it('should display all reports tabs', function () {
      expect(this.controller.headerTabs).toContain(headerTabs[0]);
      expect(this.controller.headerTabs).toContain(headerTabs[4], headerTabs[5]);
      expect(this.controller.headerTabs).toContain(propackTabs[0], propackTabs[1]);
    });
  });
});
