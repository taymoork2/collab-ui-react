// bindings shared between all tooltip types
export const BASE_TOOLTIP_BINDINGS = {
  csClass: '@?',
  csAriaLabel: '@?',
  csTabindex: '<?',
  onClickFn: '&?',
  csTooltipAnimation: '<?',
  csTooltipAppendToBody: '<?',
  csTooltipClass: '@?',
  csTooltipPlacement: '@?',
  csTooltipText: '@',
  csTooltipUnsafeText: '@?',
};

// Actions shared between all tooltip types
export abstract class BaseTooltipCtrl implements ng.IComponentController  {
  public csAriaLabel?: string;
  public csClass?: string;
  public csTabindex?: number;
  public csTooltipAnimation?: boolean;
  public csTooltipAppendToBody?: boolean;
  public csTooltipPlacement?: string;
  public csTooltipText?: string;
  public csTooltipUnsafeText?: string;
  public onClickFn?: Function;

  // allows for easy override of the default returned by 'get classes()'
  protected defaultClass: string = '';

  constructor() {}

  public get animation(): boolean {
    return _.isBoolean(this.csTooltipAnimation) ? this.csTooltipAnimation : true;
  }

  public get classes(): string {
    const cursor = _.isFunction(this.onClickFn) ? '' : 'default-pointer';
    const icon = _.isString(this.csClass) ? this.csClass : this.defaultClass;
    return `${icon} ${cursor}`;
  }

  public get appendToBody(): boolean {
    return _.isBoolean(this.csTooltipAppendToBody) ? this.csTooltipAppendToBody : false;
  }

  public get ariaLabel(): string | undefined {
    // csAriaLabel is only necessary when creating a tooltip-html-unsafe
    return _.isString(this.csAriaLabel) ? this.csAriaLabel : this.csTooltipText;
  }

  public get isSafe(): boolean {
    return !_.isString(this.csTooltipUnsafeText);
  }

  public get placement(): string {
    return _.isString(this.csTooltipPlacement) ? this.csTooltipPlacement : 'top';
  }

  public get role(): string {
    // overridden by link-tooltip
    return _.isFunction(this.onClickFn) ? 'button' : 'tooltip';
  }

  public get tabindex(): number {
    // tabindex should be an integer; defaults to 0
    return (_.isNumber(this.csTabindex) && _.isInteger(this.csTabindex)) ? this.csTabindex : 0;
  }

  public onClick(): void {
    if (_.isFunction(this.onClickFn)) {
      this.onClickFn();
    }
  }
}
