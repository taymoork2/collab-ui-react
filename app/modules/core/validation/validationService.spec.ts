import validationServiceModule from './index';

describe('Service: ValidationService', () => {
  beforeEach(function() {
    this.initModules(validationServiceModule);
    this.injectDependencies(
      'ValidationService',
    );
  });

  describe('Validate Numeric', () => {
    it('should accept 1234567890 as valid', function () {
      expect(this.ValidationService.numeric(1234567890)).toBe(true);
    });

    it('should reject duckeroo as invalid', function () {
      expect(this.ValidationService.numeric('duckeroo')).toBe(false);
    });

    it('should reject 00ducker00 as invalid', function () {
      expect(this.ValidationService.numeric('00ducker00')).toBe(false);
    });
  });

  describe('Max Number 100', () => {
    it('should reject 101 as invalid', function () {
      expect(this.ValidationService.maxNumber100(101)).toBe(false);
    });
    it('should accept 100 as valid', function () {
      expect(this.ValidationService.maxNumber100(100)).toBe(true);
    });
  });

  describe('US Phone Number', () => {
    it('should reject "77359090a9" as invalid', function () {
      expect(this.ValidationService.phoneUS('77359090a9')).toBe(false);
    });
    it('should accept "7735909089" as valid', function () {
      expect(this.ValidationService.phoneUS('7735909089')).toBe(true);
    });
    it('should accept "(214)590-9089" as valid', function () {
      expect(this.ValidationService.phoneUS('(214)590-9089')).toBe(true);
    });
    it('should accept "(214)590-9-089" as valid', function () {
      expect(this.ValidationService.phoneUS('(214)590-9-089')).toBe(true);
    });
    it('should reject "(214)590-99089" as invalid', function () {
      expect(this.ValidationService.phoneUS('(214)590-99089')).toBe(false);
    });
    it('should accept "1-(214)590-9909" as valid', function () {
      expect(this.ValidationService.phoneUS('1-(214)590-9909')).toBe(true);
    });
    it('should accept "1-866-499-7888" as valid', function () {
      expect(this.ValidationService.phoneUS('1-866-499-7888')).toBe(true);
    });

  });

});
