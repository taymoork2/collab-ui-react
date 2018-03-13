import testModule from './index';
import * as moment from 'moment-timezone';

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

  it('should get correct data when call getMeetings for searching', function () {
    const mockData = [{ conferenceID: '50190706068695610', meetingNumber: '341662314', meetingName: 'Felix Cao' }];
    const url = `${this.UrlConfig.getGeminiUrl()}meetings`;
    this.$httpBackend.expectPOST(url).respond(200, mockData);

    this.SearchService.getMeetings().then( res => expect(res.length).toBe(1) );
    this.$httpBackend.flush();
  });

  it('should get correct data when call getMeetingDetail', function () {
    const mockData = { meetingBasicInfo: {}, features: {}, connection: {}, sessions: {} };
    const url = `${this.UrlConfig.getGeminiUrl()}meetings/${this.conferenceID}/meeting-detail`;
    this.$httpBackend.expectGET(url).respond(200, mockData);
    this.SearchService.getMeetingDetail(this.conferenceID)
      .then( res => expect(res.features).toBeDefined() );

    this.$httpBackend.flush();
  });

  it('should get correct data when call getUniqueParticipants', function () {
    const mockData = [{ userName: 'Felix Cao1', participants: [] }, { userName: 'Felix Cao2', participants: [] }];
    const url = `${this.UrlConfig.getGeminiUrl()}meetings/${this.conferenceID}/unique-participants`;
    this.$httpBackend.expectGET(url).respond(200, mockData);

    this.SearchService.getUniqueParticipants(this.conferenceID)
    .then( res => expect(_.size(res)).toBe(2) );

    this.$httpBackend.flush();
  });

  it('should get correct data when call getParticipants', function () {
    const mockData = [{ joinTime: 1499389211000, leaveTime: 1499399838000, conferenceID: '66735067305608980' }];
    const url = `${this.UrlConfig.getGeminiUrl()}meetings/${this.conferenceID}/participants`;
    this.$httpBackend.expectGET(url).respond(200, mockData);
    this.SearchService.getParticipants(this.conferenceID)
      .then( res => expect(res[0].joinTime).toBeDefined());

    this.$httpBackend.flush();
  });

  it('should get correct data when call getQOS', function () {
    const qosName = 'pstn';
    const mockData = { 2454212: { completed: true, items: [] } };
    const url = `${this.UrlConfig.getGeminiUrl()}meetings/${this.conferenceID}/${qosName}?nodeIds=${this.nodeId}`;
    this.$httpBackend.expectGET(url).respond(200, mockData);
    this.SearchService.getQOS(this.conferenceID, this.nodeId, qosName)
      .then( res => expect(res[this.nodeId]).toBeDefined());

    this.$httpBackend.flush();
  });

  it('should get correct data when call getJoinMeetingTime', function () {
    const mockData = [{ userId: '52887', userName: 'cisqsite07 admin' }];
    const url = `${this.UrlConfig.getGeminiUrl()}meetings/${this.conferenceID}/participants/join-meeting-time`;
    this.$httpBackend.expectGET(url).respond(200, mockData);
    this.SearchService.getJoinMeetingTime(this.conferenceID)
      .then( res => expect(res[0].userId).toBeDefined());

    this.$httpBackend.flush();
  });

  it('should get correct service GMT time when call getServerTime', function () {
    const mockData = { dateLong: '2017-12-12' };
    const url = `${this.UrlConfig.getGeminiUrl()}server`;
    this.$httpBackend.expectGET(url).respond(200, mockData);
    this.SearchService.getServerTime()
      .then( res => expect(res.dateLong).toBe('2017-12-12'));

    this.$httpBackend.flush();
  });

  it('should get correct data when call getStatus to get meeting Status', function () {
    spyOn(this.$translate, 'instant').and.returnValue('Ended');
    const status = this.SearchService.getStatus(2);
    expect(status).toEqual('Ended');
  });

  it('should get correct data when call setStorage', function () {
    const item = { conferenceID: 50190706068695610, meetingNumber: 355602502, status: 'Ended', siteID: 700243772 };
    const conferenceID = this.SearchService.setStorage('webexMeeting', item).conferenceID;
    expect(conferenceID).toEqual(50190706068695610);

    const wm = this.SearchService.getStorage('webexMeeting', {});
    expect(wm.status).toEqual('Ended');
  });

  xit('should get correct data when call utcDateByTimezone', function () {
    const data = '2017-08-02 07:44:30.0';
    moment.tz.setDefault('America/Chicago');
    this.SearchService.setStorage('timeZone', 'America/Chicago');
    const data_ = this.SearchService.utcDateByTimezone(data);
    expect(data_).toBe('2017-08-02 01:44:30 AM');
  });

  it('should get correct data when call getOffset', function () {
    moment.tz.setDefault('America/Chicago');
    const data = this.SearchService.getOffset('America/Chicago');
    expect(data).toEqual(moment().format('Z'));
  });

  it('should get correct data when call getGuess', function () {
    const data = this.SearchService.getGuess(12);
    expect(data).toEqual('');
  });

  it('should get correct data when call getNames', function () {
    const data = this.SearchService.getNames(12);
    expect(data).toEqual('');
  });

  it('should get correct data when call timestampToDate', function () {
    const timestamp = 1512543365000;
    moment.tz.setDefault('America/Chicago');
    this.SearchService.setStorage('timeZone', 'America/Chicago');
    const data_ = this.SearchService.timestampToDate(timestamp, 'hh:mm');
    expect(data_).toBe('01:56');
  });

  it('should get correct data when call getBrowser', function () {
    let brow = this.SearchService.getBrowser(6);
    expect(brow).toBe('Chrome');

    brow = this.SearchService.getBrowser();
    expect(brow).toBe('Other');
  });

  it('should get correct data when call getPlartform', function () {
    let platform = this.SearchService.getPlartform({ platform: 1, sessionType: 0 });
    expect(platform).toBe('Mac');

    platform = this.SearchService.getPlartform({ platform: 1, sessionType: 25 });
    expect(platform).toBe('PSTN');

    platform = this.SearchService.getPlartform({ platform: 22, sessionType: 0 });
    expect(platform).toBe('Other');
  });

  it('should get correct data when call getParticipantEndReson', function () {
    let reson = this.SearchService.getParticipantEndReson('a');
    expect(reson).toBe('Normal');

    reson = this.SearchService.getParticipantEndReson(null);
    expect(reson).toBe('');

    reson = this.SearchService.getParticipantEndReson('');
    expect(reson).toBe('Abnormal');
  });

  it('should get correct device name and the icon when call getDevice', function () {
    let obj: any = { browser: 2, platform: 6 };
    let device = this.SearchService.getDevice(obj);
    expect(device.icon).toBe('icon-application');

    obj = { sessionType: '25', platform: '9' };
    device = this.SearchService.getDevice(obj);
    expect(device.name).toBe('IP Phone');

    obj = { platform: '10' };
    device = this.SearchService.getDevice(obj);
    expect(device.icon).toBe('icon-devices');

    obj = { platform: '8' };
    device = this.SearchService.getDevice(obj);
    expect(device.icon).toBe('icon-mobile-phone');

    obj = { platform: '6' };
    device = this.SearchService.getDevice(obj);
    expect(device.name).toBe('Javascript: Other');
  });

  it('', function () {
    const hms = this.SearchService.getDuration(8071);
    expect(hms).toBe('2:14:31');
  });
});
