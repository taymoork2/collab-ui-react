
interface IGridSpinnerAttributes extends ng.IAttributes {
  gridSpinner: any;
}

export class GridSpinnerDirective implements ng.IDirective {
  public restrict = 'A';
  public link: ng.IDirectiveLinkFn = (
    $scope: ng.IScope,
    $element: ng.IAugmentedJQuery,
    $attr: IGridSpinnerAttributes,
  ) => {

    let myScope = $scope.$new(true);
    let spinnerElement = this.$compile(
      `<div class="grid-spinner" ng-if="showSpinner">
        <i class='icon icon-spinner icon-2x'></i>
      </div>`)(myScope);
    spinnerElement.appendTo($element);

    let unwatch = $scope.$watch($attr.gridSpinner, (newValue, oldValue) => {
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

