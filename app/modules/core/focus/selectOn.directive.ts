interface ISelectOnAttributes extends ng.IAttributes {
  selectOn: string;
}

export class SelectOn implements ng.IDirective {
  public restrict = 'A';

  constructor(
    private $timeout: ng.ITimeoutService,
  ) {}

  public link: ng.IDirectiveLinkFn = ($scope, $element, $attr: ISelectOnAttributes) => {
    let select = (shouldSelect: boolean) => {
      if (shouldSelect) {
        this.$timeout(() => $element.select());
      }
    };

    if ($attr.selectOn) {
      $scope.$watch($attr.selectOn, select);
    } else {
      select(true);
    }
  };

  /* @ngInject */
  public static directive(
    $timeout,
  ) {
    return new SelectOn(
      $timeout,
    );
  }
}
