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

      return this.TelephoneNumberService.isPossibleAreaCode(modelValue);
    };
  }

  constructor(
    private TelephoneNumberService,
  ) { }

  /* @ngInject */
  public static factory(TelephoneNumberService) {
    return new DialingAreaCodeValidator(TelephoneNumberService);
  }
}
