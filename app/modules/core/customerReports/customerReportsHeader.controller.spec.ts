describe('Controller: Customer Reports Ctrl', function () {
  let WebexReportService: any;

  let headerTabs: any = [{
    title: 'reportsPage.careTab',
    state: 'reports.care',
  }, {
    title: 'reportsPage.sparkReports',
    state: 'reports.spark',
  }, {
    title: 'mediaFusion.report.title',
    state: 'reports.media',
  }, {
    title: 'reportsPage.usageReports.usageReportTitle',
    state: 'reports.device-usage',
  }, {
    title: 'reportsPage.webex',
    state: 'reports.webex',
  }];

  const propackTabs: any = [{
    title: 'reportsPage.sparkReports',
    state: 'reports.sparkMetrics',
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
    this.initModules('Core', 'Huron', 'Sunlight', 'Mediafusion');
    this.injectDependencies('$controller',
                            '$scope',
                            '$state',
                            '$q',
                            'Authinfo',
                            'FeatureToggleService',
                            'ProPackService',
                            'MediaServiceActivationV2');

    spyOn(this.$state, 'go');
    spyOn(this.Authinfo, 'isCare').and.returnValue(true);
    spyOn(this.Authinfo, 'getConferenceServicesWithoutSiteUrl').and.returnValue([{
      license: 'url',
    }]);

    WebexReportService = {
      initReportsObject: function () {},
    };

  });

  describe('when all featuretoggles return false and there are no webex sites', function () {
    beforeEach(function () {
      spyOn(this.FeatureToggleService, 'atlasMediaServiceMetricsMilestoneOneGetStatus').and.returnValue(this.$q.resolve(false));
      spyOn(this.FeatureToggleService, 'atlasMediaServiceMetricsMilestoneTwoGetStatus').and.returnValue(this.$q.resolve(false));
      spyOn(this.MediaServiceActivationV2, 'getMediaServiceState').and.returnValue(this.$q.resolve(false));
      spyOn(this.FeatureToggleService, 'webexMetricsGetStatus').and.returnValue(this.$q.resolve(true));
      spyOn(this.ProPackService, 'hasProPackEnabled').and.returnValue(this.$q.resolve(true));

      const WebExApiGatewayService: any = {
        siteFunctions: (url: string): any => {
          const defer = this.$q.defer();
          defer.resolve({
            siteUrl: url,
          });
          return defer.promise;
        },
      };

      this.controller = this.$controller('CustomerReportsHeaderCtrl', {
        $q: this.$q,
        WebexReportService: WebexReportService,
        WebExApiGatewayService: WebExApiGatewayService,
        FeatureToggleService: this.FeatureToggleService,
        ProPackService: this.ProPackService,
      });

      this.$scope.$apply();
    });

    it('should only display spark and care reports tab', function () {
      expect(this.controller.headerTabs).toContain(headerTabs[0], propackTabs[0]);
    });

  });

  describe('when all featuretoggles return true and there are webex sites', function () {
    beforeEach(function () {
      spyOn(this.FeatureToggleService, 'atlasMediaServiceMetricsMilestoneOneGetStatus').and.returnValue(this.$q.resolve(true));
      spyOn(this.FeatureToggleService, 'atlasMediaServiceMetricsMilestoneTwoGetStatus').and.returnValue(this.$q.resolve(false));
      spyOn(this.MediaServiceActivationV2, 'getMediaServiceState').and.returnValue(this.$q.resolve(true));
      spyOn(this.FeatureToggleService, 'webexMetricsGetStatus').and.returnValue(this.$q.resolve(false));
      spyOn(this.ProPackService, 'hasProPackEnabled').and.returnValue(this.$q.resolve(false));

      const WebExApiGatewayService = {
        siteFunctions: (url: string): any => {
          const defer = this.$q.defer();
          defer.resolve({
            siteUrl: url,
            isAdminReportEnabled: true,
            isIframeSupported: true,
          });

          return defer.promise;
        },
      };

      this.controller = this.$controller('CustomerReportsHeaderCtrl', {
        $q: this.$q,
        WebexReportService: WebexReportService,
        WebExApiGatewayService: WebExApiGatewayService,
        FeatureToggleService: this.FeatureToggleService,
        ProPackService: this.ProPackService,
      });

      this.$scope.$apply();
    });

    it('should display all reports tabs', function () {
      expect(this.controller.headerTabs).toEqual(headerTabs);
    });
  });
});
