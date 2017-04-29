class BooleanTextFieldController implements ng.IComponentController {
  public label: string;
  public value: boolean;
}

export class BooleanTextFieldComponent implements ng.IComponentOptions {
  public controller = BooleanTextFieldController;
  public templateUrl = 'modules/messenger/shared/boolean-text-field/boolean-text-field.html';
  public bindings = {
    label: '@',
    ngModel: '<',
  };
}
