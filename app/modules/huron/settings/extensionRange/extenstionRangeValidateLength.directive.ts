export class ExtensionRangeLengthValidator implements ng.IDirective {
  public restrict: string = 'A';
  public require: string = 'ngModel';
  public MAX_RANGE_LENGTH: number = 10000;

  public link: ng.IDirectiveLinkFn = (
    scope: ng.IScope,
    _element: ng.IAugmentedJQuery,
    attrs: ng.IAttributes,
    ctrl: any,
  ) => {
    ctrl.$validators.rangeLength = (modelValue) => {
      if (!ctrl.$dirty) {
        return true;
      }

      let beginNumber: number = 0;
      let endNumber: number = 0;

      if (_.get(attrs, 'validateExtensionRangeLength') === 'beginNumber') {
        beginNumber =  _.toSafeInteger(modelValue);
        endNumber = _.toSafeInteger(_.get(scope, 'range.endNumber'));
      } else if (_.get(attrs, 'validateExtensionRangeLength') === 'endNumber') {
        beginNumber = _.toSafeInteger(_.get(scope, 'range.beginNumber'));
        endNumber = _.toSafeInteger(modelValue);
      }

      let difference: number = _.subtract(endNumber, beginNumber);
      return (difference < this.MAX_RANGE_LENGTH);
    };
  }

  constructor() { }

  /* @ngInject */
  public static factory() {
    return new ExtensionRangeLengthValidator();
  }
}
