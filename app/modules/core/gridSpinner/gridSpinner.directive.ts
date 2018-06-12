
interface IGridSpinnerAttributes extends ng.IAttributes {
  gridSpinner: any;
}

interface IScopeWithSpinner extends ng.IScope {
  showSpinner?: boolean;
}

export class GridSpinnerDirective implements ng.IDirective {
  public restrict = 'A';
  public link: ng.IDirectiveLinkFn = (
    $scope: IScopeWithSpinner,
    $element: ng.IAugmentedJQuery,
    $attr: IGridSpinnerAttributes,
  ) => {

    const myScope: IScopeWithSpinner = $scope.$new(true);
    const spinnerElement = this.$compile(
      `<div class="grid-spinner" ng-if="showSpinner">
        <i class='icon icon-spinner icon-2x'></i>
      </div>`)(myScope);
    spinnerElement.appendTo($element);

    const unwatch = $scope.$watch($attr.gridSpinner, (newValue, oldValue) => {
      if (newValue !== oldValue || _.isUndefined(myScope.showSpinner)) {
        myScope.showSpinner = !!newValue;
      }
    });

    $scope.$on('$destroy', () => {
      unwatch();
      myScope.$destroy();
    });

  }

  constructor(
    private $compile: ng.ICompileService,
  ) { }

  /* @ngInject */
  public static factory($compile) {
    return new GridSpinnerDirective($compile);
  }
}
