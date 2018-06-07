import moduleName from './index';
import * as moment from 'moment-timezone';
import { WebexReportsUtilService } from './webex-reports-util.service';

type Test = atlas.test.IServiceTest<{
  $httpBackend;
  $q;
  $translate;
  UrlConfig;
  WebexReportsUtilService: WebexReportsUtilService;
}>;

describe('Service: WebexReportsUtilService', () => {
  beforeAll(function (this: Test) {
    this.conferenceID = '65241608473282200';
    this.nodeId = '2454212';
  });

  beforeEach(function (this: Test) {
    this.initModules(moduleName);
    this.injectDependencies('$httpBackend', '$q', '$translate', 'UrlConfig', 'WebexReportsUtilService');
  });

  afterEach(function (this: Test) {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  it('should get correct data when call getStatus to get meeting Status', function (this: Test) {
    spyOn(this.$translate, 'instant').and.returnValue('Ended');
    const status = this.WebexReportsUtilService.getMeetingStatus(2);
    expect(status).toBe('Ended');
  });

  it('should get correct data when call setStorage', function (this: Test) {
    const item = { conferenceID: 50190706068695610, meetingNumber: 355602502, status: 'Ended', siteID: 700243772 };
    const conferenceID = this.WebexReportsUtilService.setStorage('webexMeeting', item).conferenceID;
    expect(conferenceID).toBe(50190706068695610);
    const wm = this.WebexReportsUtilService.getStorage('webexMeeting');
    expect(wm.status).toBe('Ended');
  });

  it('should get correct data when call dateToTimezoneAdjustedUtc', function (this: Test) {
    const data = 1501659870000;
    moment.tz.setDefault('Asia/Shanghai');
    this.WebexReportsUtilService.setStorage('timeZone', 'Asia/Shanghai');
    const data_ = this.WebexReportsUtilService.dateToTimezoneAdjustedUtc(data);
    expect(data_).toBe('2017-08-02 03:44:30 PM');
  });

  it('should get correct data when call getTzOffset', function (this: Test) {
    moment.tz.setDefault('Asia/Shanghai');
    const data = this.WebexReportsUtilService.getTzOffset('Asia/Shanghai');
    expect(data).toBe('+08:00');
  });

  it('should get correct data when call getTzGuess', function (this: Test) {
    const data = this.WebexReportsUtilService.getTzGuess('12');
    expect(data).toBe('');
  });

  it('should get correct data when call getTzNames', function (this: Test) {
    const data = this.WebexReportsUtilService.getTzNames('12');
    expect(data).toBe('');
  });

  it('should get correct data when call timestampToDate', function (this: Test) {
    const timestamp = 1512543365000;
    moment.tz.setDefault('Asia/Shanghai');
    this.WebexReportsUtilService.setStorage('timeZone', 'Asia/Shanghai');
    const data_ = this.WebexReportsUtilService.timestampToDate(timestamp, 'hh:mm');
    expect(data_).toBe('02:56');
  });

  describe('getBrowser():', () => {
    it('should get correct data when call getBrowser: Chrome', function (this: Test) {
      expect(this.WebexReportsUtilService.getBrowser(6)).toBe('Chrome');
    });

    it('should get correct data when call getBrowser: Other', function (this: Test) {
      expect(this.WebexReportsUtilService.getBrowser(100)).toBe('webexReports.other');
    });
  });

  describe('getPlatform():', () => {
    it('should get correct data when call getPlatform: Mac', function (this: Test) {
      expect(this.WebexReportsUtilService.getPlatform({ platform: '1', sessionType: '0' })).toBe('Mac');
    });

    it('should get correct data when call getPlatform: PSTN', function (this: Test) {
      expect(this.WebexReportsUtilService.getPlatform({ platform: '1', sessionType: '25' })).toBe('PSTN');
    });

    it('should get correct data when call getPlatform: Other', function (this: Test) {
      expect(this.WebexReportsUtilService.getPlatform({ platform: '22', sessionType: '0' })).toBe('webexReports.other');
    });
  });

  describe('getParticipantEndReason():', () => {
    it('should get correct data when call getParticipantEndReason: Normal', function (this: Test) {
      expect(this.WebexReportsUtilService.getParticipantEndReason('a')).toBe('webexReports.normal');
    });

    it('should get correct data when call getParticipantEndReason: Abnormal', function (this: Test) {
      expect(this.WebexReportsUtilService.getParticipantEndReason('')).toBe('webexReports.abnormal');
    });

    it('should get correct data when call getParticipantEndReason: <empty>', function (this: Test) {
      expect(this.WebexReportsUtilService.getParticipantEndReason(null)).toBe('');
    });
  });

  describe('getDevice():', () => {
    it('should get correct device icon when call getDevice: icon-application', function () {
      const obj = { browser: '2', platform: '6' };
      const device = this.WebexReportsUtilService.getDevice(obj);
      expect(device.icon).toBe('icon-application');
    });

    it('should get correct device icon when call getDevice: icon-devices', function () {
      const obj = { platform: '10' };
      const device = this.WebexReportsUtilService.getDevice(obj);
      expect(device.icon).toBe('icon-devices');
    });

    it('should get correct device icon when call getDevice: icon-mobile-phone', function () {
      const obj = { platform: '8' };
      const device = this.WebexReportsUtilService.getDevice(obj);
      expect(device.icon).toBe('icon-mobile-phone');
    });

    it('should get correct device name when call getDevice: Phone', function () {
      const obj = { sessionType: '25', platform: '9' };
      const device = this.WebexReportsUtilService.getDevice(obj);
      expect(device.name).toBe('webexReports.phone');
    });

    it('should get correct device name when call getDevice: Other', function () {
      const obj = { platform: '6' };
      const device = this.WebexReportsUtilService.getDevice(obj);
      expect(device.name).toBe('Javascript: webexReports.other');
    });

    it('should get correct device name when call getDevice: Thin Client', function () {
      const obj = { platform: '15' };
      const device = this.WebexReportsUtilService.getDevice(obj);
      expect(device.name).toBe('webexReports.thinClient');
    });
  });

  describe('toMinOrSec():', () => {
    it('should get toMinOrSec value: <empty>', function () {
      expect(this.WebexReportsUtilService.toMinOrSec('')).toBe('');
    });

    it('should get toMinOrSec value: seconds', function () {
      spyOn(this.$translate, 'instant');
      this.WebexReportsUtilService.toMinOrSec(2000);
      expect(this.$translate.instant).toHaveBeenCalledWith('time.abbreviatedCap.seconds', { time: 2 }, 'messageformat');
    });
  });

  it('should get correct phone number', function () {
    expect(this.WebexReportsUtilService.getPhoneNumber('1-1234123')).toBe('+1-1234123');
  });

  it('should get correct time format', function () {
    const duration = this.WebexReportsUtilService.getDuration(8071);
    expect(duration).toBe('2:14:31');
  });

  it('should get correct data when call getClientVersion', function () {
    const item = { test_key: { osVersion: '11.0', browserVersion: '54.1' } };
    this.WebexReportsUtilService.setStorage('ClientVersion', item);
    const version = this.WebexReportsUtilService.getClientVersion('test_key');
    expect(version['osVersion']).toBe('11.0');
  });
});
