'use strict';

describe('Controller: Auto License Ctrl', function () {
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

    this.testMashupUrl = 'qlik-loader/custportal';
    this.testQBSData = {
      ticket: '0Ibh4usd9bERRzLR',
      host: 'qlik-loader',
      qlik_reverse_proxy: 'qlik-loader',
      appName: 'license',
      isPersistent: 'false',
    };
    this.testQBSBasicData = {
      ticket: '0Ibh4usd9bERRzL2',
      host: 'qlik-loader',
      qlik_reverse_proxy: 'qlik-loader',
      appName: 'license',
      isPersistent: 'false',
      appDefaultName: 'license',
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
      this.controller = this.$controller('AutoLicenseCtrl', {
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
    expect(this.controller.sparkMetrics.appData.url).toBe(this.testMashupUrl);
  });

  it('should get the right parameters', function () {
    expect(this.controller.sparkMetrics.appData.appId).toBe(this.testQBSData.appName);
  });

});

