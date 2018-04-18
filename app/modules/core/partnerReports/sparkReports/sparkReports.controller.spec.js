'use strict';

describe('Controller: Spark partner report Ctrl', function () {
  function init() {
    this.initModules('Core', 'core.partner-reports');
    this.injectDependencies('$q', '$sce', '$scope', '$window', 'Analytics', 'Authinfo', 'Notification', 'QlikService', '$log', 'Userservice');
    initData.apply(this);
    initDependencySpies.apply(this);
  }

  function initController() {
    this.initController('SparkReportsCtrl', {
      $q: this.$q,
      $sce: this.$sce,
      $scope: this.$scope,
      $window: this.$window,
      Analytics: this.Analytics,
      Authinfo: this.Authinfo,
      Notification: this.Notification,
      QlikService: this.QlikService,
      $log: this.$log,
      Userservice: this.Userservice,
    });
  }

  function initData() {
    this.testData = {
      postResult: {
        ticket: '0Ibh4usd9bERRzLR',
        host: 'qlik-loader',
        qlik_reverse_proxy: 'qlik-loader',
        appname: 'partner_spark_v1__qvadmin@cisco.com',
      },
      postAppResult: 'qlik-loader/custportal',
      org_ids: [
        {
          customerOrgId: '41a5dd47-84bc-4144-8d93-110b4eb84438',
        },
        {
          customerOrgId: '09053894-e334-465b-bff2-9259fab30ce5',
        },
      ],
      testEmail: 'testEmail@test.com',
    };
  }

  function initDependencySpies() {
    var _this = this;
    spyOn(this.Notification, 'errorWithTrackingId');
    spyOn(this.Authinfo, 'getPrimaryEmail').and.returnValue(this.testData.testEmail);
    spyOn(this.QlikService, 'getQBSInfo').and.returnValue(this.$q.resolve(function () {
      return {
        data: _this.testData.postResult,
      };
    }));
    spyOn(this.QlikService, 'getQlikMashupUrl').and.returnValue(_this.testData.postAppResult);
    spyOn(this.Analytics, 'trackReportsEvent');
  }

  beforeEach(init);

  describe('Init', function () {
    beforeEach(initController);
    it('should have the controller', function () {
      expect(this.controller).toBeDefined();
    });
    it('should have the sparkReports object', function () {
      expect(this.controller.sparkReports).toBeDefined();
    });
    it('should call Analytics.trackReportsEvent during init', function () {
      expect(this.Analytics.trackReportsEvent).toHaveBeenCalledWith(this.Analytics.sections.REPORTS.eventNames.PARTNER_SPARK_REPORT);
    });
  });
});
