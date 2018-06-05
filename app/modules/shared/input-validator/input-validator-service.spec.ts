import inputValidator from './index';

const errorFalse = { error: false };
const errorTrue = { error: true };

const errorWarnFalse = { error: false, warning: false };
const errorWarnTrue = { error: false, warning: true };
const errorWarnError = { error: true, warning: false };

describe('Service: InputValidator', () => {
  beforeEach(function () {
    this.initModules(inputValidator);
    this.injectDependencies(
      'InputValidatorService',
    );
  });

  describe('class constructs', () => {
    it('should handle undefined passed as param', function () {
      expect(this.InputValidatorService.makeErrorClass(undefined)).toEqual(errorFalse);
      expect(this.InputValidatorService.makeErrorAndWarnClass(undefined, undefined)).toEqual(errorWarnFalse);
      expect(this.InputValidatorService.makeErrorAndWarnClass({}, undefined)).toEqual(errorWarnFalse);
    });
  });

  describe('$valid cases', () => {
    beforeEach(function () {
      this.field = {
        $valid: true,
      };
    });

    it('should show no errors regardless of state', function () {
      // field has not yet been touched or modified, so should be clean
      expect(this.InputValidatorService.makeErrorClass(this.field)).toEqual(errorFalse);

      this.field.$dirty = true;
      expect(this.InputValidatorService.makeErrorClass(this.field)).toEqual(errorFalse);

      this.field.$touched = true;
      expect(this.InputValidatorService.makeErrorClass(this.field)).toEqual(errorFalse);

      this.field.$dirty = false;
      expect(this.InputValidatorService.makeErrorClass(this.field)).toEqual(errorFalse);
    });

    it('should show warning class only when warning flag equates to true', function () {
      // field has not yet been touched or modified, so should be clean
      expect(this.InputValidatorService.makeErrorAndWarnClass(this.field)).toEqual(errorWarnFalse);
      expect(this.InputValidatorService.makeErrorAndWarnClass(this.field, false)).toEqual(errorWarnFalse);
      expect(this.InputValidatorService.makeErrorAndWarnClass(this.field, true)).toEqual(errorWarnFalse);

      this.field.$dirty = true;
      expect(this.InputValidatorService.makeErrorAndWarnClass(this.field)).toEqual(errorWarnFalse);
      expect(this.InputValidatorService.makeErrorAndWarnClass(this.field, false)).toEqual(errorWarnFalse);
      expect(this.InputValidatorService.makeErrorAndWarnClass(this.field, true)).toEqual(errorWarnTrue);

      this.field.$touched = true;
      expect(this.InputValidatorService.makeErrorAndWarnClass(this.field)).toEqual(errorWarnFalse);
      expect(this.InputValidatorService.makeErrorAndWarnClass(this.field, false)).toEqual(errorWarnFalse);
      expect(this.InputValidatorService.makeErrorAndWarnClass(this.field, true)).toEqual(errorWarnTrue);

      this.field.$dirty = false;
      expect(this.InputValidatorService.makeErrorAndWarnClass(this.field)).toEqual(errorWarnFalse);
      expect(this.InputValidatorService.makeErrorAndWarnClass(this.field, false)).toEqual(errorWarnFalse);
      expect(this.InputValidatorService.makeErrorAndWarnClass(this.field, true)).toEqual(errorWarnTrue);
    });
  });

  describe('$invalid cases', () => {
    beforeEach(function () {
      this.field = {
        $invalid: true,
      };
    });

    it('should show errors except when field is untouched and clean', function () {
      // field has not yet been touched or modified, so should be clean
      expect(this.InputValidatorService.makeErrorClass(this.field)).toEqual(errorFalse);

      this.field.$dirty = true;
      expect(this.InputValidatorService.makeErrorClass(this.field)).toEqual(errorTrue);

      this.field.$touched = true;
      expect(this.InputValidatorService.makeErrorClass(this.field)).toEqual(errorTrue);

      this.field.$dirty = false;
      expect(this.InputValidatorService.makeErrorClass(this.field)).toEqual(errorTrue);
    });

    it('should not show warning regardles of state', function () {
      // field has not yet been touched or modified, so should be clean
      expect(this.InputValidatorService.makeErrorAndWarnClass(this.field)).toEqual(errorWarnFalse);
      expect(this.InputValidatorService.makeErrorAndWarnClass(this.field, false)).toEqual(errorWarnFalse);
      expect(this.InputValidatorService.makeErrorAndWarnClass(this.field, true)).toEqual(errorWarnFalse);

      this.field.$dirty = true;
      expect(this.InputValidatorService.makeErrorAndWarnClass(this.field)).toEqual(errorWarnError);
      expect(this.InputValidatorService.makeErrorAndWarnClass(this.field, false)).toEqual(errorWarnError);
      expect(this.InputValidatorService.makeErrorAndWarnClass(this.field, true)).toEqual(errorWarnError);

      this.field.$touched = true;
      expect(this.InputValidatorService.makeErrorAndWarnClass(this.field)).toEqual(errorWarnError);
      expect(this.InputValidatorService.makeErrorAndWarnClass(this.field, false)).toEqual(errorWarnError);
      expect(this.InputValidatorService.makeErrorAndWarnClass(this.field, true)).toEqual(errorWarnError);

      this.field.$dirty = false;
      expect(this.InputValidatorService.makeErrorAndWarnClass(this.field)).toEqual(errorWarnError);
      expect(this.InputValidatorService.makeErrorAndWarnClass(this.field, false)).toEqual(errorWarnError);
      expect(this.InputValidatorService.makeErrorAndWarnClass(this.field, true)).toEqual(errorWarnError);
    });
  });
});
