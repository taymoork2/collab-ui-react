import moduleName, { UCCService } from './ucc-service';

describe('UCCService', () => {

  beforeEach(angular.mock.module(moduleName));
  beforeEach(angular.mock.module(mockDependencies));

  let userId: any = '5505f959-6d2f-4771-8f41-53b072335dbb';
  let orgId: any = 'fe5acf7a-6246-484f-8f43-3e8c910fc50d';
  let service: any | UCCService;
  let $httpBackend;

  beforeEach(inject((UCCService, _$httpBackend_) => {
    service = UCCService;
    $httpBackend = _$httpBackend_;
  }));

  afterEach(() => {
    $httpBackend.flush();
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  afterAll(() => {
    userId = orgId = service = $httpBackend = undefined;
  });

  function mockDependencies($provide) {
    const Authinfo = {
      getOrgId: jasmine.createSpy('getOrgId').and.returnValue(orgId),
    };
    $provide.value('Authinfo', Authinfo);
  }

  it('should call the correct backend service, with the logged-in users orgId if none is provided', () => {
    $httpBackend.expectGET(`https://ucc-intb.ciscospark.com/ucm-service/api/v1/userDiscovery/${orgId}/${userId}`).respond([]);
    service.getUserDiscovery(userId);

  });

  it('should call the correct backend service, using the provided orgId', () => {
    const providedOrgId = 'funkSchmunk';
    $httpBackend.expectGET(`https://ucc-intb.ciscospark.com/ucm-service/api/v1/userDiscovery/${providedOrgId}/${userId}`).respond([]);
    service.getUserDiscovery(userId, providedOrgId);
  });

});
