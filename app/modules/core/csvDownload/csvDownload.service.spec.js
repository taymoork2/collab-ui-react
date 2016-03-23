'use strict';

describe('Service: CsvDownloadService', function () {
  var CsvDownloadService, $httpBackend, UrlConfig;

  var Authinfo = {
    getOrgId: jasmine.createSpy('getOrgId').and.returnValue('1')
  };

  beforeEach(module('Core'));

  beforeEach(module(function ($provide) {
    $provide.value("Authinfo", Authinfo);
  }));

  beforeEach(inject(function (_CsvDownloadService_, _$httpBackend_, _UrlConfig_) {
    CsvDownloadService = _CsvDownloadService_;
    $httpBackend = _$httpBackend_;
    UrlConfig = _UrlConfig_;
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('getCsv(user)', function () {
    var userFile = {
      "some": "user"
    };
    beforeEach(function () {
      $httpBackend.expectGET(UrlConfig.getAdminServiceUrl() + 'csv/organizations/1/users/export').respond(userFile);
    });

    it('should get user export file', function () {
      CsvDownloadService.getCsv('user').then(function (url) {
        expect(url).toContain('blob');
      });
      $httpBackend.flush();
    });
  });

  describe('getCsv(user, true)', function () {
    var userCsvString = "John Doe,jdoe@gmail.com,Spark Call";
    beforeEach(function () {
      $httpBackend.expectPOST(UrlConfig.getUserReportsUrl(Authinfo.getOrgId())).respond({
        id: '1234'
      });
      $httpBackend.expectGET(UrlConfig.getUserReportsUrl(Authinfo.getOrgId()) + '/1234').respond(userCsvString);
    });

    it('should get user export file for a large org', function () {
      CsvDownloadService.getCsv('template', true).then(function (url) {
        expect(url).toContain('blob');
      });
      $httpBackend.flush();
    });
  });
});
