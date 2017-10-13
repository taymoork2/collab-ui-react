import testModule from './index';

describe('Service: TelephonyDomainService', () => {
  beforeEach(function () {
    this.preData = _.cloneDeep(getJSONFixture('gemini/common.json'));

    this.domainName = '0520_Bing_TD_02';
    this.customerId = 'ff808081527ccb3f0153116a3531041e';
    this.ccaDomainId = '8a607bdb59baadf5015a650a2003157e';
  });

  beforeEach(function () {
    this.initModules(testModule);
    this.injectDependencies('$q', 'gemService', 'TelephonyDomainService', 'UrlConfig', '$httpBackend');

    const getCountriesUrl = this.UrlConfig.getGeminiUrl() + 'countries';
    this.$httpBackend.expectGET(getCountriesUrl).respond(200, this.preData.getCountries);
    this.$httpBackend.flush();
  });

  afterEach(function () {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  describe('Non-exportCSV', () => {
    it('should get correct data when call getTelephonyDomains', function () {
      const telephonyDomains = [{ domainName: 'Test12', primaryBridgeName: null, backupBridgeName: null, status: '' }];
      const url = `${this.UrlConfig.getGeminiUrl()}telephonydomain/customerId/${this.customerId}`;
      this.$httpBackend.expectGET(url).respond(200, telephonyDomains);

      this.TelephonyDomainService.getTelephonyDomains(this.customerId).then((res) => {
        expect(res.length).toBe(1);
      });
      this.$httpBackend.flush();
    });

    it('should get correct data when call getTelephonyDomain', function () {
      const telephonyDomain = { domainName: 'Test12', primaryBridgeName: null, backupBridgeName: null, status: '' };
      const url = `${this.UrlConfig.getGeminiUrl()}telephonydomain/getTelephonyDomainInfoByDomainId/${this.customerId}/${this.ccaDomainId}`;
      this.$httpBackend.expectGET(url).respond(200, telephonyDomain);

      this.TelephonyDomainService.getTelephonyDomain(this.customerId, this.ccaDomainId).then((res) => {
        expect(res.domainName).toEqual('Test12');
      });
      this.$httpBackend.flush();
    });

    it('should return correct data when call getRegionsDomains', function () {
      const regions = [{ ccaDomain: 'domainName', regionName: 'US', customerName: 'testD' }];
      const url = `${this.UrlConfig.getGeminiUrl()}telephonydomain/getRegionDomains`;
      this.$httpBackend.expectPOST(url).respond(200, regions);

      this.TelephonyDomainService.getRegionDomains({}).then((res) => {
        expect(res.length).toBe(1);
      });
      this.$httpBackend.flush();
    });

    it('should get correct data when call getRegions', function () {
      const regions = [{ regionId: 'US', regionName: 'US' }, { regionId: 'EMEA', regionName: 'EMEA' }, { regionId: 'APAC', regionName: 'APAC' }];
      const url = `${this.UrlConfig.getGeminiUrl()}telephonydomain/regions`;
      this.$httpBackend.expectGET(url).respond(200, regions);

      this.TelephonyDomainService.getRegions().then((res) => {
        expect(res.length).toBe(3);
      });
      this.$httpBackend.flush();
    });

    it('should get correct data when call getNumbers', function () {
      const numbers = [{ dnisId: '8a607bdb5ad0b398015aee76fff409d7', countryId: 2, tollType: 'CCA Toll', phone: '1231231', label: '3131313', dnisNumber: '123123123131', phoneType: 'Domestic', compareToSuperadminPhoneNumberStatus: '0', defaultNumber: '1', ccaDomainId: '8a607bdb5ad0b398015aee76fff309d6', isHidden: false }];
      const url = `${this.UrlConfig.getGeminiUrl()}telephonydomain/getTelephonyNumberByDomainId/${this.customerId}/${this.ccaDomainId}`;
      this.$httpBackend.expectGET(url).respond(200, numbers);

      this.TelephonyDomainService.getNumbers(this.customerId, this.ccaDomainId).then((res) => {
        expect(res[0].dnisId).toEqual('8a607bdb5ad0b398015aee76fff409d7');
      });
      this.$httpBackend.flush();
    });

    it('should get correct data when add new note for call postNotes', function () {
      const note = 'test_note';
      const url = `${this.UrlConfig.getGeminiUrl()}notes`;
      this.$httpBackend.expectPOST(url).respond(200, note);

      this.TelephonyDomainService.postNotes({}).then((res) => {
        expect(res).toEqual('test_note');
      });
      this.$httpBackend.flush();
    });

    it('should get correct data when call getHistories', function () {
      const histories = [{ id: '9ce78fcf-1dff-499c-9bae-57ccef22e660', userId: 'feng5@mailinator.com', objectID: '0520_Bing_TD_02', objectName: 'comment', siteID: '8a607bdb59baadf5015a650a2003157e', action: 'rejected' }];
      const url = `${this.UrlConfig.getGeminiUrl()}activityLogs`;
      this.$httpBackend.expectPUT(url).respond(200, histories);

      this.TelephonyDomainService.getHistories({}).then((res) => {
        expect(res[0].objectName).toEqual('comment');
      });
      this.$httpBackend.flush();
    });

    it('should get correct data when call getAccessNumberInfo', function () {
      const item = [{ number: '86000001', tollType: 'CCA Toll' }];
      const url = `${this.TelephonyDomainService.url}getAccessNumberInfo`;
      this.$httpBackend.expectPOST(url).respond(200, item);

      this.TelephonyDomainService.getAccessNumberInfo('86000001').then((res) => {
        expect(res[0].tollType).toEqual('CCA Toll');
      });
      this.$httpBackend.flush();
    });

    it('should be successful when call postTelephonyDomain', function () {
      const item = { code: 5000 };
      const url = `${this.TelephonyDomainService.url}customerId/${this.customerId}`;
      this.$httpBackend.expectPOST(url).respond(200, item);

      this.TelephonyDomainService.postTelephonyDomain(this.customerId, {}).then((res) => {
        expect(res.code).toBe(5000);
      });
      this.$httpBackend.flush();
    });

    it('should update status of Telephony Domain successfully', function () {
      const url: string = `${this.UrlConfig.getGeminiUrl()}telephonydomain/customerId/${this.customerId}/ccaDomainId/${this.ccaDomainId}/cancelSubmission`;

      this.$httpBackend.expectPUT(url).respond(200, this.customerId);
      this.TelephonyDomainService.cancelTDSubmission(this.customerId, this.ccaDomainId).then((res) => {
        expect(res).toEqual(this.customerId);
      });
      this.$httpBackend.flush();
    });

    it('should get the template url of phone numbers', function () {
      const url = this.TelephonyDomainService.getDownloadUrl();
      expect(url).toBeTruthy();
    });

    it('should move site for Telephony Domain', function () {
      const moveSite = { siteId: 858622, siteName: 'xiaoyuantest2', siteUrl: 'xiaoyuantest2.webex.com' };
      const url = `${this.UrlConfig.getGeminiUrl()}telephonydomain/moveSite`;
      this.$httpBackend.expectPUT(url).respond(200, moveSite);

      this.TelephonyDomainService.moveSite({}).then((res) => {
        expect(res.siteId).toEqual(858622);
      });
      this.$httpBackend.flush();
    });
  });

  describe('Export CSV for Phone Numbers', function () {
    it('only export the header when no phone numbers exist', function () {
      spyOn(this.TelephonyDomainService, 'getNumbers').and.returnValue(this.$q.resolve());
      this.TelephonyDomainService.getNumbers.and.returnValue(this.$q.resolve([]));
      this.TelephonyDomainService.exportNumbersToCSV(this.customerId, this.ccaDomainId).then((res) => {
        expect(res.length).toBe(1);
      });
    });

    it('export phone numbers', function () {
      spyOn(this.TelephonyDomainService, 'getNumbers').and.returnValue(this.$q.resolve());
      const mockData = [{
        phoneNumber: '121313123',
        phoneLabel: 'Label',
        defaultNumber: '1',
        tollType: 'CCA Toll',
        globalListDisplay: '1',
        isHidden: true,
        countryId: '#1',
      }, {
        phoneNumber: '121312123',
        phoneLabel: 'Label',
        defaultNumber: '0',
        tollType: 'CCA Toll',
        globalListDisplay: '1',
        isHidden: true,
        countryId: '#2',
      }, {
        phoneNumber: '121314123',
        phoneLabel: null,
        defaultNumber: '1',
        tollType: 'CCA Toll Free',
        globalListDisplay: '0',
        isHidden: false,
        countryId: '#3',
      }];
      const countries = { countryId2NameMapping: { '#1': 'Country #1', '#2': 'Country #1', '#3': 'Country #1' } };
      this.gemService.setStorage('gmCountry', countries);
      this.TelephonyDomainService.getNumbers.and.returnValue(this.$q.resolve(mockData));
      this.TelephonyDomainService.exportNumbersToCSV(this.customerId, this.ccaDomainId).then((res) => {
        expect(res.length).toBe(4);
      });

    });
  });

  describe('ExportCSV', function () {
    it('only generate header when export Telephony Domains list', function () {
      const url = `${this.UrlConfig.getGeminiUrl()}telephonydomain/customerId/${this.customerId}`;
      this.$httpBackend.expectGET(url).respond(200, []);

      this.TelephonyDomainService.telephonyDomainsExportCSV(this.customerId).then((res) => {
        expect(res.length).toBe(1);
      });
      this.$httpBackend.flush();
    });

    it('generate correct data with no primaryBridge when export Telephony Domains list', function () {
      const telephonyDomains = [{ domainName: 'Test12', primaryBridgeName: null, backupBridgeName: 'backupBridgeName', status: null, telephonyDomainSites: [], customerAttribute: null }];
      const url = `${this.UrlConfig.getGeminiUrl()}telephonydomain/customerId/${this.customerId}`;
      this.$httpBackend.expectGET(url).respond(200, telephonyDomains);

      this.TelephonyDomainService.telephonyDomainsExportCSV(this.customerId).then((res) => {
        expect(res[1].bridgeSet).toContain('N/A+');
      });
      this.$httpBackend.flush();
    });

    it('generate correct data with no backupBridgeName when export Telephony Domains list', function () {
      const telephonyDomains = [{ domainName: 'Test12', primaryBridgeName: 'primaryBridgeName', backupBridgeName: null, status: 'A', telephonyDomainSites: [], description: 'CustomAttribute' }];
      const url = `${this.UrlConfig.getGeminiUrl()}telephonydomain/customerId/${this.customerId}`;
      this.$httpBackend.expectGET(url).respond(200, telephonyDomains);

      this.TelephonyDomainService.telephonyDomainsExportCSV(this.customerId).then((res) => {
        expect(res[1].bridgeSet).toContain('+N/A');
      });
      this.$httpBackend.flush();
    });

    it('generate correct data with no site when export Telephony Domains list', function () {
      const telephonyDomains = [{ domainName: 'Test12', primaryBridgeName: 'primaryBridgeName', backupBridgeName: 'backupBridgeName', status: 'A', telephonyDomainSites: [], description: 'CustomAttribute' }];
      const url = `${this.UrlConfig.getGeminiUrl()}telephonydomain/customerId/${this.customerId}`;
      this.$httpBackend.expectGET(url).respond(200, telephonyDomains);

      this.TelephonyDomainService.telephonyDomainsExportCSV(this.customerId).then((res) => {
        expect(res.length).toBe(2);
      });
      this.$httpBackend.flush();
    });

    it('generate correct data with multiple sites when export Telephony Domains list', function () {
      const telephonyDomains = [{ domainName: 'Test12', primaryBridgeName: null, backupBridgeName: null, status: 'A', description: 'CustomAttribute',
        telephonyDomainSites: [
          { siteUrl: 'atlascca1.webex.com' },
          { siteUrl: 'atlascca2.webex.com' },
        ],
      }];
      const url = `${this.UrlConfig.getGeminiUrl()}telephonydomain/customerId/${this.customerId}`;
      this.$httpBackend.expectGET(url).respond(200, telephonyDomains);

      this.TelephonyDomainService.telephonyDomainsExportCSV(this.customerId).then((res) => {
        expect(res[2].domainName).toBe('');
      });
      this.$httpBackend.flush();
    });
  });
});
