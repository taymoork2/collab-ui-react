import TooltipModule from '../index';

describe('Component: buttonTooltip', () => {
  const BUTTON = 'button';

  beforeEach(function () {
    this.initModules(TooltipModule);
    this.injectDependencies('$scope');
  });

  it('should display with all default variables and no html-unsafe when tt-tooltip-text is used', function () {
    const tooltipText = 'Tooltip Text';

    this.compileComponent('buttonTooltip', {
      ttTooltipText: tooltipText,
      onClickFn: _.noop,
    });

    expect(this.controller.animation).toBe(true);
    expect(this.controller.appendToBody).toBe(false);
    expect(this.controller.ariaLabel).toEqual(tooltipText);
    expect(this.controller.classes).toEqual(' ');
    expect(this.controller.disabled).toBe(false);
    expect(this.controller.isSafe).toBe(true);
    expect(this.controller.loading).toBe(false);
    expect(this.controller.placement).toEqual('top');
    expect(this.controller.tabindex).toBe(0);
    expect(this.controller.trigger).toBe('mouseenter focus');
    expect(this.controller.ttTooltipText).toEqual(tooltipText);
    expect(this.controller.ttTooltipUnsafeText).toBe(undefined);

    spyOn(this.controller, 'onClickFn');
    this.view.find(BUTTON).click();
    this.$scope.$apply();
    expect(this.controller.onClickFn).toHaveBeenCalled();
  });

  it('should display with all provided variables and html-unsafe when tt-tooltip-unsafe-text is used', function () {
    const btnClass = 'btn';
    const left = 'left';
    const mouseenter = 'mouseenter';
    const tooltipClass = 'tooltip';
    const ariaText = 'Tooltip Text';
    const tooltipText = 'Tooltip</br>Text';

    this.compileComponent('buttonTooltip', {
      ttAriaLabel: ariaText,
      ttClass: btnClass,
      ttTabindex: -1,
      ttTooltipAnimation: false,
      ttTooltipAppendToBody: true,
      ttTooltipClass: tooltipClass,
      ttTooltipPlacement: left,
      ttTooltipTrigger: mouseenter,
      ttTooltipUnsafeText: tooltipText,
      onClickFn: _.noop,
    });

    expect(this.controller.animation).toBe(false);
    expect(this.controller.appendToBody).toBe(true);
    expect(this.controller.ariaLabel).toEqual(ariaText);
    expect(this.controller.classes).toEqual(`${btnClass} `);
    expect(this.controller.disabled).toBe(false);
    expect(this.controller.isSafe).toBe(false);
    expect(this.controller.loading).toBe(false);
    expect(this.controller.placement).toEqual(left);
    expect(this.controller.tabindex).toBe(-1);
    expect(this.controller.trigger).toBe(mouseenter);
    expect(this.controller.ttTooltipText).toBe(undefined);
    expect(this.controller.ttTooltipUnsafeText).toEqual(tooltipText);

    spyOn(this.controller, 'onClickFn');
    this.view.find(BUTTON).click();
    this.$scope.$apply();
    expect(this.controller.onClickFn).toHaveBeenCalled();
  });

  it('should display with all default variables and html-unsafe when tt-tooltip-unsafe-text is used', function () {
    this.compileComponent('buttonTooltip', {
      ttDisabled: true,
      ttLoading: true,
      ttTooltipText: 'Tooltip Text',
      onClickFn: _.noop,
    });

    expect(this.controller.disabled).toBe(true);
    expect(this.controller.loading).toBe(true);
  });
});
