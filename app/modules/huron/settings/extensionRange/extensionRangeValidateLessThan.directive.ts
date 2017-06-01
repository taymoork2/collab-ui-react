export class ExtensionRangeLessThanValidator implements ng.IDirective {
  public restrict: string = 'A';
  public require: string = 'ngModel';

  public link: ng.IDirectiveLinkFn = (
    scope: ng.IScope,
    _element: ng.IAugmentedJQuery,
    _attrs: ng.IAttributes,
    ctrl: any,
  ) => {
    ctrl.$validators.lessThan = () => {
      if (!ctrl.$dirty) {
        return true;
      }

      // only validate if endNumber is valid or populated
      if (_.isUndefined(_.get(scope, 'range.endNumber')) || _.get(scope, 'range.endNumber') === '') {

        let controlId = _.get(ctrl, '$name', '').slice(-1);
        let endNumberControl = _.get<ng.INgModelController>(scope.$parent, '$ctrl.extensionRangeForm.endRange' + controlId);
        endNumberControl.$validate();
      }
      return true;
    };
  }

  constructor() { }

  /* @ngInject */
  public static factory() {
    return new ExtensionRangeLessThanValidator();
  }
}
