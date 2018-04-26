import moduleName from './index';
import * as moment from 'moment-timezone';

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
      .then( res => expect(res.length).toBe(1) );

    this.$httpBackend.flush();
  });

  it('should get correct data when call getMeetingDetail', function () {
    const mockData = { meetingBasicInfo: {}, features: {}, connection: {}, sessions: {} };
    const url = `${this.UrlConfig.getDiagnosticUrl()}v3/partner/meetings/${this.conferenceID}/meeting-detail`;
    this.$httpBackend.expectGET(url).respond(200, mockData);
    this.PartnerSearchService.getMeetingDetail(this.conferenceID)
      .then( res => expect(res.features).toBeDefined() );

    this.$httpBackend.flush();
  });

  it('should get correct data when call getUniqueParticipants', function () {
    const mockData = [{ userName: 'Felix Cao1', participants: [] }, { userName: 'Felix Cao2', participants: [] }];
    const url = `${this.UrlConfig.getDiagnosticUrl()}v3/partner/meetings/${this.conferenceID}/unique-participants`;
    this.$httpBackend.expectGET(url).respond(200, mockData);
    this.PartnerSearchService.getUniqueParticipants(this.conferenceID)
      .then( res => expect(_.size(res)).toBe(2) );

    this.$httpBackend.flush();
  });

  it('should get correct data when call getParticipants', function () {
    const mockData = [{ joinTime: 1499389211000, leaveTime: 1499399838000, conferenceID: '66735067305608980' }];
    const url = `${this.UrlConfig.getDiagnosticUrl()}v3/partner/meetings/${this.conferenceID}/participants`;
    this.$httpBackend.expectGET(url).respond(200, mockData);
    this.PartnerSearchService.getParticipants(this.conferenceID)
      .then( res => expect(res[0].joinTime).toBeDefined());

    this.$httpBackend.flush();
  });

  it('should get correct data when call getQOS', function () {
    const qosName = 'pstn';
    const mockData = { 2454212: { completed: true, items: [] } };
    const url = `${this.UrlConfig.getDiagnosticUrl()}v3/partner/meetings/${this.conferenceID}/${qosName}?nodeIds=${this.nodeId}`;
    this.$httpBackend.expectGET(url).respond(200, mockData);
    this.PartnerSearchService.getQOS(this.conferenceID, this.nodeId, qosName)
      .then( res => expect(res[this.nodeId]).toBeDefined());

    this.$httpBackend.flush();
  });

  it('should get correct data when call getCallLegs', function () {
    const mockData = { tahoeInfo: [], videoInfo: [], voIPInfo: [] };
    const url = `${this.UrlConfig.getDiagnosticUrl()}v3/partner/meetings/${this.conferenceID}/call-legs`;
    this.$httpBackend.expectGET(url).respond(200, mockData);
    this.PartnerSearchService.getCallLegs(this.conferenceID)
      .then( res => expect(res['tahoeInfo']).toBeDefined())
      .catch(fail);

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
      .then( res => expect(res[0].userId).toBeDefined());

    this.$httpBackend.flush();
  });

  it('should get correct service GMT time when call getServerTime', function () {
    const mockData = { dateLong: '2017-12-12' };
    const url = `${this.UrlConfig.getDiagnosticUrl()}v2/server`;
    this.$httpBackend.expectGET(url).respond(200, mockData);
    this.PartnerSearchService.getServerTime()
      .then( res => expect(res.dateLong).toBe('2017-12-12'));

    this.$httpBackend.flush();
  });

  it('should get correct data when call getStatus to get meeting Status', function () {
    spyOn(this.$translate, 'instant').and.returnValue('Ended');
    const status = this.PartnerSearchService.getStatus(2);
    expect(status).toBe('Ended');
  });

  it('should get correct data when call setStorage', function () {
    const item = { conferenceID: 50190706068695610, meetingNumber: 355602502, status: 'Ended', siteID: 700243772 };
    const conferenceID = this.PartnerSearchService.setStorage('webexMeeting', item).conferenceID;
    expect(conferenceID).toBe(50190706068695610);
    const wm = this.PartnerSearchService.getStorage('webexMeeting', {});
    expect(wm.status).toBe('Ended');
  });

  xit('should get correct data when call utcDateByTimezone', function () {
    const data = '2017-08-02 07:44:30.0';
    moment.tz.setDefault('Asia/Shanghai');
    this.PartnerSearchService.setStorage('timeZone', 'Asia/Shanghai');
    const data_ = this.PartnerSearchService.utcDateByTimezone(data);
    expect(data_).toBe('2017-08-02 03:44:30 PM');
  });

  it('should get correct data when call getOffset', function () {
    moment.tz.setDefault('Asia/Shanghai');
    const data = this.PartnerSearchService.getOffset('Asia/Shanghai');
    expect(data).toBe('+08:00');
  });

  it('should get correct data when call getGuess', function () {
    const data = this.PartnerSearchService.getGuess(12);
    expect(data).toBe('');
  });

  it('should get correct data when call getNames', function () {
    const data = this.PartnerSearchService.getNames(12);
    expect(data).toBe('');
  });

  it('should get correct data when call timestampToDate', function () {
    const timestamp = 1512543365000;
    moment.tz.setDefault('Asia/Shanghai');
    this.PartnerSearchService.setStorage('timeZone', 'Asia/Shanghai');
    const data_ = this.PartnerSearchService.timestampToDate(timestamp, 'hh:mm');
    expect(data_).toBe('02:56');
  });

  describe('getBrowser():', () => {
    it('should get correct data when call getBrowser: Chrome', function () {
      expect(this.PartnerSearchService.getBrowser(6)).toBe('Chrome');
    });

    it('should get correct data when call getBrowser: Other', function () {
      expect(this.PartnerSearchService.getBrowser()).toBe('webexReports.other');
    });
  });

  describe('getPlatform():', () => {
    it('should get correct data when call getPlatform: Mac', function () {
      expect(this.PartnerSearchService.getPlatform({ platform: 1, sessionType: '0' })).toBe('Mac');
    });

    it('should get correct data when call getPlatform: PSTN', function () {
      expect(this.PartnerSearchService.getPlatform({ platform: 1, sessionType: '25' })).toBe('PSTN');
    });

    it('should get correct data when call getPlatform: Other', function () {
      expect(this.PartnerSearchService.getPlatform({ platform: 22, sessionType: '0' })).toBe('webexReports.other');
    });
  });

  describe('getParticipantEndReason():', () => {
    it('should get correct data when call getParticipantEndReason: Normal', function () {
      expect(this.PartnerSearchService.getParticipantEndReason('a')).toBe('webexReports.normal');
    });

    it('should get correct data when call getParticipantEndReason: Abnormal', function () {
      expect(this.PartnerSearchService.getParticipantEndReason('')).toBe('webexReports.abnormal');
    });

    it('should get correct data when call getParticipantEndReason: <empty>', function () {
      expect(this.PartnerSearchService.getParticipantEndReason(null)).toBe('');
    });
  });


  describe('getDevice():', () => {
    it('should get correct device icon when call getDevice: icon-application', function () {
      const obj = { browser: '2', platform: '6' };
      const device = this.PartnerSearchService.getDevice(obj);
      expect(device.icon).toBe('icon-application');
    });

    it('should get correct device icon when call getDevice: icon-devices', function () {
      const obj = { platform: '10' };
      const device = this.PartnerSearchService.getDevice(obj);
      expect(device.icon).toBe('icon-devices');
    });

    it('should get correct device icon when call getDevice: icon-mobile-phone', function () {
      const obj = { platform: '8' };
      const device = this.PartnerSearchService.getDevice(obj);
      expect(device.icon).toBe('icon-mobile-phone');
    });

    it('should get correct device name when call getDevice: Phone', function () {
      const obj = { sessionType: '25', platform: '9' };
      const device = this.PartnerSearchService.getDevice(obj);
      expect(device.name).toBe('webexReports.phone');
    });

    it('should get correct device name when call getDevice: Other', function () {
      const obj = { platform: '6' };
      const device = this.PartnerSearchService.getDevice(obj);
      expect(device.name).toBe('Javascript: webexReports.other');
    });

    it('should get correct device name when call getDevice: Thin Client', function () {
      const obj = { platform: '15' };
      const device = this.PartnerSearchService.getDevice(obj);
      expect(device.name).toBe('webexReports.thinClient');
    });
  });

  describe('toMinOrSec():', () => {
    it('should get toMinOrSec value: <empty>', function () {
      expect(this.PartnerSearchService.toMinOrSec('')).toBe('');
    });

    it('should get toMinOrSec value: seconds', function () {
      expect(this.PartnerSearchService.toMinOrSec(2000)).toBe('time.abbreviatedCap.seconds');
    });
  });

  it('should get correct CMR device name when call getRealDevice', function () {
    const mockData = { completed: true, items: [{ deviceType: 'SIP' }] };
    const url = `${this.UrlConfig.getDiagnosticUrl()}v3/partner/meetings/${this.conferenceID}/participants/${this.nodeId}/device`;
    this.$httpBackend.expectGET(url).respond(200, mockData);
    this.PartnerSearchService.getRealDevice(this.conferenceID, this.nodeId)
      .then( res => expect(res.items[0].deviceType).toBe('SIP'))
      .catch(fail);

    this.$httpBackend.flush();
  });

  it('should get correct phone number', function () {
    expect(this.PartnerSearchService.getPhoneNumber('1-1234123')).toBe('+1-1234123');
  });

  it('should get correct time format', function () {
    const hms = this.PartnerSearchService.getDuration(8071);
    expect(hms).toBe('2:14:31');
  });
});
