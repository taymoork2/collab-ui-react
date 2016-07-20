'use strict';

describe('Service: TelephoneNumberService', function () {
  var TelephoneNumberService;
  var validNumber = '(469) 525-1111';
  var invalidNumber = '(200) 525-1111';
  var invalidNumberNoFormat = '2005251111';
  var validE164 = '+14695251111';
  var invalidE164 = '+12005251111';
  var tollFreeNumber = '+18003287448';
  var premiumNumber = '+19003287448';

  beforeEach(module('Huron'));

  beforeEach(inject(function (_TelephoneNumberService_) {
    TelephoneNumberService = _TelephoneNumberService_;
  }));

  it('should default country code to 1', function () {
    expect(TelephoneNumberService.getCountryCode()).toEqual('1');
    expect(TelephoneNumberService.getRegionCode()).toEqual('us');
  });

  it('should change region code from country code', function () {
    TelephoneNumberService.setCountryCode('61');
    expect(TelephoneNumberService.getRegionCode()).toEqual('au');
  });

  it('should change region code from country code', function () {
    TelephoneNumberService.setRegionCode('us');
    expect(TelephoneNumberService.getCountryCode()).toEqual('1');
  });

  it('should transform a valid number into E164', function () {
    expect(TelephoneNumberService.validateDID(validNumber)).toEqual(true);
    expect(TelephoneNumberService.getDIDValue(validNumber)).toEqual(validE164);
  });

  it('should strip formatting of invalid numbers', function () {
    expect(TelephoneNumberService.validateDID(invalidNumber)).toEqual(false);
    expect(TelephoneNumberService.getDIDValue(invalidNumber)).toEqual(invalidNumberNoFormat);
  });

  it('should transform a valid E164 into a formatted number', function () {
    expect(TelephoneNumberService.validateDID(validE164)).toEqual(true);
    expect(TelephoneNumberService.getDIDLabel(validE164)).toEqual(validNumber);
  });

  it('should not transform an invalid E164', function () {
    expect(TelephoneNumberService.validateDID(invalidE164)).toEqual(false);
    expect(TelephoneNumberService.getDIDLabel(invalidE164)).toEqual(invalidE164);
  });

  it('should accept a toll free number', function () {
    expect(TelephoneNumberService.validateDID(tollFreeNumber)).toEqual(true);
  });

  it('should reject a premium rate number', function () {
    expect(TelephoneNumberService.validateDID(premiumNumber)).toEqual(false);
  });

});
