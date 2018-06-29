// Input Validator Service - for use with forms and inputs

interface IResult {
  error: boolean;
  warning?: boolean;
}

export class InputValidatorService {
  /* @ngInject */
  constructor(
  ) {}

  public makeErrorClass(name: ng.INgModelController): IResult {
    if (_.isUndefined(name)) {
      return { error: false };
    }
    return {
      error: !!(name.$invalid && (name.$dirty || name.$touched)),
    };
  }

  public makeErrorAndWarnClass(name: ng.INgModelController, warnFlag: boolean): IResult {
    if (_.isUndefined(name)) {
      return { error: false, warning: false };
    }
    return {
      error: !!(name.$invalid && (name.$dirty || name.$touched)),
      warning: !!(name.$valid && (name.$dirty || name.$touched) && warnFlag),
    };
  }

/**
 * @ngdoc function
 * @name resetField
 * @module shared.inputValidator
 * @kind function
 *
 * @description
 * Reset form field to clear validation messages for use with debounced inputs.
 * NOTE incompatible with ngModelOption allowInvalid
 *
 * @param {Object} field - form field to reset (e.g. `form.myInput`)
 * @param {string} validator - the affected validater in camelCase form
 *
 */
  public resetField(field, validator: string): void {
    if (_.isUndefined(field.$modelValue) && (_.get(field, '$error.' + validator) === true) && (field.$viewValue === field.$$lastCommittedViewValue)) {
      // user modifies value then resets it during a validation cycle while error message present
      field.$setDirty();
    } else if (field.$viewValue !== field.$modelValue) {
      // value changed
      field.$setPristine();
      field.$setUntouched();
      if (field.$modelValue) {
        field.$setValidity(validator, false);
      }
    } else if (field.$modelValue && (field.$invalid === true)) {
      // user modifies value then resets it during validation cycle while warning message present
      field.$setDirty();
      field.$validate();
    }
  }
}
