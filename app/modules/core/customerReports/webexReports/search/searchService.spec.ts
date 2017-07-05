import testModule from './index';

describe('Service: searchService', () => {
  beforeAll(function () {
    this.conferenceID = '65241608473282200';

  });

  beforeEach(function () {
    this.initModules(testModule);
    this.injectDependencies('$q', 'SearchService', 'UrlConfig', '$httpBackend');

    spyOn(this.SearchService, 'getStatus').and.returnValue('Ended');
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
      overview: {
        conferenceID: '65168195997140080',
        status: 1,
        participantsSize: 1,
      },
    };
    const url = `${this.UrlConfig.getGeminiUrl()}meetings/${this.conferenceID}/session`;
    this.$httpBackend.expectGET(url).respond(200, mockData);
    this.SearchService.getMeetingDetail(this.conferenceID).then((res) => {
      expect(res.overview).toBeDefined();
    });
    this.$httpBackend.flush();
  });

  it('should get correct data when call meeting status', function () {
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
});
