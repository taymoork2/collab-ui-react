import TooltipModule from '../index';

describe('Component: iconTooltip', () => {
  const ICON = 'i';

  beforeEach(function () {
    this.initModules(TooltipModule);
    this.injectDependencies('$scope');
  });

  it('should display with all default variables and no html-unsafe when tt-tooltip-text is used', function () {
    const tooltipText = 'Tooltip Text';

    this.compileComponent('iconTooltip', {
      ttTooltipText: tooltipText,
      onClickFn: _.noop,
    });

    expect(this.controller.animation).toBe(true);
    expect(this.controller.appendToBody).toBe(false);
    expect(this.controller.ariaLabel).toEqual(tooltipText);
    expect(this.controller.classes).toEqual('icon-information ');
    expect(this.controller.isSafe).toBe(true);
    expect(this.controller.placement).toEqual('top');
    expect(this.controller.role).toEqual('button');
    expect(this.controller.tabindex).toBe(0);
    expect(this.controller.trigger).toBe('mouseenter focus');
    expect(this.controller.ttTooltipText).toEqual(tooltipText);
    expect(this.controller.ttTooltipUnsafeText).toBe(undefined);

    spyOn(this.controller, 'onClickFn');
    this.view.find(ICON).click();
    this.$scope.$apply();
    expect(this.controller.onClickFn).toHaveBeenCalled();
  });

  it('should display with all provided variables and html-unsafe when tt-tooltip-unsafe-text is used', function () {
    const iconClass = 'any-other-icon';
    const left = 'left';
    const mouseenter = 'mouseenter';
    const tooltipClass = 'tooltip';
    const ariaText = 'Tooltip Text';
    const tooltipText = 'Tooltip</br>Text';

    this.compileComponent('iconTooltip', {
      ttAriaLabel: ariaText,
      ttClass: iconClass,
      ttTabindex: -1,
      ttTooltipAnimation: false,
      ttTooltipAppendToBody: true,
      ttTooltipClass: tooltipClass,
      ttTooltipPlacement: left,
      ttTooltipTrigger: mouseenter,
      ttTooltipUnsafeText: tooltipText,
    });

    expect(this.controller.animation).toBe(false);
    expect(this.controller.appendToBody).toBe(true);
    expect(this.controller.ariaLabel).toEqual(ariaText);
    expect(this.controller.classes).toEqual(`${iconClass} default-pointer`);
    expect(this.controller.isSafe).toBe(false);
    expect(this.controller.placement).toEqual(left);
    expect(this.controller.role).toEqual('tooltip');
    expect(this.controller.tabindex).toBe(-1);
    expect(this.controller.trigger).toBe(mouseenter);
    expect(this.controller.ttTooltipText).toBe(undefined);
    expect(this.controller.ttTooltipUnsafeText).toEqual(tooltipText);
  });
});
