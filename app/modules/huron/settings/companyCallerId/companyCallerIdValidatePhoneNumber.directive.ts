export class CallerIdPhoneNumberValidator implements ng.IDirective {
  public restrict: string = 'A';
  public require: string = 'ngModel';

  public link: ng.IDirectiveLinkFn = (
    _scope: ng.IScope,
    _element: ng.IAugmentedJQuery,
    _attrs: ng.IAttributes,
    ctrl: any,
  ) => {
    ctrl.$validators.callerIdPhoneNumber = (modelValue) => {
      let value = '';
      if (_.isObject(modelValue)) {
        value = _.get<string>(modelValue, 'value');
      } else {
        value = modelValue;
      }

      return this.TelephoneNumberService.validateDID(value);
    };
  }

  constructor(
    private TelephoneNumberService,
  ) { }

  /* @ngInject */
  public static factory(TelephoneNumberService) {
    return new CallerIdPhoneNumberValidator(TelephoneNumberService);
  }
}
