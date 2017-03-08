import testModule from './index';

describe('Service: TelephonyDomainService', () => {
  beforeAll(function () {
    this.customerId = 'ff808081527ccb3f0153116a3531041e';
    this.ccaDomainId = '8a607bdb59baadf5015a650a2003157e';
    this.domainName = '0520_Bing_TD_02';
    this.preData = {
      links: [],
      content: {
        data: {
          body: [],
          returnCode: 0,
          trackId: '' },
        health: {
          code: 200,
          status: 'OK' },
      },
    };
  });

  beforeEach(function () {
    this.initModules(testModule);
    this.injectDependencies('$httpBackend', 'UrlConfig', '$q', 'TelephonyDomainService');
  });

  afterEach(function () {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  it('should get correct data for getTelephonyDomains', function () {
    let mockData = this.preData;
    mockData.content.data.body = [
      {
        domainName: 'Test12',
        primaryBridgeName: null,
        backupBridgeName: null,
        status: '',
        webDomainName: 'TestWebDomaindHQrq',
      }];
    let url = this.UrlConfig.getGeminiUrl() + 'telephonyDomains/' + 'customerId/' + this.customerId;

    this.$httpBackend.expectGET(url).respond(200, mockData);
    this.TelephonyDomainService.getTelephonyDomains(this.customerId)
      .then((res) => {
        expect(res.content.data.body.length).toBe(1);
      });
    this.$httpBackend.flush();
  });

  it('only generate header when export Telephony Domains list', function () {
    spyOn(this.TelephonyDomainService, 'getTelephonyDomains').and.returnValue(this.$q.resolve());

    let mockData = this.preData;
    mockData.content.data.body = [];
    this.TelephonyDomainService.getTelephonyDomains.and.returnValue(this.$q.resolve(mockData));
    this.TelephonyDomainService.telephonyDomainsExportCSV(this.customerId).then((res) => {
      expect(res.length).toBe(1);
    });
  });

  it('generate correct data with no primaryBridge when export Telephony Domains list', function () {
    spyOn(this.TelephonyDomainService, 'getTelephonyDomains').and.returnValue(this.$q.resolve());

    let mockData = this.preData;
    mockData.content.data.body = [
      {
        domainName: 'Test12',
        primaryBridgeName: null,
        backupBridgeName: 'backupBridgeName',
        status: 'A',
        telephonyDomainSites: [],
        webDomainName: 'TestWebDomaindHQrq',
        description: 'CustomAttribute',
      }];
    this.TelephonyDomainService.getTelephonyDomains.and.returnValue(this.$q.resolve(mockData));
    this.TelephonyDomainService.telephonyDomainsExportCSV(this.customerId).then((res) => {
      expect(res[1].bridgeSet).toContain('N/A+');
    });
  });

  it('generate correct data with no backupBridgeName when export Telephony Domains list', function () {
    spyOn(this.TelephonyDomainService, 'getTelephonyDomains').and.returnValue(this.$q.resolve());

    let mockData = this.preData;
    mockData.content.data.body = [
      {
        domainName: 'Test12',
        primaryBridgeName: 'primaryBridgeName',
        backupBridgeName: null,
        status: 'A',
        telephonyDomainSites: [],
        webDomainName: 'TestWebDomaindHQrq',
        description: 'CustomAttribute',
      }];
    this.TelephonyDomainService.getTelephonyDomains.and.returnValue(this.$q.resolve(mockData));
    this.TelephonyDomainService.telephonyDomainsExportCSV(this.customerId).then((res) => {
      expect(res[1].bridgeSet).toContain('+N/A');
    });
  });

  it('generate correct data with no site when export Telephony Domains list', function () {
    spyOn(this.TelephonyDomainService, 'getTelephonyDomains').and.returnValue(this.$q.resolve());

    let mockData = this.preData;
    mockData.content.data.body = [
      {
        domainName: 'Test12',
        primaryBridgeName: 'primaryBridgeName',
        backupBridgeName: 'backupBridgeName',
        status: 'A',
        telephonyDomainSites: [],
        webDomainName: 'TestWebDomaindHQrq',
        description: 'CustomAttribute',
      }];
    this.TelephonyDomainService.getTelephonyDomains.and.returnValue(this.$q.resolve(mockData));
    this.TelephonyDomainService.telephonyDomainsExportCSV(this.customerId).then((res) => {
      expect(res.length).toBe(2);
    });
  });

  it('generate correct data with multiple sites when export Telephony Domains list', function () {
    spyOn(this.TelephonyDomainService, 'getTelephonyDomains').and.returnValue(this.$q.resolve());

    let mockData = this.preData;
    mockData.content.data.body = [
      {
        domainName: 'Test12',
        primaryBridgeName: null,
        backupBridgeName: null,
        status: 'A',
        telephonyDomainSites: [
          {
            siteUrl: 'atlascca1.webex.com',
          },
          {
            siteUrl: 'atlascca2.webex.com',
          }],
        webDomainName: 'TestWebDomaindHQrq',
        description: 'CustomAttribute',
      }];
    this.TelephonyDomainService.getTelephonyDomains.and.returnValue(this.$q.resolve(mockData));
    this.TelephonyDomainService.telephonyDomainsExportCSV(this.customerId).then((res) => {
      expect(res[2].domainName).toBe('');
    });
  });

  it('should get notes for Telephony Domain', function () {
    let mockData = this.preData;
    mockData.content.data.body = [
      {
        id: '9ce78fcf-1dff-499c-9bae-57ccef22e660',
        userId: 'feng5@mailinator.com',
        userName: 'Feng Wu-Partner Admin',
        actionTime: 'Mar 3, 2017 04:51:25',
        hasLogFile: false,
        objectID: null,
        objectName: 'note',
        siteID: '8a607bdb59baadf5015a650a2003157e',
        customerID: 'ff808081527ccb3f0153116a3531041e',
        action: 'add_note',
        actionFor: 'Telephony Domain',
        email: 'feng5@mailinator.com',
      }];
    let url = this.UrlConfig.getGeminiUrl() + 'activityLogs/' + this.customerId + '/' + this.ccaDomainId + '/add_note';

    this.$httpBackend.expectGET(url).respond(200, mockData);
    this.TelephonyDomainService.getNotes(this.customerId, this.ccaDomainId)
      .then((res) => {
        expect(res.content.data.body[0].objectName).toEqual('note');
      });
    this.$httpBackend.flush();
  });

  it('add new note for Telephony Domain', function () {
    let url = this.UrlConfig.getGeminiUrl() + 'activityLogs';

    this.$httpBackend.expectPOST(url).respond(200, this.preData);
    this.TelephonyDomainService.postNotes()
      .then((res) => {
        expect(res.content.data.returnCode).toBe(0);
      });
    this.$httpBackend.flush();
  });

  it('should get histories for Telephony Domain', function () {
    let mockData = this.preData;
    mockData.content.data.body = [
      {
        id: '9ce78fcf-1dff-499c-9bae-57ccef22e660',
        userId: 'feng5@mailinator.com',
        userName: 'Feng Wu-Partner Admin',
        actionTime: 'Mar 3, 2017 04:51:25',
        hasLogFile: false,
        objectID: '0520_Bing_TD_02',
        objectName: 'comment',
        siteID: '8a607bdb59baadf5015a650a2003157e',
        customerID: 'ff808081527ccb3f0153116a3531041e',
        action: 'rejected',
        actionFor: 'Telephony Domain',
        email: 'feng5@mailinator.com',
      }];
    let url = this.UrlConfig.getGeminiUrl() + 'activityLogs/' + this.customerId + '/' + this.ccaDomainId + '/Telephony%20Domain/' + this.domainName;

    this.$httpBackend.expectGET(url).respond(200, mockData);
    this.TelephonyDomainService.getHistories(this.customerId, this.ccaDomainId, this.domainName)
      .then((res) => {
        expect(res.content.data.body[0].objectName).toEqual('comment');
      });
    this.$httpBackend.flush();
  });
});
