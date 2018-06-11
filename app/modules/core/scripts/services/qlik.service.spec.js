'use strict';

describe('Service: QlikService', function () {
  beforeEach(angular.mock.module('Core'));

  var $httpBackend, Config, QlikService, UrlConfig;
  var testData;

  beforeEach(inject(function (_$httpBackend_, _Config_, _QlikService_, _UrlConfig_) {
    $httpBackend = _$httpBackend_;
    Config = _Config_;
    QlikService = _QlikService_;
    UrlConfig = _UrlConfig_;

    testData = {
      postParam: {
        siteUrl: 'go.webex.com',
        email: 'qvadmin@cisco.com',
        org_id: 'TEST-QV-3',
      },
      appSuccessResult: {
        appUrl: 'https://qlik-loader/custportal/sense/app/7799d0da-e138-4e21-a9ad-0a5f2cee053a/?QlikTicket=acOEkuE_YU4WFUQL',
        ticket: 'acOEkuE_YU4WFUQL',
      },
      qlikMashupUrl: 'qlik-loader/',
    };
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('WebEx Metrics Status for server', function () {
    it('should return spark appId and ticket if call getQBSInfo API', function () {
      $httpBackend.expectPOST(/.*\/basic_spark_v1\.*/, testData.postParam).respond(200, testData.appSuccessResult);
      QlikService.getQBSInfo('spark', 'Basic', testData.postParam).then(function (response) {
        expect(response).toEqual(testData.appSuccessResult);
      });
      $httpBackend.flush();
    });

    it('should return webex appId and ticket if call getProdToBTSQBSInfo API', function () {
      $httpBackend.expectPOST(/.*\/basic_webex_v1\.*/, testData.postParam).respond(200, testData.appSuccessResult);
      QlikService.getProdToBTSQBSInfo('webex', 'Basic', testData.postParam).then(function (response) {
        expect(response).toEqual(testData.appSuccessResult);
      });
      $httpBackend.flush();
    });

    it('should return webex appId and ticket on integration if call getProdToBTSQBSInfo API without siteId', function () {
      $httpBackend.expectPOST(/.*\/premium_webex_v1\.*/, testData.postParam).respond(200, testData.appSuccessResult);
      spyOn(Config, 'getEnv').and.returnValue('prod');
      spyOn(QlikService, 'callReportQBSBTS').and.returnValue(testData.appSuccessResult);
      QlikService.getProdToBTSQBSInfo('webex', 'Premium', testData.postParam, 'prod').then(function (response) {
        expect(QlikService.callReportQBSBTS).toHaveBeenCalled();
        expect(response).toEqual(testData.appSuccessResult);
      });
      $httpBackend.flush();
    });
  });

  describe('WebEx/Spark report Qlik mashup address', function () {
    it('should return Qlik mashup address if error code not exist', function () {
      spyOn(UrlConfig, 'getQlikReportAppUrl');
      UrlConfig.getQlikReportAppUrl.and.returnValue(testData.qlikMashupUrl);
      var appUrl = QlikService.getQlikMashupUrl(testData.qlikMashupUrl, 'spark', 'Basic');
      expect(appUrl).toEqual('qlik-loader/spark-report-basic/spark-report-basic.html');
    });
  });
});
