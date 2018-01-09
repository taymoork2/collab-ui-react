import testModule from './index';
import { CsvDownloadTypes } from './csvDownload.service';

describe('CsvDownloadService', () => {

  beforeEach(function () {
    this.initModules('Core', testModule);

    this.injectDependencies(
      '$httpBackend',
      '$window',
      '$q',
      '$rootScope',
      '$timeout',
      'UserCsvService',
      'CsvDownloadService',
      'UrlConfig',
      'Authinfo',
      'ExtractTarService',
    );

    initDependencySpies.apply(this);

    installPromiseMatchers();
  });

  afterEach(function () {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  function initDependencySpies() {
    spyOn(this.Authinfo, 'getOrgId').and.returnValue('1');
    spyOn(this.$rootScope, '$emit');
  }

  describe('Browser: Firefox, Chrome, and cross-browser tests', () => {

    describe('getCsv(user)', () => {

      const userFile = {
        some: 'user',
      };

      beforeEach(function () {
        this.$httpBackend.expectGET(this.UrlConfig.getAdminServiceUrl() + 'csv/organizations/1/users/export').respond(userFile);
      });

      it('should get user export file', function () {
        const promise = this.CsvDownloadService.getCsv(CsvDownloadTypes.TYPE_USER).then(function (data) {
          expect(data).toContain('blob:http://');
        });
        this.$httpBackend.flush();
        expect(promise).toBeResolved();
      });
    });

    describe('getCsv(user, true)', () => {
      const userReportResponse = {
        id: 54321,
        report: 'H4sIAAAAAAAAAM1UTU/cMBD9KyhnHNmOnTg+FfXjgETVavdUtEKOMwGLxFliZ2GF+t9rh90t7ALbQ6X2FGU8bzxv5vldPiZO30CnXCIvk3Gw0mnTyU1M6n4ASVKcnB6ewYMH60xvpTZO9yG363prarDe+PWEWgSYg+Gr6iCRifKtcks1eAuDqjtjP0yR1IPzaUCHS+yU+ZhcmxXYDexc6VvX23DaqM6060141hl/k/w8Tab7WujCdyLh7kY1QI20altkrPFGeTPh76GCB7Q5j82ZOhQiBeV5rQWqq4IhRiqOhCo0AoqBNbxkCqsA7sCr2JoeQHmIQIoJQwQjiueUSoYlL1LC6I+QHGj5i742jdlm8piJ8znJJctlRlPBeMxcwRBnGPvghRBlVlKa802JGQwro+FMa3BubiLvy8fEr5dxABObJzKxjmpHeH4Vn1MiKZNUpCQrf4RJ7ZDTvka9j8IFosWciIgiIsV7qC9jbPRjby1o3w8XyqrraeoHdUpEikiUM8lFyjh/UWe7n2aqh0bnjhQoSxIKLMKqa+OWrdoq4NuTlE7OopaM84MKbYVaQ9/CpARTXzVj215NYov7VtoHYSXSDyOEv5Xyapitrf5sVdXGTTWqdRB7/SePIoYP30SMzrzyY+gmWYKtjb1ONtptgnCbAhMEdUEQK3WJlCYCsargTVWxOgP9lnbDnFkY9ZxiSXOJecqpeEu7u8wslyRPhWB72mUZF4KK8JSSgz0dp7jdyzT++Bvkaf2W9OWO9eI/WZq7Q7H7pTL164Re87HZ930L+9TDewY29H2Hur4ObrkxsD+1tt+ZLgxqXO68DnAuGoYrpHOgiGFOkGo4RiWvoMkaDCov3tULyaLX4eB1ecrK/LjX8aisktCXeqHB5nDwOsbzv2B14aagzOAVWVrkr3vFeX9jT8K8T+7JrVvly4fnsjtiB4tf53Vw9CUHAAA=',
        status: 'success',
      };
      beforeEach(function () {
        const baseUrl = this.UrlConfig.getUserReportsUrl(this.Authinfo.getOrgId());
        this.$httpBackend.expectPOST(baseUrl).respond({
          id: '1234',
        });
        this.$httpBackend.expectGET(baseUrl + '/1234').respond(userReportResponse);
        this.$httpBackend.expectDELETE(baseUrl + '/1234').respond(204);
      });

      it('should get user export file for a large org', function () {
        const promise = this.CsvDownloadService.getCsv(CsvDownloadTypes.TYPE_USER, true)
          .then(function (data) {
            expect(data).toContain('blob:http://');
          });
        this.$httpBackend.flush();
        expect(promise).toBeResolved();
      });
    });

    describe('getCsv(error)', function () {
      const errorArray = [{
        row: '1',
        email: 'a@cisco.com',
        error: 'Some error 1',
      }, {
        row: '100',
        email: 'b@cisco.com',
        error: 'Some error 100',
      }];
      beforeEach(function () {
        spyOn(this.UserCsvService, 'getCsvStat').and.returnValue({
          userErrorArray: errorArray,
        });
      });

      it('should get error export file', function () {
        const promise = this.CsvDownloadService.getCsv(CsvDownloadTypes.TYPE_ERROR)
          .then(function (data) {
            expect(data).toContain('blob:http://');
          });
        expect(promise).toBeResolved();
      });
    });

    describe('getCsv(headers)', () => {
      const headersObj = {
        columns: [{
          name: 'First Name',
        }, {
          name: 'Last Name',
        }],
      };
      beforeEach(function () {
        this.$httpBackend.expectGET(this.UrlConfig.getAdminServiceUrl() + 'csv/organizations/1/users/headers').respond(headersObj);
      });

      it('should get headers object', function () {
        const promise = this.CsvDownloadService.getCsv('headers')
          .then(function (response) {
            expect(response.columns.length).toBe(2);
            expect(response.columns[0].name).toBe('First Name');
            expect(response.columns[1].name).toBe('Last Name');
          });
        this.$httpBackend.flush();
        expect(promise).toBeResolved();
      });
    });

    describe('getCsv(template)', () => {

      const templateData = 'First Name,Last Name,Display Name,User ID/Email (Required),Calendar Service,Call Service Aware,Call Service Connect,Meeting 25 Party,Spark Message,asdasjs.webex.com - WebEx Meeting Center,ironman.my.dmz.webex.com - WebEx Meeting Center,mcsqsite29.mydev.dmz.webex.com - ' +
        'WebEx Meeting Center, mcsqsite30.mydev.dmz.webex.com - WebEx Meeting Center, testnam7oct1600qa.webex.com - WebEx Meeting Center, thanhho2016.mydev.dmz.webex.com - WebEx Meeting Center ' +
        'John,Doe,John Doe,johndoe@example.com,true,true,true,true,true,true,true,true,true,true,true ' +
        'Jane,Doe,Jane Doe,janedoe@example.com,false,false,false,false,false,false,false,false,false,false,false';

      beforeEach(function () {
        this.$httpBackend.expectGET(this.UrlConfig.getAdminServiceUrl() + 'csv/organizations/1/users/template').respond(templateData);
      });

      it('should get template when !tooManyUsers users', function () {
        const promise = this.CsvDownloadService.getCsv(CsvDownloadTypes.TYPE_TEMPLATE, false, 'template.csv').then(function (data) {
          expect(data).toContain('blob:http://');
        });
        this.$httpBackend.flush();
        expect(promise).toBeResolved();
      });

      it('should get template when tooManyUsers users', function () {
        const promise = this.CsvDownloadService.getCsv(CsvDownloadTypes.TYPE_TEMPLATE, true, 'template.csv').then(function (data) {
          expect(data).toContain('blob');
        });
        this.$httpBackend.flush();
        expect(promise).toBeResolved();
      });

    });
  });

  // new user CSV download
  describe('getCsv(user, false, filename, true)', () => {

    beforeEach(function () {
      this.$httpBackend.expectPOST(this.UrlConfig.getAdminServiceUrl() + 'csv/organizations/1/users/report').respond(202, {
        location: 'http://example.com/getUserReport',
      });

      this.getUserReportRUNNING = {
        processStatus: 'RUNNING',
        message: 'Checking if to userExport-test.tar.gz exists',
        context: {},
      };

      this.getUserReportCOMPLETE = {
        processStatus: 'COMPLETE',
        message: 'Users exported to userExport-test.tar.gz',
        context: {
          length: 620,
          checksum: '7c706d76bbb1c5dd48ac148d5eda0fe5',
          fileUrl: 'https://storage101.example.com/userExport-b15ef877-901d-4a73-bab1-ed91670422b6.tar.gz',
        },
      };

      this.getUserReportFAILED = {
        processStatus: 'FAILED',
        message: 'Failed getting userExport-test.tar.gz',
        context: {},
      };

      this.getUserReportINVALID = {
        message: 'Unknown status',
        context: {},
      };

      // define the dummy tar.gz file to return
      const base64 = require('base64-js');
      const tgz: any = base64.toByteArray(
        `H4sIAAAAAAAAAO2VS4/aMBCA98yvsHLa1TppHtC9UmCrrbRUq0U9V0MyC4a81k6A/PvaPLaQgEAqag+d72DGM7bn4XHAVZ7JAqOfpUKpnFAtbq6O67nu53abuRvqv37H9ZgXuEHHb7sPbZ+5XhA8BDfMvX4oTUpVgLxx/9hXPbkrhPY3+CqkKth3SJA/w04aCJXHUG0mP3RjsG+DT48JiJjdvuJ7KSRGd3qVxLDIpF5XJmOUWwV7FinyPsQxG6FciBDZlyXImqqfpalezJ+qsRQR0zZMI5Af9tvHVTiFdIJ3fIhYiHTC/A57AVlUfJSDnJst8VYcolIwwRbnFuQyFKET3kuYiQJV4fndiYncCbPEOmvXrcj5G8QKD8ZCltthPT/uKDjj6MB+0stvsTWUvJelqPjYjF53ufIdXEGSx2gOOaU+dnTdTWsodHlRF7DIKm71p1IoZmQdeWgmSsv3UMSgbCPaJgPbOyxVcEmpNmcXWT7VbbT1qp0YX6wHUvcNexVhmKm5sNbRiBR0UzXCcIzomDCcWhju6YT34ugJ3S5PEOk+tYzM1vJBumZY35Q9NbZz19UYWwNYiIi/lEk+Fym31lM2YluFxaN8I3XV/m3tXXujD3bt9qZfXOOijyovi5TzmUiSypll01R19/ef0p9p2N2x70vsyqV+sXKzrT6/NDzTCQnoIu51n23+o2yop2xdWENVjpdQOUp/N6qD1E4ajpzbeEj/+gNOEARBEARBEARBEARBEARBEARBEARBEMR/zy+fWpDEACgAAA==`,
      );
      this.blobData = new Blob([tgz], { type: 'application/x-gzip' });

      this.extractTarServiceSpy = spyOn(this.ExtractTarService, 'extractFile').and.callFake(() => {
        // return a Blob containing dummy data. We don't care what is in the data, just
        // that it is a Blob
        return this.$q.resolve(this.blobData);
      });

    });

    it('should keep asking for user report until COMPLETE', function () {
      this.$httpBackend.expectGET('http://example.com/getUserReport').respond(200, this.getUserReportRUNNING);

      const promise = this.CsvDownloadService.getCsv(CsvDownloadTypes.TYPE_USER, false, 'filename', true);
      this.$httpBackend.flush();

      // respond with a second Running
      expect(this.$rootScope.$emit).toHaveBeenCalledWith('IDLE_TIMEOUT_KEEP_ALIVE'); //keep from logging out
      this.$httpBackend.expectGET('http://example.com/getUserReport').respond(200, this.getUserReportRUNNING);
      this.$timeout.flush();
      this.$httpBackend.flush();

      // respond with Complete and finialize processing
      this.$httpBackend.expectGET('http://example.com/getUserReport').respond(200, this.getUserReportCOMPLETE);
      this.$httpBackend.expectGET('https://storage101.example.com/userExport-b15ef877-901d-4a73-bab1-ed91670422b6.tar.gz').respond(200, this.blobData);
      this.$httpBackend.expectDELETE('http://example.com/getUserReport').respond(204);

      this.$timeout.flush();
      this.$httpBackend.flush();

      expect(promise).toBeResolved();
    });

    it('should reject promise if FAILURE is returned', function () {
      this.$httpBackend.expectGET('http://example.com/getUserReport').respond(200, this.getUserReportFAILED);
      this.CsvDownloadService.getCsv(CsvDownloadTypes.TYPE_USER, false, 'filename', true).catch( function (response) {
        expect(response.processStatus).toBe('FAILED');
      });
      this.$httpBackend.flush();
    });

    it('should reject promise if processStatus returns something unsupported', function () {
      this.$httpBackend.expectGET('http://example.com/getUserReport').respond(200, this.getUserReportINVALID);
      this.CsvDownloadService.getCsv(CsvDownloadTypes.TYPE_USER, false, 'filename', true).catch( function (response) {
        expect(response.message).toBe('Unknown status');
      })
      this.$httpBackend.flush();
    });

    it('should reject promise if fetching processStatus returns HTTP error code', function () {
      this.$httpBackend.expectGET('http://example.com/getUserReport').respond(503);
      this.CsvDownloadService.getCsv(CsvDownloadTypes.TYPE_USER, false, 'filename', true).catch( function (response) {
        expect(response.status).toBe(503);
      })
      this.$httpBackend.flush();
    });

    describe('successfully returned data', function () {

      beforeEach(function () {
        this.$httpBackend.expectGET('http://example.com/getUserReport').respond(200, this.getUserReportCOMPLETE);
        this.$httpBackend.expectGET('https://storage101.example.com/userExport-b15ef877-901d-4a73-bab1-ed91670422b6.tar.gz').respond(200, this.blobData);
      });

      it('should get user export file using the report API', function (done) {
        this.$httpBackend.expectDELETE('http://example.com/getUserReport').respond(204);

        const promise = this.CsvDownloadService.getCsv(CsvDownloadTypes.TYPE_USER, false, 'filename', true)
          .then((dataUrl) => {
            expect(dataUrl).toContain('blob:http://');
          })
          .finally(() => {
            _.defer(done);
          });
        this.$httpBackend.flush();
        expect(promise).toBeResolved();
      });

      it('should always get user export file using the report API when Cicso org', function (done) {
        this.$httpBackend.expectDELETE('http://example.com/getUserReport').respond(204);

        spyOn(this.Authinfo, 'isCisco').and.returnValue(true);
        const promise = this.CsvDownloadService.getCsv(CsvDownloadTypes.TYPE_USER, false, 'filename', false)
          .then((dataUrl) => {
            expect(dataUrl).toContain('blob:http://');
          })
          .finally(() => {
            _.defer(done);
          });
        this.$httpBackend.flush();
        expect(promise).toBeResolved();
      });

      it('should reject promise if there was a problem extracting the file', function () {
        this.extractTarServiceSpy.and.callFake(() => {
          return this.$q.reject('extract failed');
        });

        this.CsvDownloadService.getCsv(CsvDownloadTypes.TYPE_USER, false, 'filename', true).catch( function (response) {
          expect(response).toBe('extract failed');
        });
        this.$httpBackend.flush();
      });

    });
  });

  describe('Browser: IE specific tests', () => {

    beforeEach(function () {
      this.$window.URL.createObjectURL = jasmine.createSpy('createObjectURL').and.callFake(function () {
        return 'blob';
      });
      this.$window.navigator.msSaveOrOpenBlob = jasmine.createSpy('msSaveOrOpenBlob').and.callFake(function () { });
    });

    it('openInIE should only call msSaveOrOpenBlob when there is a saved blob of the correct type', function () {
      this.CsvDownloadService.openInIE(CsvDownloadTypes.TYPE_USER, 'fileName.csv');
      expect(this.$window.navigator.msSaveOrOpenBlob).not.toHaveBeenCalled();

      this.CsvDownloadService.createObjectUrl({}, CsvDownloadTypes.TYPE_USER, 'fileName.csv');
      this.CsvDownloadService.openInIE(CsvDownloadTypes.TYPE_USER, 'fileName.csv');
      expect(this.$window.navigator.msSaveOrOpenBlob.calls.count()).toEqual(2);
      this.CsvDownloadService.openInIE(CsvDownloadTypes.TYPE_TEMPLATE, 'fileName.csv');
      expect(this.$window.navigator.msSaveOrOpenBlob.calls.count()).toEqual(2);

      this.CsvDownloadService.createObjectUrl({}, CsvDownloadTypes.TYPE_TEMPLATE, 'fileName.csv');
      this.CsvDownloadService.openInIE(CsvDownloadTypes.TYPE_TEMPLATE, 'fileName.csv');
      expect(this.$window.navigator.msSaveOrOpenBlob.calls.count()).toEqual(4);
    });

    it('createObjectUrl should return the blob, but call openInIE', function () {
      const blob = this.CsvDownloadService.createObjectUrl({}, CsvDownloadTypes.TYPE_USER, 'fileName.csv');
      expect(blob).toEqual('blob');
      expect(this.$window.navigator.msSaveOrOpenBlob).toHaveBeenCalled();
    });
  });

});
