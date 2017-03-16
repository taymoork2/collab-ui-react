import { IExtensionRange } from 'modules/huron/settings/extensionRange';

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
      let beginNumber = _.toSafeInteger(_.get(scope, 'range.beginNumber'));
      let endNumber = _.toSafeInteger(modelValue);

      let numberRanges = _.get<Array<IExtensionRange>>(scope.$parent, '$ctrl.numberRanges');

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
