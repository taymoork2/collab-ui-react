'use strict';

describe('Service: QlikService', function () {
  beforeEach(angular.mock.module('Core'));

  var $httpBackend, Config, QlikService, UrlConfig;

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
    qbsUrl: 'qlik-engine/api/v1/report/session/',
    qlikMashupUrl: 'qlik-loader/',
  };

  afterEach(function () {
    $httpBackend = Config = QlikService = UrlConfig = undefined;
  });

  afterAll(function () {
    regex = undefined;
  });

  beforeEach(inject(function (_$httpBackend_, _Config_, _QlikService_, _UrlConfig_) {
    $httpBackend = _$httpBackend_;
    Config = _Config_;
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

    it('should return spark appId and ticket if call getQBSInfo API', function () {
      var promise = QlikService.getQBSInfo('spark', 'Basic', testData.postParam);
      $httpBackend.flush();
      var res = promise.$$state.value;
      expect(Object.keys(res.data)).toContain('ticket');
    });

    it('should return webex appId and ticket if call getProdToBTSQBSInfo API', function () {
      var promise = QlikService.getProdToBTSQBSInfo('webex', 'Basic', testData.postParam);
      $httpBackend.flush();
      var res = promise.$$state.value;
      expect(Object.keys(res.data)).toContain('ticket');
    });

    it('should return webex appId and ticket on integration if call getProdToBTSQBSInfo API without siteId', function () {
      spyOn(Config, 'getEnv').and.returnValue('prod');
      spyOn(UrlConfig, 'getQlikServiceUrl').and.returnValue(testData.qbsUrl);
      var promise = QlikService.getProdToBTSQBSInfo('webex', 'Premium', testData.postParam);
      promise.then(function (data) {
        expect(data).toContain('ticket');
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
