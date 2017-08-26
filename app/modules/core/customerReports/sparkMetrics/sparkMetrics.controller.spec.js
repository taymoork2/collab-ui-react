'use strict';

describe('Controller: Spark Metrics Ctrl', function () {
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
      'ProPackService',
      'QlikService',
      'Userservice'
    );

    this.base = 'Base';
    this.premium = 'Premium';
    this.testData = 'qlik-loader/custportal';

    spyOn(this.Analytics, 'trackReportsEvent');
    spyOn(this.Authinfo, 'setEmails');
    spyOn(this.ProPackService, 'hasProPackPurchased').and.returnValue(this.$q.resolve(true));
    spyOn(this.QlikService, 'getSparkReportQBSforPremiumUrl').and.callFake(function () {
      return {
        then: function (callback) {
          callback({
            data: {
              ticket: '0Ibh4usd9bERRzLR',
              host: 'qlik-loader',
              qlik_reverse_proxy: 'qlik-loader',
              appname: 'basic_spark_v1__qvadmin@cisco.com',
            },
          });
        },
      };
    });
    spyOn(this.QlikService, 'getSparkReportAppforPremiumUrl').and.returnValue(this.testData);
    spyOn(this.Userservice, 'getUser').and.callFake(function (user, callback) {
      expect(user).toBe('me');
      callback({
        success: true,
        emails: ['fakeEmails@fakeEmails.com'],
      });
    });

    this.initController = function () {
      this.controller = this.$controller('SparkMetricsCtrl', {
        $sce: this.$sce,
        $scope: this.$scope,
        $timeout: this.$timeout,
        $window: this.$window,
        Analytics: this.Analytics,
        Authinfo: this.Authinfo,
        Notification: this.Notification,
        ProPackService: this.ProPackService,
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

  it('should turn to premium view', function () {
    expect(this.controller.reportView.view).toBe(this.premium);

    this.ProPackService.hasProPackPurchased.and.returnValue(this.$q.resolve(false));
    this.initController();
    expect(this.controller.reportView.view).toBe(this.base);
  });

  it('initial state, isIframeLoaded should be false, currentFilter should be metrics', function () {
    expect(this.controller.sparkMetrics.appData.url).toBe(this.testData);
  });
});

