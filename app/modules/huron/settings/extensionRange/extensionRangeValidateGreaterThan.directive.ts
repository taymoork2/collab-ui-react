export class ExtensionRangeGreaterThanValidator implements ng.IDirective {
  public restrict: string = 'A';
  public require: string = 'ngModel';

  public link: ng.IDirectiveLinkFn = (
    scope: ng.IScope,
    _element: ng.IAugmentedJQuery,
    _attrs: ng.IAttributes,
    ctrl: any,
  ) => {
    ctrl.$validators.greaterThan = (modelValue) => {
      if (!ctrl.$dirty) {
        return true;
      }

      // only validate if beginNumber is valid or populated
      if (_.isUndefined(_.get(scope, 'range.beginNumber')) || _.get(scope, 'range.beginNumber') === '') {
        return true;
      } else {
        return modelValue >= _.get(scope, 'range.beginNumber');
      }
    };
  }

  constructor() { }

  /* @ngInject */
  public static factory() {
    return new ExtensionRangeGreaterThanValidator();
  }
}
