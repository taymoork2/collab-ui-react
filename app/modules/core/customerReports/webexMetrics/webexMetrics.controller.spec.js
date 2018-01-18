'use strict';

describe('Controller: WebEx Metrics Ctrl', function () {
  var testWebexMetrics = {
    views: {
      metrics: {
        basic: {
          view: 'Basic',
          appName: 'basic_webex_v1',
        },
        premium: {
          view: 'Premium',
          appName: 'premium_webex_v1',
        },
      },
      mei: {
        view: 'MEI',
        appName: 'mei',
      },
      system: {
        view: 'System',
        appName: 'system',
      },
    },
    states: {
      metrics: {
        title: 'reportsPage.webexMetrics.metrics',
        state: 'reports.webex-metrics.metrics',
        initialed: false,
      },
      diagnostics: {
        title: 'reportsPage.webexMetrics.diagnostics',
        state: 'reports.webex-metrics.diagnostics',
        initialed: true,
      },
      mei: {
        title: 'reportsPage.webexMetrics.MEI',
        state: 'reports.webex-metrics.MEI',
        initialed: true,
      },
      system: {
        title: 'reportsPage.webexMetrics.system',
        state: 'reports.webex-metrics.system',
        initialed: true,
      },
      dashboard: {
        title: 'reportsPage.webexMetrics.dashboard',
        state: 'reports.webex-metrics.dashboard',
        initialed: true,
      },
      jms: {
        title: 'reportsPage.webexMetrics.JMS',
        state: 'reports.webex-metrics.jms',
        initialed: true,
      },
      jmt: {
        title: 'reportsPage.webexMetrics.JMT',
        state: 'reports.webex-metrics.jmt',
        initialed: true,
      },
      classic: {
        title: 'reportsPage.webexMetrics.classic',
        state: 'reports.webex-metrics.classic',
        initialed: true,
      },
    },
  };
  var testMashupUrl = 'qlik-loader/custportal';
  var testQBSData = {
    ticket: '0Ibh4usd9bERRzLR',
    host: 'qlik-loader',
    qlik_reverse_proxy: 'qlik-loader',
    appName: 'basic_webex_v1__qvadmin@cisco.com',
    isPersistent: 'false',
  };
  beforeEach(function () {
    this.initModules('Core', 'core.customer-reports', 'WebExApp');
    this.injectDependencies(
      '$controller',
      '$location',
      '$q',
      '$sce',
      '$scope',
      '$state',
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
      'WebexMetricsService'
    );
    spyOn(this.Analytics, 'trackReportsEvent');
    spyOn(this.Authinfo, 'setEmails');
    spyOn(this.Authinfo, 'isReadOnlyAdmin').and.returnValue(true);
    spyOn(this.ProPackService, 'hasProPackPurchased').and.returnValue(this.$q.resolve(false));
    spyOn(this.WebexMetricsService, 'getMetricsSites').and.returnValue(this.$q.resolve(['go.webex.com', 'alpha.webex.com']));
    spyOn(this.WebexMetricsService, 'hasMetricsSites').and.returnValue(this.$q.resolve(true));
    spyOn(this.WebexMetricsService, 'hasClassicEnabled').and.returnValue(this.$q.resolve(true));
    spyOn(this.FeatureToggleService, 'webexMetricsGetStatus').and.returnValue(this.$q.resolve(true));
    spyOn(this.FeatureToggleService, 'webexMEIGetStatus').and.returnValue(this.$q.resolve(true));
    spyOn(this.FeatureToggleService, 'webexSystemGetStatus').and.returnValue(this.$q.resolve(true));
    spyOn(this.FeatureToggleService, 'webexInternalGetStatus').and.returnValue(this.$q.resolve(true));
    spyOn(this.QlikService, 'getProdToBTSQBSInfo').and.returnValue(this.$q.resolve(testQBSData));
    spyOn(this.QlikService, 'getQlikMashupUrl').and.returnValue(testMashupUrl);
    spyOn(this.$scope, '$broadcast').and.callThrough();

    this.initController = function () {
      var $state = {
        current: { },
        go: function () {},
      };
      this.$scope.header = {
        isWebexMetricsEnabled: true,
        isWebexClassicEnabled: true,
      };
      this.controller = this.$controller('WebExMetricsCtrl', {
        $location: this.$location,
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

  it('should set the contents class as webexMetricsContentWithReadOnly when Read-only admin role', function () {
    expect(this.controller.iframeContainerClass).toBe('webexMetricsContentWithReadOnly');
  });

  it('should set the metrics tab depends on the rules', function () {
    var testMetricsOptions = [
      testWebexMetrics.states.system,
      testWebexMetrics.states.dashboard,
      testWebexMetrics.states.jms,
      testWebexMetrics.states.jmt,
      testWebexMetrics.states.metrics,
      testWebexMetrics.states.diagnostics,
      // testWebexMetrics.states.mei, for hiding the MEI tab
      testWebexMetrics.states.classic,
    ];
    expect(this.controller.metricsOptions).toEqual(testMetricsOptions);
  });

  it('should jump to classic tab when init the classic is the first tab', function () {
    this.controller.$state.current = { name: 'reports.webex-metrics' };
    spyOn(this.controller.$state, 'go');
    this.controller.$state.is = function (webexMetricsState) {
      return webexMetricsState === 'reports.webex-metrics';
    };
    this.controller.metricsOptions = [{
      title: 'reportsPage.webexMetrics.classic',
      state: 'reports.webex-metrics.classic',
    }];
    this.controller.isStateReady = false;
    this.controller.goMetricsInitState();
    expect(this.controller.$state.go).toHaveBeenCalledWith('reports.webex-metrics.classic');
  });

  it('should check classic when classicEnabled event fired', function () {
    this.$scope.$broadcast('classicEnabled', false);
    expect(this.controller.isWebexClassicEnabled).toBeFalsy();
    expect(this.FeatureToggleService.webexMetricsGetStatus).toHaveBeenCalled();
    // this.FeatureToggleService.webexMetricsGetStatus.and.returnValue(this.$q.resolve(false));
  });

  it('should check classic and push the tab when classicEnabled event fired with true', function () {
    this.$scope.$broadcast('classicEnabled', true);
    expect(this.controller.isWebexClassicEnabled).toBeTruthy();
    expect(this.FeatureToggleService.webexMetricsGetStatus).toHaveBeenCalled();
    // expect(this.controller.pushClassicTab).toHaveBeenCalled();
  });

  it('should broadcast the event when updateWebexMetrics called', function () {
    this.controller.webexMetricsViews = 'metrics';
    this.controller.selectEnable = true;
    this.controller.metricsSelected = 'go.webex.com';
    this.controller.updateWebexMetrics();
    this.$scope.$apply();
    expect(this.controller.webexMetrics.appData.url).toBe(testMashupUrl);
  });

  it('should broadcast the event to true when updateWebexMetrics called with no site selected', function () {
    this.controller.selectEnable = true;
    this.controller.metricsSelected = undefined;
    this.controller.updateWebexMetrics();
    this.$scope.$apply();
    expect(this.controller.isNoData).toBeTruthy();
    expect(this.$scope.$broadcast).toHaveBeenCalledTimes(2);
  });

  it('should not go to reports.webex-metrics when at reports.webex-metrics sub state', function () {
    var event = jasmine.createSpyObj('event', ['preventDefault']);
    this.controller.onStateChangeStart(event, { name: 'reports.webex-metrics' }, {}, { name: 'reports.webex-metrics.metrics' });
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('should not go to reports.webex-metrics.[subState] when no webex metrics site or feature toggles off', function () {
    var event = jasmine.createSpyObj('event', ['preventDefault']);
    this.controller.features.hasMetricsSite = false;
    this.controller.onStateChangeStart(event, { name: 'reports.webex-metrics.metrics' }, {}, { name: 'reports.webex-metrics.mei' });
    expect(event.preventDefault).toHaveBeenCalled();

    this.controller.onStateChangeStart(event, { name: 'reports.webex-metrics.diagnostics' }, {}, { name: 'reports.webex-metrics.mei' });
    expect(event.preventDefault).toHaveBeenCalled();

    spyOn(this.controller.$state, 'go');
    this.controller.features.isMetricsOn = false;
    this.controller.onStateChangeStart(event, { name: 'reports.webex-metrics.metrics' }, {}, { name: 'overview' });
    expect(this.controller.$state.go).toHaveBeenCalledWith('login');

    this.controller.features.isMEIOn = false;
    this.controller.onStateChangeStart(event, { name: 'reports.webex-metrics.MEI' }, {}, { name: 'reports.webex-metrics.system' });
    expect(event.preventDefault).toHaveBeenCalled();

    this.controller.features.isSystemOn = false;
    this.controller.onStateChangeStart(event, { name: 'reports.webex-metrics.system' }, {}, { name: 'reports.webex-metrics.classic' });
    expect(event.preventDefault).toHaveBeenCalled();

    this.controller.features.isInternalOn = false;
    this.controller.onStateChangeStart(event, { name: 'reports.webex-metrics.dashboard' }, {}, { name: 'reports.webex-metrics.metrics' });
    expect(event.preventDefault).toHaveBeenCalled();

    this.controller.features.isInternalOn = false;
    this.controller.onStateChangeStart(event, { name: 'reports.webex-metrics.jms' }, {}, { name: 'reports.webex-metrics.classic' });
    expect(event.preventDefault).toHaveBeenCalled();

    this.controller.features.isInternalOn = false;
    this.controller.onStateChangeStart(event, { name: 'reports.webex-metrics.jmt' }, {}, { name: 'reports.webex-metrics.classic' });
    expect(event.preventDefault).toHaveBeenCalled();

    this.controller.isWebexClassicEnabled = false;
    this.controller.onStateChangeStart(event, { name: 'reports.webex-metrics.classic' }, {}, { name: 'reports.webex-metrics.system' });
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('should go to correct sub state when state change success', function () {
    var event = jasmine.createSpyObj('event', ['preventDefault']);

    this.controller.onStateChangeSuccess(event, { name: 'reports.webex-metrics.diagnostics' });
    expect(this.controller.webexMetricsViews).toBe('diagnostics');
    expect(this.controller.selectEnable).toBeFalsy();

    this.controller.onStateChangeSuccess(event, { name: 'reports.webex-metrics.classic' });
    expect(this.controller.webexMetricsViews).toBe('classic');
    expect(this.controller.selectEnable).toBeFalsy();

    spyOn(this.controller, 'updateWebexMetrics');
    this.controller.onStateChangeSuccess(event, { name: 'reports.webex-metrics.system' });
    expect(this.controller.webexMetricsViews).toBe('system');
    expect(this.controller.selectEnable).toBeFalsy();
    expect(this.controller.updateWebexMetrics).toHaveBeenCalled();

    this.controller.onStateChangeSuccess(event, { name: 'reports.webex-metrics.dashboard' });
    expect(this.controller.webexMetricsViews).toBe('dashboard');
    expect(this.controller.selectEnable).toBeFalsy();
    expect(this.controller.updateWebexMetrics).toHaveBeenCalled();

    this.controller.onStateChangeSuccess(event, { name: 'reports.webex-metrics.jms' });
    expect(this.controller.webexMetricsViews).toBe('jms');
    expect(this.controller.selectEnable).toBeFalsy();
    expect(this.controller.updateWebexMetrics).toHaveBeenCalled();

    this.controller.onStateChangeSuccess(event, { name: 'reports.webex-metrics.jmt' });
    expect(this.controller.webexMetricsViews).toBe('jmt');
    expect(this.controller.selectEnable).toBeFalsy();
    expect(this.controller.updateWebexMetrics).toHaveBeenCalled();

    this.controller.onStateChangeSuccess(event, { name: 'reports.webex-metrics.MEI' });
    expect(this.controller.webexMetricsViews).toBe('mei');
    expect(this.controller.selectEnable).toBeFalsy();
    expect(this.controller.updateWebexMetrics).toHaveBeenCalled();

    this.controller.webexMetrics.states.metrics.initialed = true;
    this.controller.onStateChangeSuccess(event, { name: 'reports.webex-metrics.metrics' });
    expect(this.controller.webexMetricsViews).toBe('metrics');
    expect(this.controller.selectEnable).toBeTruthy();
    expect(this.controller.updateWebexMetrics).toHaveBeenCalled();

    this.controller.webexMetrics.states.metrics.initialed = false;
    this.controller.onStateChangeSuccess(event, { name: 'reports.webex-metrics.metrics' });
    expect(this.controller.webexMetricsViews).toBe('metrics');
    expect(this.controller.selectEnable).toBeTruthy();
    expect(this.controller.updateWebexMetrics).toHaveBeenCalled();
  });
});

