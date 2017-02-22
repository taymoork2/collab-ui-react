import testModule from './index';

describe('Service: TelephonyDomainService', () => {
  beforeAll(function () {
    this.customerId = 'ff808081527ccb3f0153116a3531041e';
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
      expect(res[1].bridgeSet).toEqual('N/A+backupBridgeName');
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
      expect(res[1].bridgeSet).toEqual('primaryBridgeName+N/A');
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
});
