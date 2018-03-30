interface IBindings {
  [boundProperty: string]: string;
}

export interface IBaseTooltipController {
  ttAriaLabel?: string;
  ttClass?: string;
  ttTabindex?: number;
  ttTooltipAnimation?: boolean;
  ttTooltipAppendToBody?: boolean;
  ttTooltipPlacement?: string;
  ttTooltipText?: string;
  ttTooltipUnsafeText?: string;
  onClickFn?: Function;
}

export class TooltipUtil {
  public static assignBindings(_destValue, _srcValue, propertyName, dest, src) {
    // copy over getters from source objects as-needed
    const srcPropertyDescriptor = Object.getOwnPropertyDescriptor(src, propertyName);
    if (!srcPropertyDescriptor) {
      return;
    }
    if (srcPropertyDescriptor.get || srcPropertyDescriptor.set) {
      Object.defineProperty(dest, propertyName, srcPropertyDescriptor);
    }
  }

  public static mkBaseTooltipBindings(customBindings: IBindings = {}): IBindings {
    // bindings shared between all tooltip types
    const BASE_TOOLTIP_BINDINGS = {
      ttClass: '@?',
      ttAriaLabel: '@?',
      ttTabindex: '<?',
      onClickFn: '&?',
      ttTooltipAnimation: '<?',
      ttTooltipAppendToBody: '<?',
      ttTooltipClass: '@?',
      ttTooltipPlacement: '@?',
      ttTooltipText: '@',
      ttTooltipUnsafeText: '@?',
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
        return _.isBoolean(this.ttTooltipAnimation) ? this.ttTooltipAnimation : true;
      },

      get classes(): string {
        const cursor = _.isFunction(this.onClickFn) ? '' : 'default-pointer';
        const icon = _.isString(this.ttClass) ? this.ttClass : this.defaultClass;
        return `${icon} ${cursor}`;
      },

      get appendToBody(): boolean {
        return _.isBoolean(this.ttTooltipAppendToBody) ? this.ttTooltipAppendToBody : false;
      },

      get ariaLabel(): string | undefined {
        // ttAriaLabel is only necessary when creating a tooltip-html-unsafe or in cases where
        // the aria-label may need to include additional information not found in the tooltip-text
        return _.isString(this.ttAriaLabel) ? this.ttAriaLabel : this.ttTooltipText;
      },

      get isSafe(): boolean {
        return !_.isString(this.ttTooltipUnsafeText);
      },

      get placement(): string {
        return _.isString(this.ttTooltipPlacement) ? this.ttTooltipPlacement : 'top';
      },

      get role(): string {
        // overridden by link-tooltip
        return _.isFunction(this.onClickFn) ? 'button' : 'tooltip';
      },

      get tabindex(): number {
        // tabindex should be an integer; defaults to 0
        return (_.isNumber(this.ttTabindex) && _.isInteger(this.ttTabindex)) ? this.ttTabindex : 0;
      },

      onClick(): void {
        if (_.isFunction(this.onClickFn)) {
          this.onClickFn();
        }
      },
    };
  }
}
