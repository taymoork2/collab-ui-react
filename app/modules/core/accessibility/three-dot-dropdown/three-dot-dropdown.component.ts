class ThreeDotDropdownController implements ng.IComponentController {
  public onClickFn?: Function;
  public onKeydownFn?: Function;
  public tddAriaLabel?: string;

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
  ) {}

  get ariaLabel(): string {
    return _.isString(this.tddAriaLabel) ? this.tddAriaLabel : this.$translate.instant('common.toggleMenu');
  }

  public onClick($event): void {
    if (_.isFunction(this.onClickFn)) {
      this.onClickFn({ $event });
    }
  }

  public onKeydown($event): void {
    if (_.isFunction(this.onKeydownFn)) {
      this.onKeydownFn({ $event });
    } else if (_.isFunction(this.onClickFn)) {
      this.onClickFn({ $event });
    }
  }
}

export class ThreeDotDropdownComponent implements ng.IComponentOptions {
  public template = require('./three-dot-dropdown.html');
  public controller = ThreeDotDropdownController;
  public transclude = true;
  public bindings = {
    buttonClass: '<?',
    dropdownClass: '<?',
    menuClass: '<?',
    onClickFn: '&?',
    onKeydownFn: '&?', // Only for when onKeydown should differ from onClick
    tddAriaLabel: '@?',
  };
}
