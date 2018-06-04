import moduleName from './index';
import * as moment from 'moment-timezone';

describe('Service: commonService', () => {
  beforeAll(function () {
    this.conferenceID = '65241608473282200';
    this.nodeId = '2454212';
  });

  beforeEach(function () {
    this.initModules(moduleName);
    this.injectDependencies('$httpBackend', '$q', '$translate', 'CommonService', 'UrlConfig');
  });

  afterEach(function () {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  it('should get correct data when call getStatus to get meeting Status', function () {
    spyOn(this.$translate, 'instant').and.returnValue('Ended');
    const status = this.CommonService.getStatus(2);
    expect(status).toBe('Ended');
  });

  it('should get correct data when call setStorage', function () {
    const item = { conferenceID: 50190706068695610, meetingNumber: 355602502, status: 'Ended', siteID: 700243772 };
    const conferenceID = this.CommonService.setStorage('webexMeeting', item).conferenceID;
    expect(conferenceID).toBe(50190706068695610);
    const wm = this.CommonService.getStorage('webexMeeting', {});
    expect(wm.status).toBe('Ended');
  });

  it('should get correct data when call utcDateByTimezone', function () {
    const data = '2017-08-02 07:44:30.0';
    moment.tz.setDefault('Asia/Shanghai');
    this.CommonService.setStorage('timeZone', 'Asia/Shanghai');
    const data_ = this.CommonService.utcDateByTimezone(data);
    expect(data_).toBe('2017-08-02 03:44:30 PM');
  });

  it('should get correct data when call getOffset', function () {
    moment.tz.setDefault('Asia/Shanghai');
    const data = this.CommonService.getOffset('Asia/Shanghai');
    expect(data).toBe('+08:00');
  });

  it('should get correct data when call getGuess', function () {
    const data = this.CommonService.getGuess(12);
    expect(data).toBe('');
  });

  it('should get correct data when call getNames', function () {
    const data = this.CommonService.getNames(12);
    expect(data).toBe('');
  });

  it('should get correct data when call timestampToDate', function () {
    const timestamp = 1512543365000;
    moment.tz.setDefault('Asia/Shanghai');
    this.CommonService.setStorage('timeZone', 'Asia/Shanghai');
    const data_ = this.CommonService.timestampToDate(timestamp, 'hh:mm');
    expect(data_).toBe('02:56');
  });

  describe('getBrowser():', () => {
    it('should get correct data when call getBrowser: Chrome', function () {
      expect(this.CommonService.getBrowser(6)).toBe('Chrome');
    });

    it('should get correct data when call getBrowser: Other', function () {
      expect(this.CommonService.getBrowser()).toBe('webexReports.other');
    });
  });

  describe('getPlatform():', () => {
    it('should get correct data when call getPlatform: Mac', function () {
      expect(this.CommonService.getPlatform({ platform: '1', sessionType: '0' })).toBe('Mac');
    });

    it('should get correct data when call getPlatform: PSTN', function () {
      expect(this.CommonService.getPlatform({ platform: '1', sessionType: '25' })).toBe('PSTN');
    });

    it('should get correct data when call getPlatform: Other', function () {
      expect(this.CommonService.getPlatform({ platform: '22', sessionType: '0' })).toBe('webexReports.other');
    });
  });

  describe('getParticipantEndReason():', () => {
    it('should get correct data when call getParticipantEndReason: Normal', function () {
      expect(this.CommonService.getParticipantEndReason('a')).toBe('webexReports.normal');
    });

    it('should get correct data when call getParticipantEndReason: Abnormal', function () {
      expect(this.CommonService.getParticipantEndReason('')).toBe('webexReports.abnormal');
    });

    it('should get correct data when call getParticipantEndReason: <empty>', function () {
      expect(this.CommonService.getParticipantEndReason(null)).toBe('');
    });
  });


  describe('getDevice():', () => {
    it('should get correct device icon when call getDevice: icon-application', function () {
      const obj = { browser: '2', platform: '6' };
      const device = this.CommonService.getDevice(obj);
      expect(device.icon).toBe('icon-application');
    });

    it('should get correct device icon when call getDevice: icon-devices', function () {
      const obj = { platform: '10' };
      const device = this.CommonService.getDevice(obj);
      expect(device.icon).toBe('icon-devices');
    });

    it('should get correct device icon when call getDevice: icon-mobile-phone', function () {
      const obj = { platform: '8' };
      const device = this.CommonService.getDevice(obj);
      expect(device.icon).toBe('icon-mobile-phone');
    });

    it('should get correct device name when call getDevice: Phone', function () {
      const obj = { sessionType: '25', platform: '9' };
      const device = this.CommonService.getDevice(obj);
      expect(device.name).toBe('webexReports.phone');
    });

    it('should get correct device name when call getDevice: Other', function () {
      const obj = { platform: '6' };
      const device = this.CommonService.getDevice(obj);
      expect(device.name).toBe('Javascript: webexReports.other');
    });

    it('should get correct device name when call getDevice: Thin Client', function () {
      const obj = { platform: '15' };
      const device = this.CommonService.getDevice(obj);
      expect(device.name).toBe('webexReports.thinClient');
    });
  });

  describe('toMinOrSec():', () => {
    it('should get toMinOrSec value: <empty>', function () {
      expect(this.CommonService.toMinOrSec('')).toBe('');
    });

    it('should get toMinOrSec value: seconds', function () {
      expect(this.CommonService.toMinOrSec(2000)).toBe('time.abbreviatedCap.seconds');
    });
  });

  it('should get correct phone number', function () {
    expect(this.CommonService.getPhoneNumber('1-1234123')).toBe('+1-1234123');
  });

  it('should get correct time format', function () {
    const hms = this.CommonService.getDuration(8071);
    expect(hms).toBe('2:14:31');
  });

  it('should get correct data when call getClientVersion', function () {
    const item = { test_key: { osVersion: '11.0', browserVersion: '54.1' } };
    this.CommonService.setStorage('ClientVersion', item);
    const version = this.CommonService.getClientVersion('test_key');
    expect(version['osVersion']).toBe('11.0');
  });
});
