'use strict';

describe('Service: OtpService', function () {
  var  $httpBackend, $rootScope, otpService, HuronConfig;

  beforeEach(module('uc.device'));
  beforeEach(module('ui.router'));
  beforeEach(module('Huron'));
  beforeEach(module('ngResource'));

  beforeEach(
    inject(
      function (_$httpBackend_, _$rootScope_, $resource, _OtpService_, _UserOTPService_, _HuronUser_, _HuronConfig_) {
        $httpBackend = _$httpBackend_;
        $rootScope = _$rootScope_;
        otpService = _OtpService_;
        HuronConfig = _HuronConfig_;
      }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should be registered', function () {
    expect(otpService).toBeDefined;
  });

  describe('loadOtps function', function () {
    it('should exist', function () {
      expect(otpService.loadOtps).toBeDefined;
    });

    it('should return 1 OTP', function () {
      $httpBackend.whenGET(HuronConfig.getCmiUrl() + '/common/customers/users/1/otp').respond(200, [{"activationCode":"0001000200030004","expires":{"status":"valid","time":"2015-01-30 15:37:25.031"},"links":[]}]);
      otpService.loadOtps('1').then(function(data) {
        expect(data.length).toEqual(1);
      });
      $httpBackend.flush();
    });
  });

  describe('generateOtp function', function () {
    it('should exist', function () {
      expect(otpService.generateOtp).toBeDefined;
    });

    it('should generate an OTP', function () {
      $httpBackend.whenPOST(HuronConfig.getCmiUrl() + '/identity/users/otp', {'userName': 'someUser'}).respond(200, getJSONFixture('huron/json/device/otps/0001000200030004.json'));
      otpService.generateOtp('someUser').then(function(data) {
        expect(data.code).toEqual('0001000200030004');
        expect(data.friendlyCode).toEqual('0001-0002-0003-0004');
      });
      $httpBackend.flush();
    });
  });

  describe('hyphenateOtp function', function () {
    it('should exist', function () {
      expect(otpService.hyphenateOtp).toBeDefined;
    });

    it('should return a hyphenated OTP', function () {
      expect(otpService.hyphenateOtp('0001000200030004')).toEqual('0001-0002-0003-0004');
    });

    it('should return what is passed in if otp is null or undefined', function () {
      var otp;
      expect(otpService.hyphenateOtp(otp)).toEqual(otp);
    });
  });

  describe('convertExpiryTime function', function () {
    it('should exist', function () {
      expect(otpService.convertExpiryTime).toBeDefined;
    });

    it('should return the correct time zone conversion (America/Los_Angeles)', function () {
      expect(otpService.convertExpiryTime('2015-01-23 03:16:43.327', 'America/Los_Angeles')).toEqual('01/23/15 3:16AM');
    });
  });
  
  describe('getQrCodeUrl function', function () {
    it('should exist', function () {
      expect(otpService.getQrCodeUrl).toBeDefined;
    });

    it('should return the correct url', function () {
      expect(otpService.getQrCodeUrl('0001000200030004')).toEqual(HuronConfig.getOcelotUrl() + '/getqrimage?oneTimePassword=0001000200030004');
    });
  });

});