'use strict';

describe('Controller: HybridMedia Metrics Ctrl', function () {
  beforeEach(function () {
    this.initModules('core.customer-reports', 'Core'); // 'Core' included for Userservice
    this.injectDependencies(
      '$controller',
      '$q',
      '$sce',
      '$scope',
      '$timeout',
      '$window',
      'Analytics',
      'Authinfo',
      'Notification',
      'QlikService',
      'Userservice'
    );

    this.base = 'Basic';
    this.premium = 'Premium';
    this.testMashupUrl = 'qlik-loader/custportal';
    this.testQBSData = {
      ticket: '0Ibh4usd9bERRzLR',
      host: 'qlik-loader',
      qlik_reverse_proxy: 'qlik-loader',
      appName: 'basic_spark_v1__qvadmin@cisco.com',
      isPersistent: 'true',
    };
    this.testQBSBasicData = {
      ticket: '0Ibh4usd9bERRzL2',
      host: 'qlik-loader',
      qlik_reverse_proxy: 'qlik-loader',
      appName: 'basic_spark_v1__qvadmin@cisco.com',
      isPersistent: 'false',
      appDefaultName: 'basic_spark_v1',
    };

    spyOn(this.Analytics, 'trackReportsEvent');
    spyOn(this.Authinfo, 'setEmails');
    spyOn(this.QlikService, 'getQBSInfo').and.returnValue(this.$q.resolve(this.testQBSData));
    spyOn(this.QlikService, 'getQlikMashupUrl').and.returnValue(this.testMashupUrl);
    spyOn(this.Userservice, 'getUser').and.callFake(function (user, callback) {
      expect(user).toBe('me');
      callback({
        success: true,
        emails: ['fakeEmails@fakeEmails.com'],
      });
    });

    this.initController = function () {
      this.controller = this.$controller('HybridMediaMetricsCtrl', {
        $sce: this.$sce,
        $scope: this.$scope,
        $timeout: this.$timeout,
        $window: this.$window,
        Analytics: this.Analytics,
        Authinfo: this.Authinfo,
        Notification: this.Notification,
        QlikService: this.QlikService,
        Userservice: this.Userservice,
      });
      this.$scope.$apply();
    };
    this.initController();
  });

  it('should call Analytics.trackReportsEvent during init', function () {
    expect(this.Analytics.trackReportsEvent).toHaveBeenCalledWith(this.Analytics.sections.REPORTS.eventNames.CUST_SPARK_REPORT);
  });

  it('should get the right Qlik mashup url', function () {
    expect(this.controller.hybridMetrics.appData.url).toBe(this.testMashupUrl);
  });

  it('should get the right parameters', function () {
    expect(this.controller.hybridMetrics.appData.appId).toBe(this.testQBSData.appName);
  });

  it('should change pages on tab switch', function () {
    this.controller.changeTabs(false, true);
    this.QlikService.getQBSInfo.and.returnValue(this.$q.resolve(this.testQBSBasicData));
    expect(this.controller.displayLiveResource).toBeTruthy();
    expect(this.controller.reportView.view).toBe(this.base);
    expect(this.controller.hybridMetrics.appData.appId).toBe(this.testQBSBasicData.appName);
  });
});

