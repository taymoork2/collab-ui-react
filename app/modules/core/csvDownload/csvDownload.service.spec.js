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
      data: {
        "some": "user"
      }
    };
    beforeEach(function () {
      $httpBackend.expectGET(UrlConfig.getAdminServiceUrl() + 'csv/organizations/1/users/export').respond(userFile);
    });

    it('should get user export file', function () {
      CsvDownloadService.getCsv('user').then(function (data) {
        expect(data).toContain('blob');
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
      CsvDownloadService.getCsv('user', true).then(function (data) {
        expect(data).toContain('blob');
      });
      $httpBackend.flush();
    });
  });

  describe('getCsv(headers)', function () {
    var headersObj = {
      data: {
        "columns": [{
          "name": "First Name"
        }, {
          "name": "Last Name"
        }]
      }
    };
    beforeEach(function () {
      $httpBackend.expectGET(UrlConfig.getAdminServiceUrl() + 'csv/organizations/1/users/headers').respond(headersObj);
    });

    it('should get headers object', function () {
      CsvDownloadService.getCsv('headers').then(function (response) {
        expect(response.data.columns.length).toBe(2);
        expect(response.data.columns[0].name).toBe("First Name");
        expect(response.data.columns[1].name).toBe("Last Name");
      });
      $httpBackend.flush();
    });
  });

});
