import phoneNumberModule from './index';
import { PhoneNumberType } from 'google-libphonenumber';

describe('Service: PhoneNumberService', () => {
  const validNational_US = '(469) 525-1111';
  const validNational_UK = '020 7183 8750';
  const validE164_US = '+14695251111';
  const validE164_UK = '+442071838750';
  const invalidNumberNoFormat = '2005251111';
  const invalidE164_US = '+12005251111';
  const tollFreeNumber = '+18003287448';
  const premiumNumber = '+19003287448';
  const euNumber = '020 3443 8618';
  const euCode = 'GB';

  beforeEach(function() {
    this.initModules(phoneNumberModule);
    this.injectDependencies(
      'PhoneNumberService',
    );
  });

  it('should return correct number type', function() {
    expect(this.PhoneNumberService.getPhoneNumberType('aaaaaaa')).toEqual(PhoneNumberType.UNKNOWN);
    expect(this.PhoneNumberService.getPhoneNumberType(premiumNumber)).toEqual(PhoneNumberType.PREMIUM_RATE);
  });

  it('should default country code to US if country code not passed in', function () {
    expect(this.PhoneNumberService.validateDID(euNumber)).toEqual(false);
  });

  it('should read country code from calling service if passed in', function () {
    expect(this.PhoneNumberService.validateDID(euNumber, euCode)).toEqual(true);
  });

  it('should transform E164 format to national format', function() {
    expect(this.PhoneNumberService.getNationalFormat(validE164_US)).toEqual(validNational_US);
    expect(this.PhoneNumberService.getNationalFormat(validE164_UK)).toEqual(validNational_UK);
  });

  it('should return original value for invalid E164 number format', function() {
    expect(this.PhoneNumberService.getNationalFormat(invalidNumberNoFormat)).toEqual(invalidNumberNoFormat);
  });

  it('should return correct e164 number when regionCode is passed in', function () {
    expect(this.PhoneNumberService.getE164Format(validNational_UK, euCode)).toEqual(validE164_UK);
  });

  it('should accept a toll free number', function () {
    expect(this.PhoneNumberService.validateDID(tollFreeNumber)).toEqual(true);
  });

  it('should identify toll-free numbers', function() {
    expect(this.PhoneNumberService.isTollFreeNumber(validE164_US)).toEqual(false);
    expect(this.PhoneNumberService.isTollFreeNumber(validNational_US)).toEqual(false);
    expect(this.PhoneNumberService.isTollFreeNumber(premiumNumber)).toEqual(false);
    expect(this.PhoneNumberService.isTollFreeNumber(invalidE164_US)).toEqual(false);
    expect(this.PhoneNumberService.isTollFreeNumber(invalidNumberNoFormat)).toEqual(false);

    expect(this.PhoneNumberService.isTollFreeNumber(tollFreeNumber)).toEqual(true);
  });

  it('should identify possible US area codes', function () {
    expect(this.PhoneNumberService.isPossibleAreaCode('9', 'us')).toEqual(false);
    expect(this.PhoneNumberService.isPossibleAreaCode('97', 'us')).toEqual(false);
    expect(this.PhoneNumberService.isPossibleAreaCode('972', 'us')).toEqual(true);
  });

  it('should identify possible au area codes', function () {
    expect(this.PhoneNumberService.isPossibleAreaCode('9', 'au')).toEqual(false);
    expect(this.PhoneNumberService.isPossibleAreaCode('7', 'au')).toEqual(true);
    expect(this.PhoneNumberService.isPossibleAreaCode('5', 'au')).toEqual(true);
    expect(this.PhoneNumberService.isPossibleAreaCode('3', 'au')).toEqual(true);
  });
});
