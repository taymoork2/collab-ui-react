'use strict';

describe('Service: OtpService', function () {
  var $httpBackend, $rootScope, OtpService, HuronConfig;

  beforeEach(angular.mock.module('uc.device'));
  beforeEach(angular.mock.module('ui.router'));
  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('ngResource'));

  var authInfo = {
    getOrgId: sinon.stub().returns('1')
  };

  beforeEach(angular.mock.module(function ($provide) {
    $provide.value("Authinfo", authInfo);
  }));

  beforeEach(
    inject(
      function (_$httpBackend_, _$rootScope_, _OtpService_, _HuronConfig_) {
        $httpBackend = _$httpBackend_;
        $rootScope = _$rootScope_;
        OtpService = _OtpService_;
        HuronConfig = _HuronConfig_;
      }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should be registered', function () {
    expect(OtpService).toBeDefined();
  });

  describe('loadOtps function', function () {
    it('should exist', function () {
      expect(OtpService.loadOtps).toBeDefined();
    });

    it('should return 1 OTP', function () {
      $httpBackend.whenGET(HuronConfig.getCmiUrl() + '/common/customers/1/users/1/otp').respond(200, getJSONFixture('huron/json/device/otps.json'));
      OtpService.loadOtps('1').then(function (data) {
        expect(data.length).toEqual(1);
      });
      $httpBackend.flush();
    });

    it('should not return invalid OTPs', function () {
      $httpBackend.whenGET(HuronConfig.getCmiUrl() + '/common/customers/1/users/1/otp').respond(200, getJSONFixture('huron/json/device/invalidOtps.json'));
      OtpService.loadOtps('1').then(function (data) {
        expect(data.length).toEqual(0);
      });
      $httpBackend.flush();
    });
  });

  describe('generateOtp function', function () {
    it('should exist', function () {
      expect(OtpService.generateOtp).toBeDefined();
    });

    it('should generate an OTP', function () {
      $httpBackend.whenPOST(HuronConfig.getCmiUrl() + '/identity/users/otp', {
        'userName': 'someUser'
      }).respond(200, getJSONFixture('huron/json/device/otps/0001000200030004.json'));
      OtpService.generateOtp('someUser').then(function (data) {
        expect(data.code).toEqual('0001000200030004');
        expect(data.friendlyCode).toEqual('0001-0002-0003-0004');
      });
      $httpBackend.flush();
    });
  });

  describe('hyphenateOtp function', function () {
    it('should exist', function () {
      expect(OtpService.hyphenateOtp).toBeDefined();
    });

    it('should return a hyphenated OTP', function () {
      expect(OtpService.hyphenateOtp('0001000200030004')).toEqual('0001-0002-0003-0004');
    });

    it('should return what is passed in if otp is null or undefined', function () {
      var otp;
      expect(OtpService.hyphenateOtp(otp)).toEqual(otp);
    });
  });

  describe('convertExpiryTime function', function () {
    it('should exist', function () {
      expect(OtpService.convertExpiryTime).toBeDefined();
    });

    it('should return the correct local browser time zone conversion', function () {
      var expiryTime = '2015-09-28 20:23:15.13';
      var timezone = jstz.determine().name();
      var utcTimeToLocal = moment(expiryTime).local().tz(timezone).format('MMMM DD, YYYY h:mm A (z)');
      expect(OtpService.convertExpiryTime(expiryTime)).toEqual(utcTimeToLocal);
    });
  });

  describe('getQrCodeUrl function', function () {
    beforeEach(function () {
      $httpBackend.expectGET(HuronConfig.getEmailUrl() + '/getqrimage/encoded?oneTimePassword=23232323232').respond(200, getJSONFixture('huron/json/device/otps/qrcode.json'));
    });

    it('should generate a qrImage', function () {

      OtpService.getQrCodeUrl('23232323232').then(function (data) {
        var arrayData = '';
        for (var i in Object.keys(data)) {

          if (data.hasOwnProperty(i)) {
            arrayData += data[i];
          }
        }
        expect(arrayData).toEqual('FAKEIMAGE');
      });
      $httpBackend.flush();
    });
  });
});
