import { RangeType } from 'modules/call/features/call-park/call-park-number/call-park-number.component';

export class CallParkRangeLengthValidator implements ng.IDirective {
  public restrict: string = 'A';
  public require: string = 'ngModel';

  public link: ng.IDirectiveLinkFn = (scope: ng.IScope, _element: ng.IAugmentedJQuery, _attrs: ng.IAttributes, ctrl: any) => {
    ctrl.$validators.rangeLength = (modelValue) => {
      if (!ctrl.$dirty) {
        return true;
      }

      const rangeType: RangeType = _.get<RangeType>(scope, '$ctrl.rangeType');
      if (rangeType !== RangeType.RANGE) {
        return true;
      }
      const startRange: number = _.toSafeInteger(_.get(scope, '$ctrl.startRange'));
      const endRange: number = _.toSafeInteger(modelValue);
      const difference: number = _.subtract(endRange, startRange);
      return (difference < 10 && difference >= 1);
    };
  }

  constructor() {}

  /* @ngInject */
  public static factory() {
    return new CallParkRangeLengthValidator();
  }
}
