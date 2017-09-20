import { InternalNumberRange } from 'modules/call/shared/internal-number-range';

export class ExtensionRangeOverlapValidator implements ng.IDirective {
  public restrict: string = 'A';
  public require: string = 'ngModel';

  public link: ng.IDirectiveLinkFn = (
    scope: ng.IScope,
    _element: ng.IAugmentedJQuery,
    _attrs: ng.IAttributes,
    ctrl: any,
  ) => {
    ctrl.$validators.overlap = (modelValue) => {
      if (!ctrl.$dirty) {
        return true;
      }

      let result = true;
      const beginNumber = _.toSafeInteger(_.get(scope, 'range.beginNumber'));
      const endNumber = _.toSafeInteger(modelValue);

      const numberRanges = _.get<InternalNumberRange[]>(scope.$parent, '$ctrl.numberRanges');

      _.forEach(numberRanges, range => {
        if (Math.max(beginNumber, _.toSafeInteger(range.beginNumber)) <= Math.min(endNumber, _.toSafeInteger(range.endNumber))) {
          result = false;
        }
      });

      return result;
    };
  }

  constructor() { }

  /* @ngInject */
  public static factory() {
    return new ExtensionRangeOverlapValidator();
  }
}
