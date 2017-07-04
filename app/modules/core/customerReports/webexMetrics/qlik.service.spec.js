'use strict';

xdescribe('Service: QlikService', function () {
  beforeEach(angular.mock.module('Core'));

  var $httpBackend, QlikService, UrlConfig;

  var regex = /.*\/report\.*/;

  var testData = {
    postParam: {
      siteUrl: 'go.webex.com',
      email: 'qvadmin@cisco.com',
      org_id: 'TEST-QV-3',
    },
    appSucessResult: {
      appUrl: 'https://qlik-loader/custportal/sense/app/7799d0da-e138-4e21-a9ad-0a5f2cee053a/?QlikTicket=acOEkuE_YU4WFUQL',
      ticket: 'acOEkuE_YU4WFUQL',
    },
    qlikMashupUrl: 'qlik-loader',
  };

  afterEach(function () {
    $httpBackend = QlikService = UrlConfig = undefined;
  });

  afterAll(function () {
    regex = undefined;
  });

  beforeEach(inject(function (_$httpBackend_, _QlikService_, _UrlConfig_) {
    $httpBackend = _$httpBackend_;
    QlikService = _QlikService_;
    UrlConfig = _UrlConfig_;
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('WebEx Metrics Status for server', function () {
    beforeEach(installPromiseMatchers);
    beforeEach(function () {
      $httpBackend.expectPOST(regex, testData.postParam).respond({
        data: testData.appSucessResult,
      });
    });

    it('should return appId and ticket if call Webex base API', function () {
      var promise = QlikService.getWebExReportQBSforBaseUrl(testData.postParam);

      $httpBackend.flush();
      var res = promise.$$state.value;
      expect(Object.keys(res.data)).toContain('ticket');
    });

    it('should return appId and ticket if call Webex premium API', function () {
      var promise = QlikService.getWebExReportQBSforPremiumUrl(testData.postParam);

      $httpBackend.flush();
      var res = promise.$$state.value;
      expect(Object.keys(res.data)).toContain('ticket');
    });

    it('should return appId and ticket if call Spark base API', function () {
      var promise = QlikService.getSparkReportQBSforBaseUrl(testData.postParam);

      $httpBackend.flush();
      var res = promise.$$state.value;
      expect(Object.keys(res.data)).toContain('ticket');
    });

    it('should return appId and ticket if call Spark premium API', function () {
      var promise = QlikService.getSparkReportQBSforPremiumUrl(testData.postParam);

      $httpBackend.flush();
      var res = promise.$$state.value;
      expect(Object.keys(res.data)).toContain('ticket');
    });
  });

  describe('WebEx/Spark report Qlik mashup address', function () {
    beforeEach(function () {
      spyOn(UrlConfig, 'getWebExReportAppforBaseUrl');
      spyOn(UrlConfig, 'getWebExReportAppforPremiumUrl');
      spyOn(UrlConfig, 'getSparkReportAppforBaseUrl');
      spyOn(UrlConfig, 'getSparkReportAppforPremiumUrl');
    });
    it('should return Qlik mashup address if error code not exist', function () {
      UrlConfig.getWebExReportAppforBaseUrl.and.returnValue(testData.qlikMashupUrl);
      UrlConfig.getWebExReportAppforPremiumUrl.and.returnValue(testData.qlikMashupUrl);
      UrlConfig.getSparkReportAppforBaseUrl.and.returnValue(testData.qlikMashupUrl);
      UrlConfig.getSparkReportAppforPremiumUrl.and.returnValue(testData.qlikMashupUrl);
      var appUrls = [
        QlikService.getWebExReportAppforBaseUrl(),
        QlikService.getWebExReportAppforPremiumUrl(),
        QlikService.getSparkReportAppforBaseUrl(),
        QlikService.getSparkReportAppforPremiumUrl(),
      ];
      _.each(appUrls, function (appUrl) {
        expect(appUrl).toEqual('qlik-loader');
      });
    });
  });
});
