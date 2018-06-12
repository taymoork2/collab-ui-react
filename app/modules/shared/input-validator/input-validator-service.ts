// Input Validator Service - for use with forms and inputs

interface IFormField {
  $dirty: boolean;
  $touched: boolean;
  $invalid?: boolean;
  $valid?: boolean;
}

interface IResult {
  error: boolean;
  warning?: boolean;
}

export class InputValidatorService {
  /* @ngInject */
  constructor(
  ) {}

  public makeErrorClass(name: IFormField): IResult {
    if (_.isUndefined(name)) {
      name = this.createEmptyFormField();
    }
    return {
      error: !!(name.$invalid && (name.$dirty || name.$touched)),
    };
  }

  public makeErrorAndWarnClass(name: IFormField, warnFlag: boolean): IResult {
    if (_.isUndefined(name)) {
      name = this.createEmptyFormField();
    }
    return {
      error: !!(name.$invalid && (name.$dirty || name.$touched)),
      warning: !!(name.$valid && (name.$dirty || name.$touched) && warnFlag),
    };
  }

  private createEmptyFormField(): IFormField {
    return {
      $dirty: false,
      $invalid: false,
      $touched: false,
    };
  }
}
