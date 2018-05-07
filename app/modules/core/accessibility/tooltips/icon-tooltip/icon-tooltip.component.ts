import { TooltipUtil, IBaseTooltipController } from 'modules/core/accessibility/tooltips/tooltip.util';

const ICON_TOOLTIP_BINDINGS = TooltipUtil.mkBaseTooltipBindings();

class IconTooltipController implements ng.IComponentController, IBaseTooltipController {
  /* @ngInject */
  constructor() {
    _.assignInWith(this, TooltipUtil.mkBaseTooltipController({
      // defaults the icon trigger to (i)
      defaultClass: 'icon-information',
    }), TooltipUtil.assignBindings);
  }
}

export class IconTooltipComponent implements ng.IComponentOptions {
  public template = require('./icon-tooltip.html');
  public controller = IconTooltipController;
  public bindings = ICON_TOOLTIP_BINDINGS;
}
