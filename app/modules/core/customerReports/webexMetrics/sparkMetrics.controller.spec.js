'use strict';

xdescribe('Controller: Spark Metrics Ctrl', function () {
  var controller, ITProPackService, QlikService, Userservice;

  var testData = {
    postResult: {
      "ticket": "0Ibh4usd9bERRzLR",
      "host": "qlik-loader",
      "qlik_reverse_proxy": "qlik-loader",
      "appname": "basic_spark_v1__qvadmin@cisco.com",
    },
    postAppResult: 'QRP/custportal',
  };

  afterEach(function () {
    controller = ITProPackService = QlikService = Userservice = undefined;
  });

  beforeEach(function () {
    this.initModules('Core');
    this.injectDependencies('$controller',
      '$scope',
      '$q',
      'ITProPackService');

    spyOn(ITProPackService, 'getITProPackPurchased');
    ITProPackService.getITProPackPurchased.and.returnValue(this.$q.resolve(true));

    QlikService = {
      getSparkReportQBSforPremiumUrl: function () {
        return {
          data: testData.postResult,
        };
      },
      getSparkReportAppforPremiumUrl: function () {
        return testData.postAppResult;
      },
    };

    Userservice = {
      getUser: function (user) {
        expect(user).toBe('me');
      },
    };

    controller = this.$controller('SparkMetricsCtrl', {
      $q: this.$q,
      $scope: this.$scope,
      ITProPackService: ITProPackService,
      QlikService: QlikService,
      Userservice: Userservice,
    });

    this.$scope.$apply();
  });

  it('should turn to premium view', function () {
    expect(controller.reportView.view).toBe('Premium');
  });

  it('initial state, isIframeLoaded should be false, currentFilter should be metrics', function () {
    expect(controller.sparkMetrics.appData.url).toBe('qlik-loader/custportal');
  });
});

