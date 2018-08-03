import { CustomerSearchService } from './customer-search.service';
import moduleName from './index';

type Test = atlas.test.IServiceTest<{
  $httpBackend;
  $q;
  $translate;
  Authinfo;
  CustomerSearchService: CustomerSearchService;
  UrlConfig;
}>;

describe('Service: customerSearchService', () => {
  beforeAll(function (this: Test) {
    this.conferenceID = '65241608473282200';
    this.nodeId = '2454212';
  });

  beforeEach(function (this: Test) {
    this.initModules(moduleName);
    this.injectDependencies('$httpBackend', '$q', '$translate', 'Authinfo', 'CustomerSearchService', 'UrlConfig');
  });

  afterEach(function (this: Test) {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  it('should get correct data when call getMeetings for searching', function (this: Test) {
    const mockData = [{ conferenceID: '50190706068695610', meetingNumber: '341662314', meetingName: 'Felix Cao' }];
    const url = `${this.UrlConfig.getDiagnosticUrl()}v3/meetings`;
    this.$httpBackend.expectPOST(url).respond(200, mockData);
    this.CustomerSearchService.getMeetings({ endDate: '', email: '', startDate: '', meetingNumber: '' })
      .then(res => expect(res.length).toBe(1))
      .catch(fail);

    this.$httpBackend.flush();
  });

  it('should get correct data when call getMeetingDetail', function (this: Test) {
    const mockData = { meetingBasicInfo: {}, features: {}, connection: {}, sessions: {} };
    const url = `${this.UrlConfig.getDiagnosticUrl()}v3/meetings/${this.conferenceID}/meeting-detail`;
    this.$httpBackend.expectGET(url).respond(200, mockData);
    this.CustomerSearchService.getMeetingDetail(this.conferenceID)
      .then(res => expect(res.features).toBeDefined())
      .catch(fail);

    this.$httpBackend.flush();
  });

  it('should get correct data when call getUniqueParticipants', function (this: Test) {
    const mockData = [{ userName: 'Felix Cao1', participants: [] }, { userName: 'Felix Cao2', participants: [] }];
    const url = `${this.UrlConfig.getDiagnosticUrl()}v3/meetings/${this.conferenceID}/unique-participants`;
    this.$httpBackend.expectGET(url).respond(200, mockData);
    this.CustomerSearchService.getUniqueParticipants(this.conferenceID)
      .then(res => expect(_.size(res)).toBe(2))
      .catch(fail);

    this.$httpBackend.flush();
  });

  it('should get correct data when call getParticipants', function (this: Test) {
    const mockData = [{ joinTime: 1499389211000, leaveTime: 1499399838000, conferenceID: '66735067305608980' }];
    const url = `${this.UrlConfig.getDiagnosticUrl()}v3/meetings/${this.conferenceID}/participants`;
    this.$httpBackend.expectGET(url).respond(200, mockData);
    this.CustomerSearchService.getParticipants(this.conferenceID)
      .then(res => expect(res[0].joinTime).toBeDefined())
      .catch(fail);

    this.$httpBackend.flush();
  });

  it('should get correct voip session detail', function (this: Test) {
    const mockData = { code: 0, items: [{ code: 200, completed: true }] };
    const url = `${this.UrlConfig.getDiagnosticUrl()}v2/meetings/${this.conferenceID}/voip-session-detail`;
    this.$httpBackend.expectPOST(url).respond(200, mockData);
    this.CustomerSearchService.getVoipSessionDetail(this.conferenceID, this.nodeId)
      .then(res => expect(res.items.length).toBe(1))
      .catch(fail);

    this.$httpBackend.flush();
  });

  it('should get correct video session detail', function (this: Test) {
    const mockData = { code: 0, items: [{ code: 200, completed: true }] };
    const url = `${this.UrlConfig.getDiagnosticUrl()}v2/meetings/${this.conferenceID}/video-session-detail`;
    this.$httpBackend.expectPOST(url).respond(200, mockData);
    this.CustomerSearchService.getVideoSessionDetail(this.conferenceID, this.nodeId)
      .then(res => expect(res.items.length).toBe(1))
      .catch(fail);

    this.$httpBackend.flush();
  });

  it('should get correct pstn session detail', function (this: Test) {
    const mockData = { code: 0, items: [{ code: 200, completed: true }] };
    const url = `${this.UrlConfig.getDiagnosticUrl()}v2/meetings/${this.conferenceID}/pstn-session-detail`;
    this.$httpBackend.expectPOST(url).respond(200, mockData);
    this.CustomerSearchService.getPSTNSessionDetail(this.conferenceID, this.nodeId)
      .then(res => expect(res.items.length).toBe(1))
      .catch(fail);

    this.$httpBackend.flush();
  });

  it('should get correct cmr session detail', function (this: Test) {
    const mockData = { code: 0, items: [{ code: 200, completed: true }] };
    const url = `${this.UrlConfig.getDiagnosticUrl()}v2/meetings/${this.conferenceID}/cmr-session-detail`;
    this.$httpBackend.expectPOST(url).respond(200, mockData);
    this.CustomerSearchService.getCMRSessionDetail(this.conferenceID, this.nodeId)
      .then(res => expect(res.items.length).toBe(1))
      .catch(fail);

    this.$httpBackend.flush();
  });

  it('should get correct data when call getJoinMeetingTime', function (this: Test) {
    const mockData = [{ userId: '52887', userName: 'cisqsite07 admin' }];
    const url = `${this.UrlConfig.getDiagnosticUrl()}v2/meetings/${this.conferenceID}/participants/join-meeting-time`;
    this.$httpBackend.expectGET(url).respond(200, mockData);
    this.CustomerSearchService.getJoinMeetingTime(this.conferenceID)
      .then(res => expect(res[0].userId).toBeDefined())
      .catch(fail);

    this.$httpBackend.flush();
  });

  it('should get correct service GMT time when call getServerTime', function (this: Test) {
    const mockData = { dateLong: 1513036800000 };
    const url = `${this.UrlConfig.getDiagnosticUrl()}v2/server`;
    this.$httpBackend.expectGET(url).respond(200, mockData);
    this.CustomerSearchService.getServerTime()
      .then(res => expect(res.dateLong).toBe(1513036800000))
      .catch(fail);

    this.$httpBackend.flush();
  });

  it('should get correct CMR device name when call getRealDevice', function (this: Test) {
    const mockData = { completed: true, items: [{ deviceType: 'SIP' }] };
    const url = `${this.UrlConfig.getDiagnosticUrl()}v2/meetings/${this.conferenceID}/participants/${this.nodeId}/device`;
    this.$httpBackend.expectGET(url).respond(200, mockData);
    this.CustomerSearchService.getRealDevice(this.conferenceID, this.nodeId)
      .then(res => expect(res.items[0].deviceType).toBe('SIP'))
      .catch(fail);

    this.$httpBackend.flush();
  });

  it('should get correct data when call getRoleChange', function (this: Test) {
    const mockData = [{ roleType: 'HOST' }];
    const url = `${this.UrlConfig.getDiagnosticUrl()}v3/meetings/${this.conferenceID}/rolechange`;
    this.$httpBackend.expectGET(url).respond(200, mockData);
    this.CustomerSearchService.getRoleChange(this.conferenceID)
      .then(res => expect(res[0].roleType).toBeDefined())
      .catch(fail);

    this.$httpBackend.flush();
  });

  it('should get correct data when call getSharingSessionDetail', function (this: Test) {
    const mockData = { code: 0, items: [{ code: 200, completed: true }] };
    const url = `${this.UrlConfig.getDiagnosticUrl()}v2/meetings/${this.conferenceID}/sharing-session-detail`;
    this.$httpBackend.expectPOST(url).respond(200, mockData);
    this.CustomerSearchService.getSharingSessionDetail(this.conferenceID, this.nodeId)
      .then(res => expect(res.items.length).toBe(1))
      .catch(fail);

    this.$httpBackend.flush();
  });

  it('should get correct request url of meetings api in customer view', function (this: Test) {
    spyOn(this.Authinfo, 'isLaunchedFromPartner').and.returnValue(true);
    const mockData = 'bc65f19d-0a70-4b46-b712-2a2c6ebda53f';
    spyOn(this.Authinfo, 'getOrgId').and.returnValue(mockData);
    const requestUrl = this.CustomerSearchService.getRequestUrl('v3/meetings');
    expect(requestUrl).toBe(`${this.UrlConfig.getDiagnosticUrl()}v3/meetings?customer_orgid=${mockData}`);
  });

  it('should get correct request url of meetings api in partner view', function (this: Test) {
    spyOn(this.Authinfo, 'isLaunchedFromPartner').and.returnValue(false);
    const mockData = 'bc65f19d-0a70-4b46-b712-2a2c6ebda53f';
    spyOn(this.Authinfo, 'getOrgId').and.returnValue(mockData);
    const requestUrl = this.CustomerSearchService.getRequestUrl('v3/meetings');
    expect(requestUrl).toBe(`${this.UrlConfig.getDiagnosticUrl()}v3/meetings`);
  });

  it('should get correct request url of UniqueParticipants api in customer view', function (this: Test) {
    spyOn(this.Authinfo, 'isLaunchedFromPartner').and.returnValue(true);
    const mockData = 'bc65f19d-0a70-4b46-b712-2a2c6ebda53f';
    spyOn(this.Authinfo, 'getOrgId').and.returnValue(mockData);
    const requestUrl = this.CustomerSearchService.getRequestUrl(`v3/meetings/${this.conferenceID}/unique-participants`);
    expect(requestUrl).toBe(`${this.UrlConfig.getDiagnosticUrl()}v3/meetings/${this.conferenceID}/unique-participants?customer_orgid=${mockData}`);
  });

  it('should get correct request url of UniqueParticipants api in partner view', function (this: Test) {
    spyOn(this.Authinfo, 'isLaunchedFromPartner').and.returnValue(false);
    const mockData = 'bc65f19d-0a70-4b46-b712-2a2c6ebda53f';
    spyOn(this.Authinfo, 'getOrgId').and.returnValue(mockData);
    const requestUrl = this.CustomerSearchService.getRequestUrl(`v3/meetings/${this.conferenceID}/unique-participants`);
    expect(requestUrl).toBe(`${this.UrlConfig.getDiagnosticUrl()}v3/meetings/${this.conferenceID}/unique-participants`);
  });

  it('should get correct request url of VoipSessionDetail api in customer view', function (this: Test) {
    spyOn(this.Authinfo, 'isLaunchedFromPartner').and.returnValue(true);
    const mockData = 'bc65f19d-0a70-4b46-b712-2a2c6ebda53f';
    spyOn(this.Authinfo, 'getOrgId').and.returnValue(mockData);
    const requestUrl = this.CustomerSearchService.getRequestUrl(`v2/meetings/${this.conferenceID}/voip-session-detail`);
    expect(requestUrl).toBe(`${this.UrlConfig.getDiagnosticUrl()}v2/meetings/${this.conferenceID}/voip-session-detail?customer_orgid=${mockData}`);
  });

  it('should get correct request url of VoipSessionDetail api in partner view', function (this: Test) {
    spyOn(this.Authinfo, 'isLaunchedFromPartner').and.returnValue(false);
    const mockData = 'bc65f19d-0a70-4b46-b712-2a2c6ebda53f';
    spyOn(this.Authinfo, 'getOrgId').and.returnValue(mockData);
    const requestUrl = this.CustomerSearchService.getRequestUrl(`v2/meetings/${this.conferenceID}/voip-session-detail`);
    expect(requestUrl).toBe(`${this.UrlConfig.getDiagnosticUrl()}v2/meetings/${this.conferenceID}/voip-session-detail`);
  });

  it('should get correct request url of RoleChange api in customer view', function (this: Test) {
    spyOn(this.Authinfo, 'isLaunchedFromPartner').and.returnValue(true);
    const mockData = 'bc65f19d-0a70-4b46-b712-2a2c6ebda53f';
    spyOn(this.Authinfo, 'getOrgId').and.returnValue(mockData);
    const requestUrl = this.CustomerSearchService.getRequestUrl(`v3/meetings/${this.conferenceID}/rolechange`);
    expect(requestUrl).toBe(`${this.UrlConfig.getDiagnosticUrl()}v3/meetings/${this.conferenceID}/rolechange?customer_orgid=${mockData}`);
  });

  it('should get correct request url of RoleChange api in partner view', function (this: Test) {
    spyOn(this.Authinfo, 'isLaunchedFromPartner').and.returnValue(false);
    const mockData = 'bc65f19d-0a70-4b46-b712-2a2c6ebda53f';
    spyOn(this.Authinfo, 'getOrgId').and.returnValue(mockData);
    const requestUrl = this.CustomerSearchService.getRequestUrl(`v3/meetings/${this.conferenceID}/rolechange`);
    expect(requestUrl).toBe(`${this.UrlConfig.getDiagnosticUrl()}v3/meetings/${this.conferenceID}/rolechange`);
  });

  it('should get correct request url of SharingSessionDetail api in customer view', function (this: Test) {
    spyOn(this.Authinfo, 'isLaunchedFromPartner').and.returnValue(true);
    const mockData = 'bc65f19d-0a70-4b46-b712-2a2c6ebda53f';
    spyOn(this.Authinfo, 'getOrgId').and.returnValue(mockData);
    const requestUrl = this.CustomerSearchService.getRequestUrl(`v2/meetings/${this.conferenceID}/sharing-session-detail`);
    expect(requestUrl).toBe(`${this.UrlConfig.getDiagnosticUrl()}v2/meetings/${this.conferenceID}/sharing-session-detail?customer_orgid=${mockData}`);
  });

  it('should get correct request url of SharingSessionDetail api in partner view', function (this: Test) {
    spyOn(this.Authinfo, 'isLaunchedFromPartner').and.returnValue(false);
    const mockData = 'bc65f19d-0a70-4b46-b712-2a2c6ebda53f';
    spyOn(this.Authinfo, 'getOrgId').and.returnValue(mockData);
    const requestUrl = this.CustomerSearchService.getRequestUrl(`v2/meetings/${this.conferenceID}/sharing-session-detail`);
    expect(requestUrl).toBe(`${this.UrlConfig.getDiagnosticUrl()}v2/meetings/${this.conferenceID}/sharing-session-detail`);
  });
});
