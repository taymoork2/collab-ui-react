describe('Controller: Customer Reports Ctrl', function () {
  let WebexReportService: any;

  let headerTabs: Array<any> = [{
    title: 'mediaFusion.page_title',
    state: 'reports.metrics',
  }, {
    title: 'reportsPage.sparkReports',
    state: 'reports.spark',
  }, {
    title: 'reportsPage.webex',
    state: 'reports.webex',
  }, {
    title: 'reportsPage.careTab',
    state: 'reports.care',
  }, {
    title: 'reportsPage.usageReports.usageReportTitle',
    state: 'reports.device-usage.total',
  }];

  beforeEach(function () {
    this.initModules('Core', 'Huron', 'Sunlight', 'Mediafusion');
    this.injectDependencies('$controller',
                            '$scope',
                            '$q',
                            'Authinfo',
                            'FeatureToggleService',
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
      spyOn(this.FeatureToggleService, 'atlasMediaServiceMetricsGetStatus').and.returnValue(this.$q.when(false));
      spyOn(this.FeatureToggleService, 'atlasCareTrialsGetStatus').and.returnValue(this.$q.when(false));
      spyOn(this.FeatureToggleService, 'atlasDeviceUsageReportGetStatus').and.returnValue(this.$q.when(false));
      spyOn(this.MediaServiceActivationV2, 'getMediaServiceState').and.returnValue(this.$q.resolve(false));

      let WebExApiGatewayService: any = {
        siteFunctions: (url: string): any => {
          let defer = this.$q.defer();
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
      });

      this.$scope.$apply();
    });

    it('pagetitle should be Reports', function () {
      expect(this.controller.pageTitle).toEqual('reportsPage.pageTitle');
    });

    it('should only display spark reports tab', function () {
      expect(this.controller.headerTabs).toEqual([headerTabs[1]]);
    });
  });

  describe('when all featuretoggles return true and there are webex sites', function () {
    beforeEach(function () {
      spyOn(this.FeatureToggleService, 'atlasMediaServiceMetricsGetStatus').and.returnValue(this.$q.when(true));
      spyOn(this.FeatureToggleService, 'atlasCareTrialsGetStatus').and.returnValue(this.$q.when(true));
      spyOn(this.FeatureToggleService, 'atlasDeviceUsageReportGetStatus').and.returnValue(this.$q.when(true));
      spyOn(this.MediaServiceActivationV2, 'getMediaServiceState').and.returnValue(this.$q.resolve(true));

      let WebExApiGatewayService = {
        siteFunctions: (url: string): any => {
          let defer = this.$q.defer();
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
      });

      this.$scope.$apply();
    });

    it('should display all reports tabs', function () {
      expect(this.controller.headerTabs).toEqual(headerTabs);
    });
  });
});
