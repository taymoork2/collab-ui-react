import threeDotDropdownModule from './index';

describe('Component: threeDotDropdown', () => {
  const DROPDOWN = '.actions-menu';
  const BUTTON = 'button';
  const MENU = 'ul';

  beforeEach(function () {
    this.initModules(threeDotDropdownModule);
    this.injectDependencies();
  });

  it('should work with class strings and the default aria label', function () {
    this.$scope.buttonClass = 'buttonClass';
    this.$scope.dropdownClass = 'dropdownClass';
    this.$scope.menuClass = 'menuClass';

    this.compileComponent('threeDotDropdown', {
      buttonClass: 'buttonClass',
      dropdownClass: 'dropdownClass',
      menuClass: 'menuClass',
      onClickFn: _.noop,
    });

    expect(this.controller.ariaLabel).toBe('common.toggleMenu');
    expect(this.view.find(DROPDOWN)[0].classList.contains(this.$scope.dropdownClass)).toBe(true);
    expect(this.view.find(BUTTON)[0].classList.contains(this.$scope.buttonClass)).toBe(true);
    expect(this.view.find(MENU)[0].classList.contains(this.$scope.menuClass)).toBe(true);

    spyOn(this.controller, 'onClickFn');
    this.view.find(BUTTON).click();
    expect(this.controller.onClickFn).toHaveBeenCalledTimes(1);
    this.controller.onKeydown('dummy event');
    expect(this.controller.onClickFn).toHaveBeenCalledTimes(2);
  });

  it('should work with class objects and a provided aria label', function () {
    let classToggle = true;
    const class_one = 'class_one';
    const class_two = 'class_two';

    this.$scope.ariaLabel = 'aria label';
    this.$scope.class = {
      class_one: () => {
        return classToggle;
      },
      class_two: () => {
        return !classToggle;
      },
    };

    this.compileComponent('threeDotDropdown', {
      buttonClass: 'class',
      dropdownClass: 'class',
      menuClass: 'class',
      onClickFn: _.noop,
      onKeydownFn: _.noop,
      tddAriaLabel: this.$scope.ariaLabel,
    });

    expect(this.controller.ariaLabel).toBe(this.$scope.ariaLabel);
    expect(this.view.find(DROPDOWN)[0].classList.contains(class_one)).toBe(true);
    expect(this.view.find(BUTTON)[0].classList.contains(class_one)).toBe(true);
    expect(this.view.find(MENU)[0].classList.contains(class_one)).toBe(true);

    classToggle = false;
    this.$scope.$apply();
    expect(this.view.find(DROPDOWN)[0].classList.contains(class_two)).toBe(true);
    expect(this.view.find(BUTTON)[0].classList.contains(class_two)).toBe(true);
    expect(this.view.find(MENU)[0].classList.contains(class_two)).toBe(true);

    spyOn(this.controller, 'onClickFn');
    spyOn(this.controller, 'onKeydownFn');
    this.view.find(BUTTON).click();
    expect(this.controller.onClickFn).toHaveBeenCalledTimes(1);
    expect(this.controller.onKeydownFn).toHaveBeenCalledTimes(0);
    this.controller.onKeydown('dummy event');
    expect(this.controller.onClickFn).toHaveBeenCalledTimes(1);
    expect(this.controller.onKeydownFn).toHaveBeenCalledTimes(1);
  });

});
