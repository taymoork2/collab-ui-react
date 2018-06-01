import tooltipModuleName from 'modules/core/accessibility/tooltips';

describe('Component: proPackTooltip', () => {
  const PRO_PACK = 'cr-pro-pack-icon';

  beforeEach(function () {
    this.initModules(tooltipModuleName);
    this.injectDependencies();
  });

  it('should display with all default variables and no html-unsafe when tt-tooltip-text is used', function () {
    const tooltipText = 'Tooltip Text';

    this.compileComponent('proPackTooltip', {
      ttTooltipText: tooltipText,
      onClickFn: _.noop,
    });

    expect(this.controller.animation).toBe(true);
    expect(this.controller.appendToBody).toBe(false);
    expect(this.controller.ariaLabel).toBe(tooltipText);
    expect(this.controller.classes).toBe(' ');
    expect(this.controller.isSafe).toBe(true);
    expect(this.controller.placement).toBe('top');
    expect(this.controller.role).toBe('button');
    expect(this.controller.tabindex).toBe(0);
    expect(this.controller.trigger).toBe('mouseenter focus');
    expect(this.controller.ttTooltipText).toBe(tooltipText);
    expect(this.controller.ttTooltipUnsafeText).toBe(undefined);

    spyOn(this.controller, 'onClickFn');
    this.view.find(PRO_PACK).click();
    expect(this.controller.onClickFn).toHaveBeenCalled();
  });

  it('should display with all provided variables and html-unsafe when tt-tooltip-unsafe-text is used', function () {
    const iconClass = 'any-other-icon';
    const left = 'left';
    const mouseenter = 'mouseenter';
    const tooltipClass = 'tooltip';
    const ariaText = 'Tooltip Text';
    const tooltipText = 'Tooltip<br>Text';

    this.compileComponent('proPackTooltip', {
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
    expect(this.controller.ariaLabel).toBe(ariaText);
    expect(this.controller.classes).toBe(`${iconClass} default-pointer`);
    expect(this.controller.isSafe).toBe(false);
    expect(this.controller.placement).toBe(left);
    expect(this.controller.role).toBe('tooltip');
    expect(this.controller.tabindex).toBe(-1);
    expect(this.controller.trigger).toBe(mouseenter);
    expect(this.controller.ttTooltipText).toBe(undefined);
    expect(this.controller.ttTooltipUnsafeText).toBe(tooltipText);
  });
});
