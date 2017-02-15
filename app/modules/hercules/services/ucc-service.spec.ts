import { UCCService } from './ucc-service';

describe('UCCService', () => {

  beforeEach(angular.mock.module('Hercules'));
  beforeEach(angular.mock.module(mockDependencies));

  let voicemailBaseUrl = 'https://ucc-integration.wbx2.com/voicemail/api/v1';
  let HybridVoicemailUrl = 'https://ucc-integration.wbx2.com/voicemail/api/v1';
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
    let Authinfo = {
      getOrgId: jasmine.createSpy('getOrgId').and.returnValue(orgId),
    };
    $provide.value('Authinfo', Authinfo);
  }

  it('should call the correct backend service, with the logged-in users orgId if none is provided', () => {
    $httpBackend.expectGET(`https://ucc-integration.wbx2.com/ucm-service/api/v1/userDiscovery/${orgId}/${userId}`).respond([]);
    service.getUserDiscovery(userId);

  });

  it('should call the correct backend service, using the provided orgId', () => {
    let providedOrgId = 'funkSchmunk';
    $httpBackend.expectGET(`https://ucc-integration.wbx2.com/ucm-service/api/v1/userDiscovery/${providedOrgId}/${userId}`).respond([]);
    service.getUserDiscovery(userId, providedOrgId);
  });

  it('should call the correct backend when reading org level hybrid voicemail status', () => {
    $httpBackend.expectGET(`${voicemailBaseUrl}/vmOrgStatus/orgs/${orgId}/`).respond([]);
    service.getOrgVoicemailConfiguration(orgId);
  });

  it('should call the correct backend when enabling hybrid voicemail', () => {
    $httpBackend.expectPOST(`${voicemailBaseUrl}/vmOrgStatus/orgs/${orgId}/`).respond([]);
    service.enableHybridVoicemail(orgId);
  });

  it('should call the correct backend when disabling hybrid voicemail', () => {
    $httpBackend.expectPOST(`${voicemailBaseUrl}/vmOrgStatus/orgs/${orgId}/`).respond([]);
    service.disableHybridVoicemail(orgId);
  });

  it('should call the correct backend when getting UserVoicemailInfo, using the provided orgId', () => {
    $httpBackend.expectGET(`${HybridVoicemailUrl}/vmInfo/orgs/${orgId}/users/${userId}/`).respond([]);
    service.getUserVoicemailInfo(userId, orgId);
  });

  it('should call the correct backend when getting UserVoicemailInfo with the logged-in users orgId if none is provided', () => {
    $httpBackend.expectGET(`${HybridVoicemailUrl}/vmInfo/orgs/${orgId}/users/${userId}/`).respond([]);
    service.getUserVoicemailInfo(userId);
  });

});
