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
    this.injectDependencies('$httpBackend', 'UrlConfig', 'TelephonyDomainService');
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
});
