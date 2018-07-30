import moduleName from './index';
import { PartnerSearchService } from './partner-search.service';
import { TrackUsageEvent } from './track-usage.enum';
import { TrackUsageService } from './track-usage.service';

type Test = atlas.test.IServiceTest<{
  $httpBackend;
  $q;
  Authinfo;
  UrlConfig;
  PartnerSearchService: PartnerSearchService,
  TrackUsageService: TrackUsageService;
}>;

describe('Service: TrackUsageService', () => {
  beforeAll(function () {
    this.url = 'https://qlik-broker-service.cisco.com/qlik-gtwy-server-1.0-SNAPSHOT/qlik-gtwy/api/v1/log';
  });

  beforeEach(function (this: Test) {
    this.initModules(moduleName);
    this.injectDependencies('$httpBackend', '$q', 'Authinfo', 'UrlConfig', 'PartnerSearchService', 'TrackUsageService');
    spyOn(this.Authinfo, 'getUserName').and.returnValue('feipen');
    spyOn(this.Authinfo, 'getPrimaryEmail').and.returnValue('feipen@cisco.com');
    spyOn(this.Authinfo, 'getOrgId').and.returnValue('1eb65fdf-9643-417f-9974-ad72cae0e10f');
    spyOn(this.Authinfo, 'getOrgName').and.returnValue('Cisco');
    spyOn(this.PartnerSearchService, 'getServerTime').and.returnValue(this.$q.resolve({ dateLong: 1531386289482 }));
  });

  afterEach(function (this: Test) {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  it('should track the correct event', function (this: Test) {
    spyOn(this.$http, 'post');
    spyOn(this.Authinfo, 'isPartner').and.returnValue(false);
    spyOn(this.Authinfo, 'isPartnerSalesAdmin').and.returnValue(false);

    const mockData = {
      logType: 'diagnostic_usage',
      timestamp: 1531386289482,
      api: 'meetings',
      user: 'feipen',
      email: 'feipen@cisco.com',
      orgId: '1eb65fdf-9643-417f-9974-ad72cae0e10f',
      orgName: 'Cisco',
      adminType: 'Customer',
    };

    this.TrackUsageService.track(TrackUsageEvent.MEETINGS);
    this.$scope.$apply();
    expect(this.$http.post).toHaveBeenCalledWith(this.url, mockData);
  });
});
