'use strict';

describe('Controller: WebEx Metrics Ctrl', function () {
  beforeEach(function () {
    this.initModules('Core', 'core.customer-reports', 'WebExApp'); // 'Core' included for Userservice
    this.injectDependencies(
      '$controller',
      '$q',
      '$sce',
      '$scope',
      '$stateParams',
      '$timeout',
      '$window',
      '$rootScope',
      'Analytics',
      'Authinfo',
      'FeatureToggleService',
      'LocalStorage',
      'Notification',
      'ProPackService',
      'QlikService',
      'Userservice',
      'WebexMetricsService'
    );
    spyOn(this.Analytics, 'trackReportsEvent');
    spyOn(this.Authinfo, 'setEmails');
    spyOn(this.Authinfo, 'getConferenceServicesWithoutSiteUrl').and.returnValue([]);
    spyOn(this.Authinfo, 'getConferenceServicesWithLinkedSiteUrl').and.returnValue([]);
    spyOn(this.ProPackService, 'hasProPackPurchased').and.returnValue(this.$q.resolve(false));
    spyOn(this.WebexMetricsService, 'getMetricsSites').and.returnValue(this.$q.resolve(['go.webex.com', 'alpha.webex.com']));
    spyOn(this.WebexMetricsService, 'hasMetricsSites').and.returnValue(this.$q.resolve(true));
    spyOn(this.WebexMetricsService, 'hasClassicEnabled').and.returnValue(this.$q.resolve(true));
    spyOn(this.FeatureToggleService, 'webexMetricsGetStatus').and.returnValue(this.$q.resolve(true));
    this.initController = function () {
      var $state = {
        current: { },
        go: function () {},
      };
      this.$scope.header = {
        isWebexMetricsEnabled: true,
        isWebexClassicEnabled: true,
        // webexSiteList: ['go.webex.com', 'alpha.webex.com'],
      };
      this.controller = this.$controller('WebExMetricsCtrl', {
        $sce: this.$sce,
        $scope: this.$scope,
        $stateParams: this.$stateParams,
        $timeout: this.$timeout,
        $window: this.$window,
        $rootScope: this.$rootScope,
        $state: $state,
        Analytics: this.Analytics,
        Authinfo: this.Authinfo,
        LocalStorage: this.LocalStorage,
        Notification: this.Notification,
        ProPackService: this.ProPackService,
        QlikService: this.QlikService,
        WebexMetricsService: this.WebexMetricsService,
      });
      this.$scope.$apply();
    };
    this.initController();
  });

  it('should call Analytics.trackReportsEvent during init', function () {
    expect(this.Analytics.trackReportsEvent).toHaveBeenCalledWith(this.Analytics.sections.REPORTS.eventNames.CUST_WEBEX_REPORT);
  });

  it('premium settings should be controlled by ProPackService or Authinfo.isPremium', function () {
    expect(this.controller.reportView).toEqual(this.controller.webexMetrics.views[0]);

    this.ProPackService.hasProPackPurchased.and.returnValue(this.$q.resolve(true));
    this.initController();
    expect(this.controller.reportView).toEqual(this.controller.webexMetrics.views[0]);
  });

  it('initial state, isIframeLoaded should be false, currentFilter should be metrics', function () {
    expect(this.controller.isIframeLoaded).toBeFalsy();
  });

  it('should not go to reports.webex-metrics when at reports.webex-metrics sub state', function () {
    var event = jasmine.createSpyObj('event', ['preventDefault']);
    this.controller.onStateChangeStart(event, { name: 'reports.webex-metrics' }, {}, { name: 'reports.webex-metrics.metrics' });
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('should do something when state change success', function () {
    var event = jasmine.createSpyObj('event', ['preventDefault']);
    spyOn(this.controller, 'generateMetrics');
    this.controller.selectEnable = false;
    this.controller.onStateChangeSuccess(event, { name: 'reports.webex-metrics.metrics' }, {}, { name: 'reports.webex-metrics.classic' });

    expect(this.controller.selectEnable).toBe(true);
    expect(this.controller.generateMetrics).toHaveBeenCalled();

    this.controller.onStateChangeSuccess(event, { name: 'reports.webex-metrics.classic' });
    expect(this.controller.selectEnable).toBe(false);
  });

  it('should jump to classic tab when init the classic is the first tab', function () {
    this.controller.$state.current = { name: 'reports.webex-metrics' };
    spyOn(this.controller.$state, 'go');
    this.controller.metricsOptions = [{
      title: 'reportsPage.webexMetrics.classic',
      state: 'reports.webex-metrics.classic',
    }];
    this.controller.goMetricsInitState();
    expect(this.controller.$state.go).toHaveBeenCalledWith('reports.webex-metrics.classic');
  });

  it('should call loadMetricsReport after updateWebexMetrics()', function () {
    spyOn(this.controller, 'loadMetricsReport');
    this.controller.webexSelected = 'Timtrinhtrialint150.webex.com';
    this.controller.updateWebexMetrics();
    expect(this.controller.loadMetricsReport).toHaveBeenCalled();
    expect(this.controller.isNoData).toBe(false);
  });
});

