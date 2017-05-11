import testModule from './index';

describe('Service: TelephonyDomainService', () => {
  beforeAll(function () {
    this.domainName = '0520_Bing_TD_02';
    this.customerId = 'ff808081527ccb3f0153116a3531041e';
    this.ccaDomainId = '8a607bdb59baadf5015a650a2003157e';
  });

  beforeEach(function () {
    this.initModules(testModule);
    this.injectDependencies('TelephonyDomainService', 'UrlConfig', '$httpBackend');
  });

  afterEach(function () {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  function setData(key, value) {
    let preData = { links: [], content: { health: { code: 200, status: 'OK' }, data: { body: [], returnCode: 0, trackId: '' } } };
    return _.set(preData, key, value);
  }

  describe('Non-exportCSV', () => {
    it('should get correct data when call getTelephonyDomains', function () {
      const telephonyDomains = [{ domainName: 'Test12', primaryBridgeName: null, backupBridgeName: null, status: '', webDomainName: 'TestWebDomaindHQrq' }];
      const mockData = setData.call(this, 'content.data.body', telephonyDomains);
      const url = `${this.UrlConfig.getGeminiUrl()}telephonydomain/customerId/${this.customerId}`;
      this.$httpBackend.expectGET(url).respond(200, mockData);

      this.TelephonyDomainService.getTelephonyDomains(this.customerId).then((res) => {
        expect(res.content.data.body.length).toBe(1);
      });
      this.$httpBackend.flush();
    });

    it('should get correct data when call getTelephonyDomain', function () {
      const telephonyDomain = { domainName: 'Test12', primaryBridgeName: null, backupBridgeName: null, status: '', webDomainName: 'TestWebDomaindHQrq' };
      const mockData = setData.call(this, 'content.data.body', telephonyDomain);
      const url = `${this.UrlConfig.getGeminiUrl()}telephonydomain/getTelephonyDomainInfoByDomainId/${this.customerId}/${this.ccaDomainId}`;
      this.$httpBackend.expectGET(url).respond(200, mockData);

      this.TelephonyDomainService.getTelephonyDomain(this.customerId, this.ccaDomainId).then((res) => {
        const webDomainName = _.get(res, 'content.data.body.webDomainName');
        expect(webDomainName).toBe('TestWebDomaindHQrq');
      });
      this.$httpBackend.flush();
    });

    it('should return correct data when call getRegionsDomains', function () {
      const regions = [{ ccaDomain: 'domainName', regionName: 'US', customerName: 'testD' }];
      const mockData = setData.call(this, 'content.data.body', regions);
      const url = `${this.UrlConfig.getGeminiUrl()}telephonydomain/getRegionDomains`;
      this.$httpBackend.expectPOST(url).respond(200, mockData);

      this.TelephonyDomainService.getRegionDomains({}).then((res) => {
        expect(res.content.data.body.length).toBe(1);
      });
      this.$httpBackend.flush();
    });

    it('should get correct data when call getRegions', function () {
      const regions = [{ regionId: 'US', regionName: 'US' }, { regionId: 'EMEA', regionName: 'EMEA' }, { regionId: 'APAC', regionName: 'APAC' }];
      const mockData = setData.call(this, 'content.data.body', regions);
      const url = `${this.UrlConfig.getGeminiUrl()}telephonydomain/regions`;
      this.$httpBackend.expectGET(url).respond(200, mockData);

      this.TelephonyDomainService.getRegions().then((res) => {
        expect(res.content.data.body.length).toBe(3);
      });
      this.$httpBackend.flush();
    });

    it('should get correct data when call getNumbers', function () {
      const numbers = [{ dnisId: '8a607bdb5ad0b398015aee76fff409d7', countryId: 2, tollType: 'CCA Toll', phone: '1231231', label: '3131313', dnisNumber: '123123123131', phoneType: 'Domestic', compareToSuperadminPhoneNumberStatus: '0', defaultNumber: '1', ccaDomainId: '8a607bdb5ad0b398015aee76fff309d6', isHidden: 'false' }];
      const mockData = setData.call(this, 'content.data.body', numbers);
      const url = `${this.UrlConfig.getGeminiUrl()}telephonydomain/getTelephonyNumberByDomainId/${this.customerId}/${this.ccaDomainId}`;
      this.$httpBackend.expectGET(url).respond(200, mockData);

      this.TelephonyDomainService.getNumbers(this.customerId, this.ccaDomainId).then((res) => {
        const dnisId = _.get(res, 'content.data.body[0].dnisId');
        expect(dnisId).toBe('8a607bdb5ad0b398015aee76fff409d7');
      });
      this.$httpBackend.flush();
    });

    it('should get correct data when call getNotes', function () {
      const notes = [{ id: '9ce78fcf-1dff-499c-9bae-57ccef22e660', userId: 'feng5@mailinator.com', userName: 'Feng Wu-Partner Admin', objectID: null, objectName: 'note', siteID: '8a607bdb59baadf5015a650a2003157e', action: 'add_note' }];
      const mockData = setData.call(this, 'content.data.body', notes);
      const url = `${this.UrlConfig.getGeminiUrl()}activityLogs/${this.customerId}/${this.ccaDomainId}/add_notes_td`;
      this.$httpBackend.expectGET(url).respond(200, mockData);

      this.TelephonyDomainService.getNotes(this.customerId, this.ccaDomainId).then((res) => {
        expect(res.content.data.body[0].objectName).toEqual('note');
      });
      this.$httpBackend.flush();
    });

    it('should get correct data when add new note for call postNotes', function () {
      const note = '';
      const mockData = setData.call(this, 'content.data.body', note);
      const url = `${this.UrlConfig.getGeminiUrl()}activityLogs`;
      this.$httpBackend.expectPOST(url).respond(200, mockData);

      this.TelephonyDomainService.postNotes().then((res) => {
        expect(res.content.data.returnCode).toBe(0);
      });
      this.$httpBackend.flush();
    });

    it('should get correct data when call getHistories', function () {
      const histories = [{ id: '9ce78fcf-1dff-499c-9bae-57ccef22e660', userId: 'feng5@mailinator.com', objectID: '0520_Bing_TD_02', objectName: 'comment', siteID: '8a607bdb59baadf5015a650a2003157e', action: 'rejected' }];
      const mockData = setData.call(this, 'content.data.body', histories);
      const url = `${this.UrlConfig.getGeminiUrl()}activityLogs`;
      this.$httpBackend.expectPUT(url).respond(200, mockData);

      this.TelephonyDomainService.getHistories().then((res) => {
        expect(res.content.data.body[0].objectName).toEqual('comment');
      });
      this.$httpBackend.flush();
    });

    it('should move site for Telephony Domain', function () {
      const moveSite = { siteId: 858622, siteName: 'xiaoyuantest2', siteUrl: 'xiaoyuantest2.webex.com' };
      const mockData = setData.call(this, 'content.data.body', moveSite);
      const url = `${this.UrlConfig.getGeminiUrl()}telephonydomain/moveSite`;
      this.$httpBackend.expectPUT(url).respond(200, mockData);

      this.TelephonyDomainService.moveSite({}).then((res) => {
        expect(res.content.data.body.siteId).toEqual(858622);
      });
      this.$httpBackend.flush();
    });
  });

  describe('ExportCSV', function () {
    it('only generate header when export Telephony Domains list', function () {
      const mockData = setData.call(this, 'content.data.body', []);
      const url = `${this.UrlConfig.getGeminiUrl()}telephonydomain/customerId/${this.customerId}`;
      this.$httpBackend.expectGET(url).respond(200, mockData);

      this.TelephonyDomainService.telephonyDomainsExportCSV(this.customerId).then((res) => {
        expect(res.length).toBe(1);
      });
      this.$httpBackend.flush();
    });

    it('generate correct data with no primaryBridge when export Telephony Domains list', function () {
      const telephonyDomains = [{ domainName: 'Test12', primaryBridgeName: null, backupBridgeName: 'backupBridgeName', status: 'A', telephonyDomainSites: [], webDomainName: 'TestWebDomaindHQrq', description: 'CustomAttribute' }];
      const mockData = setData.call(this, 'content.data.body', telephonyDomains);
      const url = `${this.UrlConfig.getGeminiUrl()}telephonydomain/customerId/${this.customerId}`;
      this.$httpBackend.expectGET(url).respond(200, mockData);

      this.TelephonyDomainService.telephonyDomainsExportCSV(this.customerId).then((res) => {
        expect(res[1].bridgeSet).toContain('N/A+');
      });
      this.$httpBackend.flush();
    });

    it('generate correct data with no backupBridgeName when export Telephony Domains list', function () {
      const telephonyDomains = [{ domainName: 'Test12', primaryBridgeName: 'primaryBridgeName', backupBridgeName: null, status: 'A', telephonyDomainSites: [], webDomainName: 'TestWebDomaindHQrq', description: 'CustomAttribute' }];
      const mockData = setData.call(this, 'content.data.body', telephonyDomains);
      const url = `${this.UrlConfig.getGeminiUrl()}telephonydomain/customerId/${this.customerId}`;
      this.$httpBackend.expectGET(url).respond(200, mockData);

      this.TelephonyDomainService.telephonyDomainsExportCSV(this.customerId).then((res) => {
        expect(res[1].bridgeSet).toContain('+N/A');
      });
      this.$httpBackend.flush();
    });

    it('generate correct data with no site when export Telephony Domains list', function () {
      const telephonyDomains = [{ domainName: 'Test12', primaryBridgeName: 'primaryBridgeName', backupBridgeName: 'backupBridgeName', status: 'A', telephonyDomainSites: [], webDomainName: 'TestWebDomaindHQrq', description: 'CustomAttribute' }];
      const mockData = setData.call(this, 'content.data.body', telephonyDomains);
      const url = `${this.UrlConfig.getGeminiUrl()}telephonydomain/customerId/${this.customerId}`;
      this.$httpBackend.expectGET(url).respond(200, mockData);

      this.TelephonyDomainService.telephonyDomainsExportCSV(this.customerId).then((res) => {
        expect(res.length).toBe(2);
      });
      this.$httpBackend.flush();
    });

    it('generate correct data with multiple sites when export Telephony Domains list', function () {
      const telephonyDomains = [{ domainName: 'Test12', primaryBridgeName: null, backupBridgeName: null, status: 'A', webDomainName: 'TestWebDomaindHQrq', description: 'CustomAttribute',
        telephonyDomainSites: [
          { siteUrl: 'atlascca1.webex.com' },
          { siteUrl: 'atlascca2.webex.com' },
        ],
      }];
      const mockData = setData.call(this, 'content.data.body', telephonyDomains);
      const url = `${this.UrlConfig.getGeminiUrl()}telephonydomain/customerId/${this.customerId}`;
      this.$httpBackend.expectGET(url).respond(200, mockData);

      this.TelephonyDomainService.telephonyDomainsExportCSV(this.customerId).then((res) => {
        expect(res[2].domainName).toBe('');
      });
      this.$httpBackend.flush();
    });
  });
});
