'use strict';

describe('Service: CsvDownloadService', function () {
  var CsvDownloadService, $httpBackend, UrlConfig, $window, UserCsvService;
  var typeTemplate = 'template';
  var typeUser = 'user';
  var typeError = 'error';

  var Authinfo = {
    getOrgId: jasmine.createSpy('getOrgId').and.returnValue('1')
  };

  beforeEach(angular.mock.module('Core'));

  beforeEach(angular.mock.module(function ($provide) {
    $provide.value("Authinfo", Authinfo);
  }));

  beforeEach(inject(function (_CsvDownloadService_, _$httpBackend_, _UrlConfig_, _$window_, _UserCsvService_) {
    CsvDownloadService = _CsvDownloadService_;
    $httpBackend = _$httpBackend_;
    UrlConfig = _UrlConfig_;
    $window = _$window_;
    UserCsvService = _UserCsvService_;
  }));

  describe("Browser: Firefox, Chrome, and cross-browser tests", function () {

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
        CsvDownloadService.getCsv(typeUser).then(function (data) {
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
        CsvDownloadService.getCsv(typeUser, true).then(function (data) {
          expect(data).toContain('blob');
        });
        $httpBackend.flush();
      });
    });

    describe('getCsv(user, false, filename, true)', function () {
      var userFile = {
        "some": "user"
      };
      beforeEach(function () {
        $httpBackend.expectPOST(UrlConfig.getAdminServiceUrl() + 'csv/organizations/1/users/report').respond(201, {
          id: '1234'
        });
        $httpBackend.expectGET(UrlConfig.getAdminServiceUrl() + 'csv/organizations/1/users/report/1234').respond(userFile);
      });

      it('should get user export file using the report API', function () {
        CsvDownloadService.getCsv(typeUser, false, 'filename', true).then(function (data) {
          expect(data).toContain('blob');
        });
        $httpBackend.flush();
      });
    });

    describe('getCsv(error)', function () {
      var errorArray = [{
        row: '1',
        email: 'a@cisco.com',
        error: 'Some error 1'
      }, {
        row: '100',
        email: 'b@cisco.com',
        error: 'Some error 100'
      }];
      beforeEach(function () {
        spyOn(UserCsvService, 'getCsvStat').and.returnValue({
          userErrorArray: errorArray
        });
      });

      it('should get error export file', function () {
        CsvDownloadService.getCsv(typeError).then(function (data) {
          expect(data).toContain('blob');
        });
      });
    });

    describe('getCsv(headers)', function () {
      var headersObj = {
        "columns": [{
          "name": "First Name"
        }, {
          "name": "Last Name"
        }]
      };
      beforeEach(function () {
        $httpBackend.expectGET(UrlConfig.getAdminServiceUrl() + 'csv/organizations/1/users/headers').respond(headersObj);
      });

      it('should get headers object', function () {
        CsvDownloadService.getCsv('headers').then(function (response) {
          expect(response.columns.length).toBe(2);
          expect(response.columns[0].name).toBe("First Name");
          expect(response.columns[1].name).toBe("Last Name");
        });
        $httpBackend.flush();
      });
    });

    describe('getCsv(template)', function () {

      var templateData = 'First Name,Last Name,Display Name,User ID/Email (Required),Calendar Service,Call Service Aware,Call Service Connect,Meeting 25 Party,Spark Message,asdasjs.webex.com - WebEx Meeting Center,ironman.my.dmz.webex.com - WebEx Meeting Center,mcsqsite29.mydev.dmz.webex.com - ' +
        'WebEx Meeting Center, mcsqsite30.mydev.dmz.webex.com - WebEx Meeting Center, testnam7oct1600qa.webex.com - WebEx Meeting Center, thanhho2016.mydev.dmz.webex.com - WebEx Meeting Center ' +
        'John,Doe,John Doe,johndoe@example.com,true,true,true,true,true,true,true,true,true,true,true ' +
        'Jane,Doe,Jane Doe,janedoe@example.com,false,false,false,false,false,false,false,false,false,false,false';

      beforeEach(function () {
        $httpBackend.expectGET(UrlConfig.getAdminServiceUrl() + 'csv/organizations/1/users/template').respond(templateData);
      });

      it('should get template when !tooManyUsers users', function () {
        CsvDownloadService.getCsv(CsvDownloadService.typeTemplate, false, 'template.csv').then(function (data) {
          expect(data).toContain('blob');
        });
        $httpBackend.flush();
      });

      it('should get template when tooManyUsers users', function () {
        CsvDownloadService.getCsv(CsvDownloadService.typeTemplate, true, 'template.csv').then(function (data) {
          expect(data).toContain('blob');
        });
        $httpBackend.flush();
      });

    });
  });

  describe('Browser: IE specific tests', function () {

    beforeEach(function () {
      $window.URL.createObjectURL = jasmine.createSpy('createObjectURL').and.callFake(function () {
        return 'blob';
      });
      $window.navigator.msSaveOrOpenBlob = jasmine.createSpy('msSaveOrOpenBlob').and.callFake(function () { });
    });

    it('openInIE should only call msSaveOrOpenBlob when there is a saved blob of the correct type', function () {
      CsvDownloadService.openInIE(typeUser, 'fileName.csv');
      expect($window.navigator.msSaveOrOpenBlob).not.toHaveBeenCalled();

      CsvDownloadService.createObjectUrl({}, typeUser, 'fileName.csv');
      CsvDownloadService.openInIE(typeUser, 'fileName.csv');
      expect($window.navigator.msSaveOrOpenBlob.calls.count()).toEqual(2);
      CsvDownloadService.openInIE(typeTemplate, 'fileName.csv');
      expect($window.navigator.msSaveOrOpenBlob.calls.count()).toEqual(2);

      CsvDownloadService.createObjectUrl({}, typeTemplate, 'fileName.csv');
      CsvDownloadService.openInIE(typeTemplate, 'fileName.csv');
      expect($window.navigator.msSaveOrOpenBlob.calls.count()).toEqual(4);
    });

    it('createObjectUrl should return the blob, but call openInIE', function () {
      var blob = CsvDownloadService.createObjectUrl({}, typeUser, 'fileName.csv');
      expect(blob).toEqual('blob');
      expect($window.navigator.msSaveOrOpenBlob).toHaveBeenCalled();
    });
  });

});
