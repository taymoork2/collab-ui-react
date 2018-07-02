import { KeyCodes } from 'modules/core/accessibility';
import threeDotDropdownModule from './index';

describe('Component: threeDotDropdown', () => {
  const DROPDOWN = '.actions-menu';
  const BUTTON = 'button';
  const MENU = 'ul';

  beforeEach(function () {
    this.initModules(threeDotDropdownModule);
    this.injectDependencies();
    this.$scope.click = jasmine.createSpy('click');
  });

  it('should work with class strings and the default aria label', function () {
    this.$scope.myButtonClass = 'buttonClass';
    this.$scope.myDropdownClass = 'dropdownClass';
    this.$scope.myMenuClass = 'menuClass';

    this.compileComponent('threeDotDropdown', {
      buttonClass: 'myButtonClass',
      dropdownClass: 'myDropdownClass',
      menuClass: 'myMenuClass',
      onClickFn: 'click($event)',
    });

    expect(this.controller.ariaLabel).toBe('common.toggleMenu');
    expect(this.view.find(DROPDOWN)).toHaveClass(this.$scope.myDropdownClass);
    expect(this.view.find(BUTTON)).toHaveClass(this.$scope.myButtonClass);
    expect(this.view.find(MENU)).toHaveClass(this.$scope.myMenuClass);

    this.view.find(BUTTON).click();
    expect(this.$scope.click).toHaveBeenCalledTimes(1);
    this.controller.onKeydown({ which: KeyCodes.SPACE });
    expect(this.$scope.click).toHaveBeenCalledTimes(2);
  });

  it('should work with class objects and a provided aria label', function () {
    const class_one = 'class_one';
    const class_two = 'class_two';

    this.$scope.keydown = jasmine.createSpy('keydown');
    this.$scope.ariaLabel = 'aria label';
    this.compileComponent('threeDotDropdown', {
      buttonClass: {
        class_one: true,
        class_two: false,
      },
      dropdownClass: {
        class_one: false,
        class_two: true,
      },
      menuClass: {
        class_one: true,
        class_two: true,
      },
      onClickFn: 'click($event)',
      onKeydownFn: 'keydown($event)',
      buttonAriaLabel: this.$scope.ariaLabel,
    });

    expect(this.controller.ariaLabel).toBe(this.$scope.ariaLabel);
    expect(this.view.find(DROPDOWN)).not.toHaveClass(class_one);
    expect(this.view.find(DROPDOWN)).toHaveClass(class_two);
    expect(this.view.find(BUTTON)).toHaveClass(class_one);
    expect(this.view.find(BUTTON)).not.toHaveClass(class_two);
    expect(this.view.find(MENU)).toHaveClass(class_one);
    expect(this.view.find(MENU)).toHaveClass(class_two);

    this.view.find(BUTTON).click();
    expect(this.$scope.click).toHaveBeenCalledTimes(1);
    expect(this.$scope.keydown).toHaveBeenCalledTimes(0);
    this.controller.onKeydown('dummy event');
    expect(this.$scope.click).toHaveBeenCalledTimes(1);
    expect(this.$scope.keydown).toHaveBeenCalledTimes(1);
  });

});
