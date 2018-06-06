// Input Validator Service - for use with forms and inputs

interface IFormField {
  $dirty: boolean;
  $touched: boolean;
  $invalid?: boolean;
  $valid?: boolean;
  $setPristine: Function;
  $setUntouched: Function;
  $setValidity: Function;
}

interface IResult {
  error: boolean;
  warning?: boolean;
}

export class InputValidatorService {
  /* @ngInject */
  constructor(
  ) {}

  // returns an object in the form {error: boolean} for use with an input field
  // usage:  ng-class="$ctrl.validatorSvc.makeErrorClass(myForm.myField))"
  public makeErrorClass(name: IFormField): IResult {
    if (_.isUndefined(name)) {
      name = this.createEmptyFormField();
    }
    return {
      error: !!(name.$invalid && (name.$dirty || name.$touched)),
    };
  }

  // creates an obect in the form {error: boolean, warning: boolean} for use with an input field
  // usage: ng-class="$ctrl.validatorSvc.makeErrorAndWarnClass(myForm.myField, warningFlag)"
  // (typically warning flag will be set by the validator as something like '$ctrl.messages.myField.warning')
  public makeErrorAndWarnClass(name: IFormField, warnFlag: boolean): IResult {
    if (_.isUndefined(name)) {
      name = this.createEmptyFormField();
    }
    return {
      error: !!(name.$invalid && (name.$dirty || name.$touched)),
      warning: !!(name.$valid && (name.$dirty || name.$touched) && warnFlag),
    };
  }

  // clears field conditions that would show an error or warning (to be used with ng-keyup on input)
  // usage: ng-keyup="$ctrl.validatorSvc.resetField(myForm.myField, $ctrl, 'myValidatorInCamelCase')"
  public resetField(field: IFormField, controller: ng.IController, validator: string): void {
    field.$setPristine();
    field.$setUntouched();
    if (controller && !_.isEmpty(validator)) {
      field.$setValidity(validator, false, controller);
    }
  }

  private createEmptyFormField(): IFormField {
    return {
      $dirty: false,
      $invalid: false,
      $touched: false,
      $setPristine: _.noop,
      $setUntouched: _.noop,
      $setValidity: _.noop,
    };
  }
}
