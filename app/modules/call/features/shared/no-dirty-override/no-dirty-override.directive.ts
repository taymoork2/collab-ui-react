export class NoDirtyOverride implements ng.IDirective {
  public restrict: string = 'A';
  public require: string = 'ngModel';

  public link: ng.IDirectiveLinkFn = (
    _scope: ng.IScope,
    _element: ng.IAugmentedJQuery,
    _attrs: ng.IAttributes,
    ctrl: any,
  ) => {
    ctrl.$setDirty = _.noop;
  }

  constructor() {}

  /* @ngInject */
  public static factory() {
    return new NoDirtyOverride();
  }
}
