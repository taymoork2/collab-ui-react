describe('Controller: Customer Reports Ctrl', function () {
  let WebexReportService: any;

  let headerTabs: any = [{
    title: 'reportsPage.sparkReports',
    state: 'reports.spark',
  }, {
    title: 'reportsPage.careTab',
    state: 'reports.care',
  }, {
    title: 'reportsPage.webex',
    state: 'reports.webex',
  }, {
    title: 'mediaFusion.report.title',
    state: 'reports.media',
  }, {
    title: 'reportsPage.usageReports.usageReportTitle',
    state: 'reports.device-usage',
  }, {
    title: 'reportsPage.webexMetrics.title',
    state: 'reports.webex-metrics',
  }];

  let propackTabs: any = [{
    title: 'reportsPage.sparkReports',
    state: 'reports.sparkMetrics',
  }, {
    title: 'reportsPage.webexMetrics.title',
    state: 'reports.webex-metrics',
  }]

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
                            '$q',
                            'Authinfo',
                            'FeatureToggleService',
                            'ProPackService',
                            'MediaServiceActivationV2');

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
      spyOn(this.FeatureToggleService, 'webexMetrics').and.returnValue(this.$q.resolve(false));
      spyOn(this.ProPackService, 'hasProPackEnabled').and.returnValue(this.$q.resolve(false));

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
      expect(this.controller.headerTabs).toEqual([headerTabs[0], headerTabs[1], headerTabs[4]]);
    });

  });

  describe('when all featuretoggles return true and there are webex sites', function () {
    beforeEach(function () {
      spyOn(this.FeatureToggleService, 'atlasMediaServiceMetricsMilestoneOneGetStatus').and.returnValue(this.$q.resolve(true));
      spyOn(this.FeatureToggleService, 'atlasMediaServiceMetricsMilestoneTwoGetStatus').and.returnValue(this.$q.resolve(false));
      spyOn(this.MediaServiceActivationV2, 'getMediaServiceState').and.returnValue(this.$q.resolve(true));
      spyOn(this.FeatureToggleService, 'webexMetrics').and.returnValue(this.$q.resolve(true));
      spyOn(this.ProPackService, 'hasProPackEnabled').and.returnValue(this.$q.resolve(true));

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

      headerTabs.shift();
      headerTabs = propackTabs.concat(headerTabs);

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
