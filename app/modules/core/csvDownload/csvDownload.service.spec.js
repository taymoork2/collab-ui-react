'use strict';

describe('Service: CsvDownloadService', function () {
  var CsvDownloadService, $httpBackend, UrlConfig, $window;
  var typeTemplate = 'template';
  var typeUser = 'user';

  var Authinfo = {
    getOrgId: jasmine.createSpy('getOrgId').and.returnValue('1')
  };

  beforeEach(module('Core'));

  describe("Browser: Firefox, Chrome, and cross-browser tests", function () {
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

  describe('Browser: IE specific tests', function () {
    $window = {
      URL: {
        createObjectURL: jasmine.createSpy('createObjectURL').and.callFake(function () {
          return 'blob';
        })
      },
      navigator: {
        msSaveOrOpenBlob: jasmine.createSpy('msSaveOrOpenBlob').and.callFake(function () {})
      }
    };

    beforeEach(module(function ($provide) {
      $provide.value('$window', $window);
      $provide.value("Authinfo", Authinfo);
    }));

    beforeEach(inject(function (_CsvDownloadService_) {
      CsvDownloadService = _CsvDownloadService_;
    }));

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
