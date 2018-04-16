import moduleName from './index';

describe('Service: FirstTimeCalling Service', function () {
  beforeEach(function init() {
    this.initModules(moduleName);
    this.injectDependencies(
      '$httpBackend',
      '$q',
      'Authinfo',
      'FirstTimeCallingService',
      'UrlConfig',
    );
    this.athenaServiceUrl = this.UrlConfig.getAthenaServiceUrl();
    this.orgId = 'testOrg-4b2d-a896-622ebb973506';
    spyOn(this.Authinfo, 'getOrgId').and.returnValue(this.orgId);
  });

  afterEach(function () {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  describe('Getting Call Details for SPARK', function () {
    it ('should return the call details', function () {
      this.$httpBackend.expectGET(`${this.athenaServiceUrl}/organizations/${this.Authinfo.getOrgId()}/cluster/testcluster/first_time_calling/?relativeTime=15m&callType=SPARK`).respond(200, {
        callstart: '2018-04-05T06:12:05.293Z',
        callers: [
          'TP_ENDPOINT',
          'MAC',
        ],
        callType: 'SPARK',
      });
      this.FirstTimeCallingService.getServiceStatus('testcluster', 'SPARK').then((result) => {
        expect(result.callers.length).toEqual(2);
      });
      this.$httpBackend.flush();
    });
    it ('should return empty client types if there is no call', function () {
      this.$httpBackend.expectGET(`${this.athenaServiceUrl}/organizations/${this.Authinfo.getOrgId()}/cluster/testcluster/first_time_calling/?relativeTime=15m&callType=SPARK`).respond(500, {
        callers: [],
        callType: 'SPARK',
        callStartTime: '',
      });
      this.FirstTimeCallingService.getServiceStatus('testcluster', 'SPARK').catch((result) => {
        expect(result.callers.length).toEqual(0);
      });
      this.$httpBackend.flush();
    });
  });
});
