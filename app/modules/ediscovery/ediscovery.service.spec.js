'use strict';

var ediscoveryModule = require('./ediscovery.module');

var reportId = '123';
var orgId = 'xyz';
var roomId = 'abc';
var sd = moment().format();
var ed = moment().subtract(30, 'days').format();


describe('Service: EdiscoveryService', function () {
  beforeEach(angular.mock.module(ediscoveryModule));

  var Service, httpBackend, Authinfo, FeatureToggleService, UrlConfig, $q, $rootScope, $state;
  var argonautUrlBase, responseUrl, urlBase;

  beforeEach(inject(function ($httpBackend, _$q_, _$rootScope_, _$state_, _Authinfo_, _EdiscoveryService_, _FeatureToggleService_, _UrlConfig_) {
    Service = _EdiscoveryService_;
    httpBackend = $httpBackend;
    $q = _$q_;
    $rootScope = _$rootScope_;
    $state = _$state_;
    Authinfo = _Authinfo_;
    FeatureToggleService = _FeatureToggleService_;
    UrlConfig = _UrlConfig_;
    argonautUrlBase = UrlConfig.getArgonautReportUrl();
    urlBase = UrlConfig.getAdminServiceUrl();

    responseUrl = urlBase + 'compliance/organizations/' + orgId + '/reports/';

    httpBackend
      .when('GET', 'l10n/en_US.json')
      .respond({});

    spyOn(Authinfo, 'getOrgId').and.returnValue(orgId);
    spyOn(FeatureToggleService, 'atlasEdiscoveryJumboReportsGetStatus').and.returnValue($q.resolve(false));
    spyOn(Service, 'downloadReportWithSaveAs').and.returnValue($q.resolve());
    spyOn(Service, 'downloadReportLegacy').and.returnValue($q.resolve());
    spyOn($state, 'go');
  }));

  afterEach(function () {
    Service = httpBackend = Authinfo = FeatureToggleService = UrlConfig = argonautUrlBase = responseUrl = urlBase = $q = null;
  });

  describe('Argonaut Service API', function () {
    var argonautParams = {
      emailAddresses: ['test@test.com'],
      roomIds: null,
      query: null,
      encryptionKeyUrl: 'https://encryption-a.wbx2.com/encryption/api/v1/keys/af3a7741-11ca-4248-bbfd-4e5d1df87eea',
      startDate: sd,
      endDate: ed,
    };

    var result = {
      errorCode: null,
      numFiles: 0,
      numMessages: 10,
      numRooms: 1,
      totalSizeInBytes: 512,
      requestId: '5198ea1c-f085-4336-b3bc-dbeaa2a89fbb',
      webhookUrl: 'http://argonaut.cfa.wbx2.com/argonaut/api/v1/webhook/5198ea1c-f085-4336-b3bc-dbeaa2a89fbb',
    };

    beforeEach(function () {
      httpBackend.whenPOST(argonautUrlBase + '/size', argonautParams)
        .respond(result);
    });

    it('can get space info correctly', function (done) {
      Service.getArgonautServiceUrl(argonautParams).then(function (result) {
        expect(result.data.numMessages).toEqual(10);
        expect(result.data.numFiles).toEqual(0);
        expect(result.data.numRooms).toEqual(1);
        expect(result.data.totalSizeInBytes).toEqual(512);
        done();
      });
      httpBackend.flush();
    });
  });

  describe('Get Report API', function () {
    var report = {
      id: reportId,
      orgId: orgId,
      createdByUserId: 'c12145c3-0aad-43f9-9f9d-5cfc3b890ab0',
      state: 'COMPLETED',
      downloadUrl: 'http://www.vg.no',
      sizeInBytes: 149504,
      displayName: 'test123',
      lastUpdatedTime: '2016-06-09T11:49:30.127Z',
      progress: 100,
      type: 'ROOM_QUERY',
      roomQuery: {
        startDate: '2015-11-05T00:00:00.000Z',
        endDate: '2016-06-08T00:00:00.000Z',
        roomId: roomId,
      },
      runUrl: 'https://atlas-intb.ciscospark.com/admin/api/v1/compliance/organizations/1eb65fdf-9643-417f-9974-ad72cae0e10f/reports/3bab7b32-5f8c-4cf7-924c-8d46c8bc4b21/run',
      url: 'https://atlas-intb.ciscospark.com/admin/api/v1/compliance/organizations/1eb65fdf-9643-417f-9974-ad72cae0e10f/reports/3bab7b32-5f8c-4cf7-924c-8d46c8bc4b21',
    };

    var reports = {
      reports: [{
        id: reportId,
        orgId: orgId,
        createdByUserId: 'c12145c3-0aad-43f9-9f9d-5cfc3b890ab0',
        state: 'COMPLETED',
        downloadUrl: 'https://avalon-intb.ciscospark.com/avalon/api/v1/compliance/report/file/room/1eb65fdf-9643-417f-9974-ad72cae0e10f_465d5ac0-2d22-11e6-9b09-cfdd271e09dd.zip',
        sizeInBytes: 1024,
        displayName: 'test',
        lastUpdatedTime: '2016-06-10T09:05:25.281Z',
        progress: 100,
        type: 'ROOM_QUERY',
        roomQuery: {
          startDate: '2016-06-08T00:00:00.000Z',
          endDate: '2016-06-09T00:00:00.000Z',
          roomId: roomId,
        },
        runUrl: 'https://avalon-intb.ciscospark.com/avalon/api/v1/compliance/report/room',
        url: 'https://atlas-intb.ciscospark.com/admin/api/v1/compliance/organizations/1eb65fdf-9643-417f-9974-ad72cae0e10f/reports/3d0fb858-9a82-4510-93f6-7ca268e698e8',
      }],
      paging: {
        next: 'https://atlas-intb.ciscospark.com/admin/api/v1/compliance/organizations/1eb65fdf-9643-417f-9974-ad72cae0e10f/reports?limit=10&offset=10',
        limit: 10,
        offset: 0,
        count: 1,
      },
    };

    beforeEach(function () {
      httpBackend.whenGET(responseUrl + reportId)
        .respond(report);

      httpBackend.whenGET(urlBase + 'compliance/organizations/' + orgId + '/reports/?offset=0&limit=10')
        .respond(reports);
    });

    it('can call getReport correctly', function (done) {
      Service.getReport(reportId).then(function (result) {
        expect(result.id).toEqual('123');
        expect(result.orgId).toEqual('xyz');
        expect(result.type).toEqual('ROOM_QUERY');
        expect(result.progress).toEqual(100);
        done();
      });
      httpBackend.flush();
    });

    it('can call getReports correctly', function (done) {
      Service.getReports(0, 10).then(function (result) {
        expect(result.reports.length).toEqual(1);
        expect(result.reports[0].orgId).toEqual(orgId);
        expect(result.reports[0].displayName).toEqual('test');
        expect(result.reports[0].roomQuery.roomId).toEqual(roomId);
        done();
      });
      httpBackend.flush();
    });
  });

  describe('getReportKey', function () {
    var testUrl = 'kms://cisco.com/keys/14eed485-c7e0-4e4b-970b-802c63da4058';
    var goodResponse = {
      jwk: {
        toJSON: function () {
          return {
            k: '123',
          };
        },
      },
    };

    var badResponse = {
      jibberish: 'stuff',
    };

    function sparkSdkObject(isSuccess, response) {
      var spark = {};
      _.set(spark, 'internal.encryption.kms', {});
      spark.internal.encryption.kms = {
        fetchKey: function () {
          var x = $q.defer();
          var result = response;
          if (isSuccess) {
            x.resolve(result);
          } else {
            x.reject('reject reason');
          }
          return x.promise;
        },
      };
      return spark;
    }
    it('should resolve with the key if the response is succesfull in expeced format', function () {
      var spark = sparkSdkObject(true, goodResponse);
      var key = null;
      var error = null;
      Service.getReportKey(testUrl, spark).then(function (result) {
        key = result;
      })
        .catch(function (result) {
          error = result;
        });

      $rootScope.$apply();
      expect(key).toBe('123');
      expect(error).toBe(null);
    });

    it('should reject with response if response is unexpected', function () {
      var spark = sparkSdkObject(true, badResponse);
      var key = null;
      var error = null;
      Service.getReportKey(testUrl, spark).then(function (result) {
        key = result;
      }).catch(function (result) {
        error = result;
      });

      $rootScope.$apply();
      expect(key).toBe(null);
      expect(error).toEqual(badResponse);
    });

    it('should reject with an error if sdk rejects', function () {
      var spark = sparkSdkObject(false, badResponse);
      var key = null;
      var error = null;
      Service.getReportKey(null, spark).then(function (result) {
        key = result;
      }).catch(function (result) {
        error = result;
      });

      $rootScope.$apply();
      expect(key).toBe(null);
      expect(error).toBe('reject reason');
    });
  });
  describe('Create Report API', function () {
    var createReportParams = {
      displayName: 'Test',
      roomQuery: {
        startDate: null,
        endDate: null,
        keyword: null,
        roomIds: roomId,
        emailAddresses: null,
      },
    };

    var createReportResult = {
      displayName: 'Test',
      id: 'f41d296f-f301-41e0-b935-7c27714e81fa',
      orgId: orgId,
      runUrl: 'https://avalon-a.wbx2.com/avalon/api/v1/compliance/report/room',
      state: 'CREATED',
      type: 'ROOM_QUERY',
      url: 'https://atlas-a.wbx2.com/admin/api/v1/compliance/organizations/7e688a07-6ea9-422c-8246-5c564df92219/reports/f41d296f-f301-41e0-b935-7c27714e81fa',
      roomQuery: {
        startDate: '2016-06-08T00:00:00.000Z',
        endDate: '2016-06-09T00:00:00.000Z',
      },
    };

    var reportParams = {
      emailAddresses: null,
      encryptionKeyUrl: 'https://encryption-a.wbx2.com/encryption/api/v1/keys/a090b79b-e37b-4f68-95c3-3fe352692c58',
      query: null,
      roomIds: roomId,
      startDate: sd,
      endDate: ed,
      responseUri: 'https://atlas-a.wbx2.com/admin/api/v1/compliance/organizations/7e688a07-6ea9-422c-8246-5c564df92219/reports/f41d296f-f301-41e0-b935-7c27714e81fa',
    };

    beforeEach(function () {
      httpBackend.whenPOST(responseUrl, createReportParams)
        .respond(createReportResult);

      httpBackend.whenPOST(argonautUrlBase, reportParams).respond(202, '');
    });

    it('can call createReport correctly', function (done) {
      var params = {
        displayName: 'Test',
        startDate: null,
        endDate: null,
        keyword: null,
        roomIds: roomId,
        emailAddresses: null,
      };

      Service.createReport(params).then(function (result) {
        expect(result.id).toEqual('f41d296f-f301-41e0-b935-7c27714e81fa');
        expect(result.state).toEqual('CREATED');
        expect(result.orgId).toEqual(orgId);
        done();
      });
      httpBackend.flush();
    });

    it('can call generateReport correctly', function (done) {
      Service.generateReport(reportParams).then(function (result) {
        expect(result.status).toEqual(202);
        done();
      });
      httpBackend.flush();
    });
  });

  beforeEach(function () {
    httpBackend.whenPATCH(responseUrl + reportId, {
      state: 'ABORTED',
    }).respond();
  });

  describe('Patch Report API', function () {
    it('can patch report', function (done) {
      Service.patchReport(reportId, {
        state: 'ABORTED',
      }).then(function () {
        done();
      });
      httpBackend.flush();
    });
  });

  describe('Download Report Implementation', function () {
    it('should call the old implementation of download report if FT is not set', function () {
      Service.downloadReport()
        .then(function () {
          expect(Service.downloadReportLegacy).toHaveBeenCalled();
          expect(Service.downloadReportWithSaveAs).not.toHaveBeenCalled();
        });
      $rootScope.$apply();
    });

    it('should call the old implementation of download report if FT is not set', function () {
      FeatureToggleService.atlasEdiscoveryJumboReportsGetStatus.and.returnValue($q.resolve(true));
      Service.downloadReport()
        .then(function () {
          expect(Service.downloadReportLegacy).not.toHaveBeenCalled();
          expect(Service.downloadReportWithSaveAs).toHaveBeenCalled();
        });
      $rootScope.$apply();
    });
  });
});
