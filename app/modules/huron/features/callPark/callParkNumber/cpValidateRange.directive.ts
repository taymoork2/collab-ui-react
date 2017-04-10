import { CallParkService } from 'modules/huron/features/callPark/services';
import { RangeFieldName } from 'modules/huron/features/callPark/callParkNumber/callParkNumber.component';

export class CallParkRangeValidator implements ng.IDirective {
  public restrict: string = 'A';
  public require: string = 'ngModel';

  public link: ng.IDirectiveLinkFn = (
    _scope: ng.IScope,
    _element: ng.IAugmentedJQuery,
    _attrs: ng.IAttributes,
    ctrl: any,
  ) => {
    ctrl.$asyncValidators.range = (modelValue) => {
      // consider empty model valid
      if (ctrl.$isEmpty(modelValue)) {
        return this.$q.resolve();
      }

      // non-dirty element is valid
      if (!ctrl.$dirty) {
        return this.$q.resolve();
      }

      // check against existing values and don't call getEndRange API under certain conditions
      let existingCallPark = this.CallParkService.getOriginalConfig();
      if (existingCallPark && existingCallPark.uuid) {
        switch (ctrl.$name) {
          case RangeFieldName.SINGLE_NUMBER:
            //check if modelValue was changed back to original value
            if (existingCallPark.startRange === modelValue) {
              return this.$q.resolve();
            }
            // check if single number value is in existing range eg. range = 200-209 and single number changed to 203
            if (this.existsInCurrentRange(existingCallPark.startRange, existingCallPark.endRange, modelValue)) {
              return this.$q.resolve();
            }
            break;
          case RangeFieldName.END_RANGE:
            //check if modelValue was changed back to original value
            if (existingCallPark.endRange === modelValue) {
              return this.$q.resolve();
            }
            // check if endRange value is in existing range eg. range = 200-209 and endRange changed to 203
            if (this.existsInCurrentRange(existingCallPark.startRange, existingCallPark.endRange, modelValue)) {
              return this.$q.resolve();
            }
            break;
        }
      }

      return this.CallParkService.getEndRange(modelValue)
        .then(endRange => endRange.length ? true : this.$q.reject('Extension number already in use'));
    };
  }

  private existsInCurrentRange(startRange: any, endRange: any, modelValue: any): boolean {
    return _.inRange(_.toNumber(modelValue), _.toNumber(startRange), _.toNumber(endRange) + 1);
  }

  constructor(
    private CallParkService: CallParkService,
    private $q: ng.IQService,
  ) {}

  /* @ngInject */
  public static factory(
    CallParkService,
    $q,
  ) {
    return new CallParkRangeValidator(CallParkService, $q);
  }
}
