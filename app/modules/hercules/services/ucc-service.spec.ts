import { UCCService } from './ucc-service';

describe('UCCService', () => {

  beforeEach(angular.mock.module('Hercules'));
  beforeEach(angular.mock.module(mockDependencies));

  let userId = '5505f959-6d2f-4771-8f41-53b072335dbb';
  let orgId = 'fe5acf7a-6246-484f-8f43-3e8c910fc50d';
  let service: UCCService;
  let $httpBackend;

  beforeEach(inject((UCCService, _$rootScope_, _$httpBackend_) => {
    service = UCCService;
    $httpBackend = _$httpBackend_;
  }));

  afterEach( () => {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
   });

  function mockDependencies($provide) {
    let Authinfo = {
      getOrgId: sinon.stub().returns(orgId),
    };
    $provide.value('Authinfo', Authinfo);
  }

  it('should call the correct backend service, with the logged-in users orgId if none is provided', () => {
    $httpBackend.expectGET(`https://ucc-integration.wbx2.com/ucm-service/api/v1/userDiscovery/${orgId}/${userId}`).respond([]);
    service.getUserDiscovery(userId);
    $httpBackend.flush();
  });

  it('should call the correct backend service, using the provided orgId', () => {
    let providedOrgId = 'funkSchmunk';
    $httpBackend.expectGET(`https://ucc-integration.wbx2.com/ucm-service/api/v1/userDiscovery/${providedOrgId}/${userId}`).respond([]);
    service.getUserDiscovery(userId, providedOrgId);
    $httpBackend.flush();
  });

});
