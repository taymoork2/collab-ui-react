export class DialingAreaCodeValidator implements ng.IDirective {
  public restrict: string = 'A';
  public require: string = 'ngModel';

  public link: ng.IDirectiveLinkFn = (
    _scope: ng.IScope,
    _element: ng.IAugmentedJQuery,
    _attrs: ng.IAttributes,
    ctrl: any,
  ) => {
    ctrl.$validators.areaCode = (modelValue) => {
      if (!ctrl.$dirty) {
        return true;
      }

      return this.PhoneNumberService.isPossibleAreaCode(modelValue, 'us');
    };
  }

  constructor(
    private PhoneNumberService,
  ) { }

  /* @ngInject */
  public static factory(PhoneNumberService) {
    return new DialingAreaCodeValidator(PhoneNumberService);
  }
}
