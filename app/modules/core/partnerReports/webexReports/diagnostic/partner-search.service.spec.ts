import moduleName from './index';

describe('Service: SearchService', () => {
  beforeAll(function () {
    this.conferenceID = '65241608473282200';
    this.nodeId = '2454212';
  });

  beforeEach(function () {
    this.initModules(moduleName);
    this.injectDependencies('$httpBackend', '$q', '$translate', 'PartnerSearchService', 'UrlConfig' );
  });

  afterEach(function () {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  it('should get correct data when call getMeetings for searching', function () {
    const mockData = [{ conferenceID: '50190706068695610', meetingNumber: '341662314', meetingName: 'Felix Cao' }];
    const url = `${this.UrlConfig.getDiagnosticUrl()}v3/partner/meetings`;
    this.$httpBackend.expectPOST(url).respond(200, mockData);
    this.PartnerSearchService.getMeetings()
      .then(res => expect(res.length).toBe(1));

    this.$httpBackend.flush();
  });

  it('should get correct data when call getMeetingDetail', function () {
    const mockData = { meetingBasicInfo: {}, features: {}, connection: {}, sessions: {} };
    const url = `${this.UrlConfig.getDiagnosticUrl()}v3/partner/meetings/${this.conferenceID}/meeting-detail`;
    this.$httpBackend.expectGET(url).respond(200, mockData);
    this.PartnerSearchService.getMeetingDetail(this.conferenceID)
      .then(res => expect(res.features).toBeDefined());

    this.$httpBackend.flush();
  });

  it('should get correct data when call getUniqueParticipants', function () {
    const mockData = [{ userName: 'Felix Cao1', participants: [] }, { userName: 'Felix Cao2', participants: [] }];
    const url = `${this.UrlConfig.getDiagnosticUrl()}v3/partner/meetings/${this.conferenceID}/unique-participants`;
    this.$httpBackend.expectGET(url).respond(200, mockData);
    this.PartnerSearchService.getUniqueParticipants(this.conferenceID)
      .then(res => expect(_.size(res)).toBe(2));

    this.$httpBackend.flush();
  });

  it('should get correct data when call getParticipants', function () {
    const mockData = [{ joinTime: 1499389211000, leaveTime: 1499399838000, conferenceID: '66735067305608980' }];
    const url = `${this.UrlConfig.getDiagnosticUrl()}v3/partner/meetings/${this.conferenceID}/participants`;
    this.$httpBackend.expectGET(url).respond(200, mockData);
    this.PartnerSearchService.getParticipants(this.conferenceID)
      .then(res => expect(res[0].joinTime).toBeDefined());

    this.$httpBackend.flush();
  });

  it('should get correct voip session detail', function () {
    const mockData = { code: 0, items: [{ code: 200, completed: true }] };
    const url = `${this.UrlConfig.getDiagnosticUrl()}v3/partner/meetings/${this.conferenceID}/voip-session-detail`;
    this.$httpBackend.expectPOST(url).respond(200, mockData);
    this.PartnerSearchService.getVoipSessionDetail(this.conferenceID, this.nodeId)
      .then(res => expect(res.items.length).toBe(1))
      .catch(fail);

    this.$httpBackend.flush();
  });

  it('should get correct video session detail', function () {
    const mockData = { code: 0, items: [{ code: 200, completed: true }] };
    const url = `${this.UrlConfig.getDiagnosticUrl()}v3/partner/meetings/${this.conferenceID}/video-session-detail`;
    this.$httpBackend.expectPOST(url).respond(200, mockData);
    this.PartnerSearchService.getVideoSessionDetail(this.conferenceID, this.nodeId)
      .then(res => expect(res.items.length).toBe(1))
      .catch(fail);

    this.$httpBackend.flush();
  });

  it('should get correct pstn session detail', function () {
    const mockData = { code: 0, items: [{ code: 200, completed: true }] };
    const url = `${this.UrlConfig.getDiagnosticUrl()}v3/partner/meetings/${this.conferenceID}/pstn-session-detail`;
    this.$httpBackend.expectPOST(url).respond(200, mockData);
    this.PartnerSearchService.getPSTNSessionDetail(this.conferenceID, this.nodeId)
      .then(res => expect(res.items.length).toBe(1))
      .catch(fail);

    this.$httpBackend.flush();
  });

  it('should get correct cmr session detail', function () {
    const mockData = { code: 0, items: [{ code: 200, completed: true }] };
    const url = `${this.UrlConfig.getDiagnosticUrl()}v3/partner/meetings/${this.conferenceID}/cmr-session-detail`;
    this.$httpBackend.expectPOST(url).respond(200, mockData);
    this.PartnerSearchService.getCMRSessionDetail(this.conferenceID, this.nodeId)
      .then(res => expect(res.items.length).toBe(1))
      .catch(fail);

    this.$httpBackend.flush();
  });

  it('should get correct data when call getJoinMeetingTime', function () {
    const mockData = [{ userId: '52887', userName: 'cisqsite07 admin' }];
    const url = `${this.UrlConfig.getDiagnosticUrl()}v3/partner/meetings/${this.conferenceID}/participants/join-meeting-time`;
    this.$httpBackend.expectGET(url).respond(200, mockData);
    this.PartnerSearchService.getJoinMeetingTime(this.conferenceID)
      .then(res => expect(res[0].userId).toBeDefined());

    this.$httpBackend.flush();
  });

  it('should get correct service GMT time when call getServerTime', function () {
    const mockData = { dateLong: '2017-12-12' };
    const url = `${this.UrlConfig.getDiagnosticUrl()}v2/server`;
    this.$httpBackend.expectGET(url).respond(200, mockData);
    this.PartnerSearchService.getServerTime()
      .then(res => expect(res.dateLong).toBe('2017-12-12'));

    this.$httpBackend.flush();
  });

  it('should get correct CMR device name when call getRealDevice', function () {
    const mockData = { completed: true, items: [{ deviceType: 'SIP' }] };
    const url = `${this.UrlConfig.getDiagnosticUrl()}v3/partner/meetings/${this.conferenceID}/participants/${this.nodeId}/device`;
    this.$httpBackend.expectGET(url).respond(200, mockData);
    this.PartnerSearchService.getRealDevice(this.conferenceID, this.nodeId)
      .then(res => expect(res.items[0].deviceType).toBe('SIP'))
      .catch(fail);

    this.$httpBackend.flush();
  });

  it('should get correct data when call getRoleChange', function () {
    const mockData = [{ roleType: 'HOST' }];
    const url = `${this.UrlConfig.getDiagnosticUrl()}v3/partner/meetings/${this.conferenceID}/rolechange`;
    this.$httpBackend.expectGET(url).respond(200, mockData);
    this.PartnerSearchService.getRoleChange(this.conferenceID)
      .then(res => expect(res[0].roleType).toBeDefined())
      .catch(fail);

    this.$httpBackend.flush();
  });

  it('should get correct data when call getSharingSessionDetail', function () {
    const mockData = { code: 0, items: [{ code: 200, completed: true }] };
    const url = `${this.UrlConfig.getDiagnosticUrl()}v3/partner/meetings/${this.conferenceID}/sharing-session-detail`;
    this.$httpBackend.expectPOST(url).respond(200, mockData);
    this.PartnerSearchService.getSharingSessionDetail(this.conferenceID, this.nodeId)
      .then(res => expect(res.items.length).toBe(1))
      .catch(fail);

    this.$httpBackend.flush();
  });
});
