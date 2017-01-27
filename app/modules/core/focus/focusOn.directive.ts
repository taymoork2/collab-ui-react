interface IFocusOnAttributes extends ng.IAttributes {
  focusOn: string;
}

export class FocusOn implements ng.IDirective {
  public restrict = 'A';

  constructor(
    private $timeout: ng.ITimeoutService,
  ) {}

  public link: ng.IDirectiveLinkFn = ($scope, $element, $attr: IFocusOnAttributes) => {
    let focus = (shouldFocus: boolean) => {
      if (shouldFocus) {
        this.$timeout(() => $element.focus());
      }
    };

    if ($attr.focusOn) {
      $scope.$watch($attr.focusOn, focus);
    } else {
      focus(true);
    }
  };

  /* @ngInject */
  public static directive(
    $timeout,
  ) {
    return new FocusOn(
      $timeout,
    );
  }
}
