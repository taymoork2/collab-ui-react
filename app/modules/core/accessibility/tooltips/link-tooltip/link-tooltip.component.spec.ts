import tooltipModuleName from 'modules/core/accessibility/tooltips';

describe('Component: linkTooltip', () => {
  beforeEach(function () {
    this.initModules(tooltipModuleName);
    this.injectDependencies();
  });

  it('should display with all default variables and no html-unsafe when tt-tooltip-text is used', function () {
    const tooltipText = 'Tooltip Text';

    this.compileComponent('linkTooltip', {
      ttHref: 'http://www.fake.com',
      ttTooltipText: tooltipText,
    });

    expect(this.controller.animation).toBe(true);
    expect(this.controller.appendToBody).toBe(false);
    expect(this.controller.ariaLabel).toBe(tooltipText);
    expect(this.controller.classes).toBe(` default-pointer`);
    expect(this.controller.isSafe).toBe(true);
    expect(this.controller.placement).toBe('top');
    expect(this.controller.tabindex).toBe(0);
    expect(this.controller.trigger).toBe('mouseenter focus');
    expect(this.controller.ttTooltipText).toBe(tooltipText);
    expect(this.controller.ttTooltipUnsafeText).toBe(undefined);
  });

  it('should display with all provided variables and html-unsafe when tt-tooltip-unsafe-text is used', function () {
    const textClass = 'textClass';
    const left = 'left';
    const mouseenter = 'mouseenter';
    const tooltipClass = 'tooltip';
    const ariaText = 'Tooltip Text';
    const tooltipText = 'Tooltip<br>Text';

    this.compileComponent('linkTooltip', {
      ttHref: 'http://www.fake.com',
      ttAriaLabel: ariaText,
      ttClass: textClass,
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
    expect(this.controller.classes).toBe(`${textClass} default-pointer`);
    expect(this.controller.isSafe).toBe(false);
    expect(this.controller.placement).toBe(left);
    expect(this.controller.tabindex).toBe(-1);
    expect(this.controller.trigger).toBe(mouseenter);
    expect(this.controller.ttTooltipText).toBe(undefined);
    expect(this.controller.ttTooltipUnsafeText).toBe(tooltipText);
  });
});
