interface IBindings {
  [boundProperty: string]: string;
}

export interface IBaseTooltipController {
  csAriaLabel?: string;
  csClass?: string;
  csTabindex?: number;
  csTooltipAnimation?: boolean;
  csTooltipAppendToBody?: boolean;
  csTooltipPlacement?: string;
  csTooltipText?: string;
  csTooltipUnsafeText?: string;
  onClickFn?: Function;
}

export class TooltipUtil {
  public static mkBaseTooltipBindings(customBindings: IBindings = {}): IBindings {
    // bindings shared between all tooltip types
    const BASE_TOOLTIP_BINDINGS = {
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

    return { ...BASE_TOOLTIP_BINDINGS, ...customBindings };
  }

  public static mkBaseTooltipController(options: {
    defaultClass: string,
  } = {
    defaultClass: '',
  }): ng.IComponentController {
    const { defaultClass } = options;

    // Actions shared between all tooltip types
    return <IBaseTooltipController>{
      // allows for easy override of the default returned by 'get classes()'
      defaultClass: defaultClass,

      get animation(): boolean {
        return _.isBoolean(this.csTooltipAnimation) ? this.csTooltipAnimation : true;
      },

      get classes(): string {
        const cursor = _.isFunction(this.onClickFn) ? '' : 'default-pointer';
        const icon = _.isString(this.csClass) ? this.csClass : this.defaultClass;
        return `${icon} ${cursor}`;
      },

      get appendToBody(): boolean {
        return _.isBoolean(this.csTooltipAppendToBody) ? this.csTooltipAppendToBody : false;
      },

      get ariaLabel(): string | undefined {
        // csAriaLabel is only necessary when creating a tooltip-html-unsafe
        return _.isString(this.csAriaLabel) ? this.csAriaLabel : this.csTooltipText;
      },

      get isSafe(): boolean {
        return !_.isString(this.csTooltipUnsafeText);
      },

      get placement(): string {
        return _.isString(this.csTooltipPlacement) ? this.csTooltipPlacement : 'top';
      },

      get role(): string {
        // overridden by link-tooltip
        return _.isFunction(this.onClickFn) ? 'button' : 'tooltip';
      },

      get tabindex(): number {
        // tabindex should be an integer; defaults to 0
        return (_.isNumber(this.csTabindex) && _.isInteger(this.csTabindex)) ? this.csTabindex : 0;
      },

      onClick(): void {
        if (_.isFunction(this.onClickFn)) {
          this.onClickFn();
        }
      },
    };
  }
}
