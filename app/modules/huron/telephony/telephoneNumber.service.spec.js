'use strict';

describe('Service: TelephoneNumberService', function () {
  var validNumber = '(469) 525-1111';
  var invalidNumber = '(200) 525-1111';
  var invalidNumberNoFormat = '2005251111';
  var validE164 = '+14695251111';
  var invalidE164 = '+12005251111';
  var tollFreeNumber = '+18003287448';
  var premiumNumber = '+19003287448';

  beforeEach(function () {
    this.initModules(
      require('./telephoneNumber.service'),
      require('collab-ui')
    );
    this.injectDependencies(
      'TelephoneNumberService',
      'CountryCodes'
    );
  });

  it('should default country code to 1', function () {
    expect(this.TelephoneNumberService.getCountryCode()).toEqual('1');
    expect(this.TelephoneNumberService.getRegionCode()).toEqual('us');
  });

  it('should change region code from country code', function () {
    this.TelephoneNumberService.setCountryCode('61');
    expect(this.TelephoneNumberService.getRegionCode()).toEqual('au');
  });

  it('should change region code from country code', function () {
    this.TelephoneNumberService.setRegionCode('us');
    expect(this.TelephoneNumberService.getCountryCode()).toEqual('1');
  });

  it('should transform a valid number into E164', function () {
    expect(this.TelephoneNumberService.validateDID(validNumber)).toEqual(true);
    expect(this.TelephoneNumberService.getDIDValue(validNumber)).toEqual(validE164);
  });

  it('should strip formatting of invalid numbers', function () {
    expect(this.TelephoneNumberService.validateDID(invalidNumber)).toEqual(false);
    expect(this.TelephoneNumberService.getDIDValue(invalidNumber)).toEqual(invalidNumberNoFormat);
  });

  it('should transform a valid E164 into a formatted number', function () {
    expect(this.TelephoneNumberService.validateDID(validE164)).toEqual(true);
    expect(this.TelephoneNumberService.getDIDLabel(validE164)).toEqual(validNumber);
  });

  it('should not transform an invalid E164', function () {
    expect(this.TelephoneNumberService.validateDID(invalidE164)).toEqual(false);
    expect(this.TelephoneNumberService.getDIDLabel(invalidE164)).toEqual(invalidE164);
  });

  it('should accept a toll free number', function () {
    expect(this.TelephoneNumberService.validateDID(tollFreeNumber)).toEqual(true);
  });

  it('should reject a premium rate number', function () {
    expect(this.TelephoneNumberService.validateDID(premiumNumber)).toEqual(false);
  });

  it('should identify toll-free numbers', function () {
    expect(this.TelephoneNumberService.isTollFreeNumber(validE164)).toEqual(false);
    expect(this.TelephoneNumberService.isTollFreeNumber(validNumber)).toEqual(false);
    expect(this.TelephoneNumberService.isTollFreeNumber(premiumNumber)).toEqual(false);
    expect(this.TelephoneNumberService.isTollFreeNumber(invalidE164)).toEqual(false);
    expect(this.TelephoneNumberService.isTollFreeNumber(invalidNumberNoFormat)).toEqual(false);

    expect(this.TelephoneNumberService.isTollFreeNumber(tollFreeNumber)).toEqual(true);
  });

  it('should identify possible US area codes', function () {
    expect(this.TelephoneNumberService.isPossibleAreaCode('9')).toEqual(false);
    expect(this.TelephoneNumberService.isPossibleAreaCode('97')).toEqual(false);
    expect(this.TelephoneNumberService.isPossibleAreaCode('972')).toEqual(true);
  });

  it('should identify possible au area codes', function () {
    this.TelephoneNumberService.setCountryCode('61');
    expect(this.TelephoneNumberService.isPossibleAreaCode('9')).toEqual(false);
    expect(this.TelephoneNumberService.isPossibleAreaCode('7')).toEqual(true);
    expect(this.TelephoneNumberService.isPossibleAreaCode('5')).toEqual(true);
    expect(this.TelephoneNumberService.isPossibleAreaCode('3')).toEqual(true);
  });

  it('should not accept a toll free number', function () {
    expect(this.TelephoneNumberService.validateDID(tollFreeNumber)).toEqual(true);
  });
});
