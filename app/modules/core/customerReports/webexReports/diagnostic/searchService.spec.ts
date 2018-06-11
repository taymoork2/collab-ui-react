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
    const url = `${this.UrlConfig.getDiagnosticUrl()}v3/meetings`;
    this.$httpBackend.expectPOST(url).respond(200, mockData);

    this.SearchService.getMeetings().then( res => expect(res.length).toBe(1) );
    this.$httpBackend.flush();
  });

  it('should get correct data when call getMeetingDetail', function () {
    const mockData = { meetingBasicInfo: {}, features: {}, connection: {}, sessions: {} };
    const url = `${this.UrlConfig.getDiagnosticUrl()}v3/meetings/${this.conferenceID}/meeting-detail`;
    this.$httpBackend.expectGET(url).respond(200, mockData);
    this.SearchService.getMeetingDetail(this.conferenceID)
      .then( res => expect(res.features).toBeDefined() );

    this.$httpBackend.flush();
  });

  it('should get correct data when call getUniqueParticipants', function () {
    const mockData = [{ userName: 'Felix Cao1', participants: [] }, { userName: 'Felix Cao2', participants: [] }];
    const url = `${this.UrlConfig.getDiagnosticUrl()}v3/meetings/${this.conferenceID}/unique-participants`;
    this.$httpBackend.expectGET(url).respond(200, mockData);

    this.SearchService.getUniqueParticipants(this.conferenceID)
      .then( res => expect(_.size(res)).toBe(2) );

    this.$httpBackend.flush();
  });

  it('should get correct data when call getParticipants', function () {
    const mockData = [{ joinTime: 1499389211000, leaveTime: 1499399838000, conferenceID: '66735067305608980' }];
    const url = `${this.UrlConfig.getDiagnosticUrl()}v3/meetings/${this.conferenceID}/participants`;
    this.$httpBackend.expectGET(url).respond(200, mockData);
    this.SearchService.getParticipants(this.conferenceID)
      .then( res => expect(res[0].joinTime).toBeDefined());

    this.$httpBackend.flush();
  });

  it('should get correct data when call getPSTNCallInType', function () {
    const mockData = { completed: true, description: 'Return results.', items: [{ pstnCallInType: 'TollFree' }] };
    const url = `${this.UrlConfig.getDiagnosticUrl()}v2/meetings/${this.conferenceID}/participants/${this.nodeId}/pstncallintype`;
    this.$httpBackend.expectGET(url).respond(200, mockData);
    this.SearchService.getPSTNCallInType(this.conferenceID, this.nodeId)
      .then( res => expect(res.items[0].pstnCallInType).toBeDefined()).catch(fail);
    this.$httpBackend.flush();
  });

  it('should get correct data when call getQOS', function () {
    const qosName = 'pstn';
    const mockData = { 2454212: { completed: true, items: [] } };
    const url = `${this.UrlConfig.getDiagnosticUrl()}v2/meetings/${this.conferenceID}/${qosName}?nodeIds=${this.nodeId}`;
    this.$httpBackend.expectGET(url).respond(200, mockData);
    this.SearchService.getQOS(this.conferenceID, this.nodeId, qosName)
      .then( res => expect(res[this.nodeId]).toBeDefined());

    this.$httpBackend.flush();
  });

  it('should get correct data when call getCallLegs', function () {
    const mockData = { tahoeInfo: [], videoInfo: [], voIPInfo: [] };
    const url = `${this.UrlConfig.getDiagnosticUrl()}v2/meetings/${this.conferenceID}/call-legs`;
    this.$httpBackend.expectGET(url).respond(200, mockData);
    this.SearchService.getCallLegs(this.conferenceID)
      .then( res => expect(res['tahoeInfo']).toBeDefined()).catch(fail);

    this.$httpBackend.flush();
  });

  it('Should get correct voip session detail', function () {
    const mockData = { code: 0, items: [{ code: 200, completed: true }] };
    const url = `${this.UrlConfig.getDiagnosticUrl()}v2/meetings/${this.conferenceID}/voip-session-detail`;
    this.$httpBackend.expectPOST(url).respond(200, mockData);
    this.SearchService.getVoipSessionDetail(this.conferenceID, this.nodeId)
      .then(res => expect(res.items.length).toBe(1)).catch(fail);

    this.$httpBackend.flush();
  });

  it('Should get correct video session detail', function () {
    const mockData = { code: 0, items: [{ code: 200, completed: true }] };
    const url = `${this.UrlConfig.getDiagnosticUrl()}v2/meetings/${this.conferenceID}/video-session-detail`;
    this.$httpBackend.expectPOST(url).respond(200, mockData);
    this.SearchService.getVideoSessionDetail(this.conferenceID, this.nodeId)
      .then(res => expect(res.items.length).toBe(1)).catch(fail);

    this.$httpBackend.flush();
  });

  it('Should get correct pstn session detail', function () {
    const mockData = { code: 0, items: [{ code: 200, completed: true }] };
    const url = `${this.UrlConfig.getDiagnosticUrl()}v2/meetings/${this.conferenceID}/pstn-session-detail`;
    this.$httpBackend.expectPOST(url).respond(200, mockData);
    this.SearchService.getPSTNSessionDetail(this.conferenceID, this.nodeId)
      .then(res => expect(res.items.length).toBe(1)).catch(fail);

    this.$httpBackend.flush();
  });

  it('Should get correct cmr session detail', function () {
    const mockData = { code: 0, items: [{ code: 200, completed: true }] };
    const url = `${this.UrlConfig.getDiagnosticUrl()}v2/meetings/${this.conferenceID}/cmr-session-detail`;
    this.$httpBackend.expectPOST(url).respond(200, mockData);
    this.SearchService.getCMRSessionDetail(this.conferenceID, this.nodeId)
      .then(res => expect(res.items.length).toBe(1)).catch(fail);

    this.$httpBackend.flush();
  });

  it('should get correct data when call getJoinMeetingTime', function () {
    const mockData = [{ userId: '52887', userName: 'cisqsite07 admin' }];
    const url = `${this.UrlConfig.getDiagnosticUrl()}v2/meetings/${this.conferenceID}/participants/join-meeting-time`;
    this.$httpBackend.expectGET(url).respond(200, mockData);
    this.SearchService.getJoinMeetingTime(this.conferenceID)
      .then( res => expect(res[0].userId).toBeDefined());

    this.$httpBackend.flush();
  });

  it('should get correct service GMT time when call getServerTime', function () {
    const mockData = { dateLong: '2017-12-12' };
    const url = `${this.UrlConfig.getDiagnosticUrl()}v2/server`;
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
    moment.tz.setDefault('Asia/Shanghai');
    this.SearchService.setStorage('timeZone', 'Asia/Shanghai');
    const data_ = this.SearchService.utcDateByTimezone(data);
    expect(data_).toBe('2017-08-02 03:44:30 PM');
  });

  it('should get correct data when call getOffset', function () {
    moment.tz.setDefault('Asia/Shanghai');
    const data = this.SearchService.getOffset('Asia/Shanghai');
    expect(data).toEqual('+08:00');
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
    moment.tz.setDefault('Asia/Shanghai');
    this.SearchService.setStorage('timeZone', 'Asia/Shanghai');
    const data_ = this.SearchService.timestampToDate(timestamp, 'hh:mm');
    expect(data_).toBe('02:56');
  });

  it('Should get correct data when call getBrowser: Chrome', function () {
    expect(this.SearchService.getBrowser(6)).toBe('Chrome');
  });

  it('Should get correct data when call getBrowser: Other', function () {
    expect(this.SearchService.getBrowser()).toBe('webexReports.other');
  });

  it('Should get correct data when call getPlatform: Mac', function () {
    expect(this.SearchService.getPlatform({ platform: 1, sessionType: 0 })).toBe('Mac');
  });

  it('Should get correct data when call getPlatform: PSTN', function () {
    expect(this.SearchService.getPlatform({ platform: 1, sessionType: 25 })).toBe('PSTN');
  });

  it('Should get correct data when call getPlatform: Other', function () {
    expect(this.SearchService.getPlatform({ platform: 22, sessionType: 0 })).toBe('webexReports.other');
  });

  it('Should get correct data when call getParticipantEndReason: Normal', function () {
    expect(this.SearchService.getParticipantEndReson('a')).toBe('webexReports.normal');
  });

  it('Should get correct data when call getParticipantEndReason: Abnormal', function () {
    expect(this.SearchService.getParticipantEndReson('')).toBe('webexReports.abnormal');
  });

  it('Should get correct data when call getParticipantEndReason: <empty>', function () {
    expect(this.SearchService.getParticipantEndReson(null)).toBe('');
  });

  it('Should get correct device icon when call getDevice: icon-application', function () {
    const obj = { browser: 2, platform: 6 };
    const device = this.SearchService.getDevice(obj);
    expect(device.icon).toBe('icon-application');
  });

  it('Should get correct device icon when call getDevice: icon-devices', function () {
    const obj = { platform: '10' };
    const device = this.SearchService.getDevice(obj);
    expect(device.icon).toBe('icon-devices');
  });

  it('Should get correct device icon when call getDevice: icon-mobile-phone', function () {
    const obj = { platform: '8' };
    const device = this.SearchService.getDevice(obj);
    expect(device.icon).toBe('icon-mobile-phone');
  });

  it('Should get correct device name when call getDevice: Phone', function () {
    const obj = { sessionType: '25', platform: '9' };
    const device = this.SearchService.getDevice(obj);
    expect(device.name).toBe('webexReports.phone');
  });

  it('Should get correct device name when call getDevice: Other', function () {
    const obj = { platform: '6' };
    const device = this.SearchService.getDevice(obj);
    expect(device.name).toBe('Javascript: webexReports.other');
  });

  it('Should get correct device name when call getDevice: Thin Client', function () {
    const obj = { platform: '15' };
    const device = this.SearchService.getDevice(obj);
    expect(device.name).toBe('webexReports.thinClient');
  });

  it('Should get toMinOrSec value: <empty>', function () {
    expect(this.SearchService.toMinOrSec('')).toBe('');
  });

  it('Should get toMinOrSec value: seconds', function () {
    expect(this.SearchService.toMinOrSec(2000)).toBe('time.abbreviatedCap.seconds');
  });

  it('should get correct CMR device name when call getRealDevice', function () {

    const mockData = { completed: true, items: [{ deviceType: 'SIP' }] };
    const url = `${this.UrlConfig.getDiagnosticUrl()}v2/meetings/${this.conferenceID}/participants/${this.nodeId}/device`;
    this.$httpBackend.expectGET(url).respond(200, mockData);
    this.SearchService.getRealDevice(this.conferenceID, this.nodeId)
      .then( res => expect(res.items[0].deviceType).toBe('SIP')).catch(fail);

    this.$httpBackend.flush();
  });

  it('Should get correct phone number', function () {
    expect(this.SearchService.getPhoneNumber('1-1234123')).toBe('+1-1234123');
  });

  it('', function () {
    const hms = this.SearchService.getDuration(8071);
    expect(hms).toBe('2:14:31');
  });
});
