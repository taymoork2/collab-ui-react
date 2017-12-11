import testModule from './index';

describe('Service: searchService', () => {
  beforeAll(function () {
    this.conferenceID = '65241608473282200';
    this.nodeId = '2454212';
  });

  beforeEach(function () {
    this.initModules(testModule);
    this.injectDependencies('$q', 'SearchService', 'UrlConfig', '$httpBackend', '$translate');
  });

  afterEach(function () {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  it('should get correct data when call getMeetings', function () {
    const mockData = [{
      conferenceID: 50190706068695610,
      meetingType: 'PRO',
      siteID: 700243772,
    }];
    const url = `${this.UrlConfig.getGeminiUrl()}meetings`;
    this.$httpBackend.expectPOST(url).respond(200, mockData);

    this.SearchService.getMeetings().then((res) => {
      expect(res.length).toBe(1);
    });
    this.$httpBackend.flush();
  });

  it('should get correct data when call getMeeting detail', function () {
    const mockData = {
      overview: {
        meetingName: 'fn lns Personal Room',
        meetingNumber: '213595523',
        meetingType: 'MC',
        status: 0,
      },
      session: {
        createTime: '2067-12-31 09:00:00',
        startTime: '2017-06-20 03:09:06',
        endTime: '2017-06-20 03:10:00',
      },
    };
    const url = `${this.UrlConfig.getGeminiUrl()}meetings/${this.conferenceID}`;

    this.$httpBackend.expectGET(url).respond(200, mockData);
    this.SearchService.getMeeting(this.conferenceID).then((res) => {
      expect(res.overview).toBeDefined();
    });
    this.$httpBackend.flush();
  });

  it('should get correct data when call getMeetingDetail', function () {
    const mockData = {
      overview: { status: 1, participantsSize: 1, conferenceID: '65168195997140080' },
    };
    const url = `${this.UrlConfig.getGeminiUrl()}meetings/${this.conferenceID}/meeting-detail`;
    this.$httpBackend.expectGET(url).respond(200, mockData);
    this.SearchService.getMeetingDetail(this.conferenceID).then((res) => {
      expect(res.overview).toBeDefined();
    });
    this.$httpBackend.flush();
  });

  it('should get correct data when call getParticipants', function () {
    const mockData = [{
      joinTime: 1499389211000,
      leaveTime: 1499399838000,
      conferenceID: '66735067305608980',
    }];
    const url = `${this.UrlConfig.getGeminiUrl()}meetings/${this.conferenceID}/participants`;
    this.$httpBackend.expectGET(url).respond(200, mockData);
    this.SearchService.getParticipants(this.conferenceID).then((res) => {
      expect(res[0].joinTime).toBeDefined();
    });
    this.$httpBackend.flush();
  });


  it('should get correct data when call getJoinMeetingTime', function () {
    const mockData = [{
      userId: '52887',
      userName: '"cisqsite07 admin"',
    }];
    const url = `${this.UrlConfig.getGeminiUrl()}meetings/${this.conferenceID}/participants/join-meeting-time`;
    this.$httpBackend.expectGET(url).respond(200, mockData);
    this.SearchService.getJoinMeetingTime(this.conferenceID).then((res) => {
      expect(res[0].userId).toBeDefined();
    });
    this.$httpBackend.flush();
  });

  it('should get correct data when call getJoinMeetingQuality', function () {
    const mockData = [{
      userId: '52887',
      userName: '"cisqsite07 admin"',
    }];
    const url = `${this.UrlConfig.getGeminiUrl()}meetings/${this.conferenceID}/participants/join-meeting-quality`;
    this.$httpBackend.expectGET(url).respond(200, mockData);
    this.SearchService.getJoinMeetingQuality(this.conferenceID).then((res) => {
      expect(res[0].userId).toBeDefined();
    });
    this.$httpBackend.flush();
  });

  it('should get correct data when call getParticipantDetailInfo', function () {
    const mockData = {
      videoInfo: [],
      voIPInfo: [],
      pstnInfo: [],
      cmrInfo: [],
    };
    const url = `${this.UrlConfig.getGeminiUrl()}meetings/${this.conferenceID}/node-ids/${this.nodeId}/call-legs`;
    this.$httpBackend.expectGET(url).respond(200, mockData);
    this.SearchService.getParticipantDetailInfo(this.conferenceID, this.nodeId).then((res) => {
      expect(res.videoInfo).toBeDefined();
    });
    this.$httpBackend.flush();
  });

  it('should get correct data when call meeting status', function () {
    spyOn(this.$translate, 'instant').and.returnValue('Ended');
    const status = this.SearchService.getStatus(2);
    expect(status).toEqual('Ended');
  });

  it('should get correct data when call meeting setStorage', function () {
    const item = {
      conferenceID: 50190706068695610,
      meetingNumber: 355602502,
      status: 'Ended',
      siteID: 700243772,
    };
    const status = this.SearchService.setStorage('webexMeeting', item).conferenceID;
    expect(status).toEqual(50190706068695610);
    const wm: any = this.SearchService.getStorage('webexMeeting');
    expect(wm.status).toEqual('Ended');
  });

  it('should get correct data when call meeting utcDateByTimezone', function () {
    let data = '2017-08-02 07:44:30.0';
    const timeZone = 'Asia/Shanghai';
    spyOn(this.SearchService, 'getOffset').and.returnValue('+08:00');
    this.SearchService.setStorage('timeZone', timeZone);
    let _data = this.SearchService.utcDateByTimezone(data);
    expect(_data).toBeDefined();
    data = '';
    _data = this.SearchService.utcDateByTimezone(data);
    expect(_data).toBeDefined();
  });

  it('should get correct data when call meeting getOffset', function () {
    const data = this.SearchService.getOffset('ut18');
    expect(data).toEqual('');
  });

  it('should get correct data when call meeting getGuess', function () {
    const data = this.SearchService.getGuess(12);
    expect(data).toEqual('');
  });

  it('should get correct data when call meeting getNames', function () {
    const data = this.SearchService.getNames(12);
    expect(data).toEqual('');
  });
});
