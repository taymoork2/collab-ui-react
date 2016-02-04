'use strict';

describe('Service: CsvDownloadService', function () {
  var CsvDownloadService, $httpBackend, Config;

  var Authinfo = {
    getOrgId: jasmine.createSpy('getOrgId').and.returnValue('1')
  };

  beforeEach(module('Core'));

  beforeEach(module(function ($provide) {
    $provide.value("Authinfo", Authinfo);
  }));

  beforeEach(inject(function (_CsvDownloadService_, _$httpBackend_, _Config_) {
    CsvDownloadService = _CsvDownloadService_;
    $httpBackend = _$httpBackend_;
    Config = _Config_;
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('getCsv(template)', function () {
    var templateFile = {"some": "template"};
    beforeEach(function () {
      $httpBackend.expectGET(Config.getAdminServiceUrl() + 'csv/organizations/1/users/template').respond(templateFile);
    });

    it('should get template file', function () {
      CsvDownloadService.getCsv('template').then(function (response) {
        expect(response.data.some).toEqual('template');
      });
      $httpBackend.flush();
    });
  });

  describe('getCsv(user)', function () {
    var userFile = {"some": "user"};
    beforeEach(function () {
      $httpBackend.expectGET(Config.getAdminServiceUrl() + 'csv/organizations/1/users/export').respond(userFile);
    });

    it('should get user export file', function () {
      CsvDownloadService.getCsv('user').then(function (response) {
        expect(response.data.some).toEqual('user');
      });
      $httpBackend.flush();
    });
  });

  describe('getCsv(headers)', function () {
    var headersFile = {"some": "headers"};
    beforeEach(function () {
      $httpBackend.expectGET(Config.getAdminServiceUrl() + 'csv/organizations/1/users/headers').respond(headersFile);
    });

    it('should get headers file', function () {
      CsvDownloadService.getCsv('headers').then(function (response) {
        expect(response.data.some).toEqual('headers');
      });
      $httpBackend.flush();
    });
  });
});
