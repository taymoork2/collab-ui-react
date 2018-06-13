import { KeyCodes } from 'modules/core/accessibility';

class ThreeDotDropdownController implements ng.IComponentController {
  public buttonAriaLabel?: string;
  public onClickFn?: Function;
  public onKeydownFn?: Function;

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
  ) {}

  public get ariaLabel(): string {
    return _.isString(this.buttonAriaLabel) ? this.buttonAriaLabel : this.$translate.instant('common.toggleMenu');
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
      // should only use 'click' event on Enter/Space events
      switch ($event.which) {
        case KeyCodes.ENTER:
        case KeyCodes.SPACE:
          this.onClickFn({ $event });
          break;
      }
    }
  }
}

export class ThreeDotDropdownComponent implements ng.IComponentOptions {
  public template = require('./three-dot-dropdown.html');
  public controller = ThreeDotDropdownController;
  public transclude = true;
  public bindings = {
    buttonAriaLabel: '@?',
    buttonClass: '<?',
    dropdownClass: '<?',
    menuClass: '<?',
    onClickFn: '&?',
    onKeydownFn: '&?', // Only for when onKeydown should differ from onClick
  };
}
