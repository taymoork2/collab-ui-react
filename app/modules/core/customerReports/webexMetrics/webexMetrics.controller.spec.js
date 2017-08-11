'use strict';

describe('Controller: WebEx Metrics Ctrl', function () {
  beforeEach(function () {
    this.initModules('Core', 'core.customer-reports');  // 'Core' included for Userservice
    this.injectDependencies(
      '$controller',
      '$q',
      '$sce',
      '$scope',
      '$stateParams',
      '$timeout',
      '$window',
      '$rootScope',
      'Authinfo',
      'LocalStorage',
      'Notification',
      'ProPackService',
      'QlikService',
      'Userservice'
    );

    spyOn(this.Authinfo, 'setEmails');
    spyOn(this.Authinfo, 'getConferenceServicesWithoutSiteUrl').and.returnValue([]);
    spyOn(this.Authinfo, 'getConferenceServicesWithLinkedSiteUrl').and.returnValue([]);
    spyOn(this.ProPackService, 'hasProPackPurchased').and.returnValue(this.$q.resolve(false));
    spyOn(this.Userservice, 'getUser').and.callFake(function (user, callback) {
      expect(user).toBe('me');
      callback({
        success: true,
        emails: 'fakeUser@fakeEmail.com',
        siteUrl: 'siteUrl',
      });
    });
    this.initController = function () {
      var $state = {
        current: { },
        go: function () {},
      };
      this.controller = this.$controller('WebExMetricsCtrl', {
        $sce: this.$sce,
        $scope: this.$scope,
        $stateParams: this.$stateParams,
        $timeout: this.$timeout,
        $window: this.$window,
        $rootScope: this.$rootScope,
        $state: $state,
        Authinfo: this.Authinfo,
        LocalStorage: this.LocalStorage,
        Notification: this.Notification,
        ProPackService: this.ProPackService,
        QlikService: this.QlikService,
        Userservice: this.Userservice,
      });
      this.$scope.$apply();
    };
    this.initController();
  });

  it('premium settings should be controlled by ProPackService or Authinfo.isPremium', function () {
    expect(this.controller.reportView).toEqual(this.controller.webexMetrics.views[0]);

    this.ProPackService.hasProPackPurchased.and.returnValue(this.$q.resolve(true));
    this.initController();
    expect(this.controller.reportView).toEqual(this.controller.webexMetrics.views[1]);
  });

  it('should not have anything in the dropdown for webex metrics', function () {
    expect(this.controller.webexOptions.length).toBe(0);
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
    spyOn(this.controller, 'loadMetricsReport');
    this.controller.selectEnable = false;
    this.controller.onStateChangeSuccess(event, { name: 'reports.webex-metrics.metrics' }, {}, { name: 'reports.webex-metrics.classic' });

    expect(this.controller.selectEnable).toBe(true);
    expect(this.controller.loadMetricsReport).toHaveBeenCalled();

    this.controller.onStateChangeSuccess(event, { name: 'reports.webex-metrics.classic' });
    expect(this.controller.selectEnable).toBe(false);
  });

  it('should jump to metrics tab when init', function () {
    this.controller.$state.current = { name: 'reports.webex-metrics' };
    spyOn(this.controller.$state, 'go');
    this.controller.goMetricsState();
    expect(this.controller.$state.go).toHaveBeenCalledWith('reports.webex-metrics.metrics');
  });

  it('should call loadMetricsReport after updateWebexMetrics()', function () {
    spyOn(this.controller, 'loadMetricsReport');
    this.controller.webexSelected = 'Timtrinhtrialint150.webex.com';
    this.controller.updateWebexMetrics();
    expect(this.controller.loadMetricsReport).toHaveBeenCalled();
    expect(this.controller.isNoData).toBe(false);
  });
});

