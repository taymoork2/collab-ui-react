import { TooltipUtil, IBaseTooltipController } from 'modules/core/accessibility/tooltips/tooltip.util';

const LINK_TOOLTIP_BINDINGS = TooltipUtil.mkBaseTooltipBindings();
LINK_TOOLTIP_BINDINGS.ttHref = '@';

class LinkTooltipController implements ng.IComponentController, IBaseTooltipController {
  /* @ngInject */
  constructor() {
    _.assignInWith(this, TooltipUtil.mkBaseTooltipController(), TooltipUtil.assignBindings);
  }
}

export class LinkTooltipComponent implements ng.IComponentOptions {
  public template = require('./link-tooltip.html');
  public controller = LinkTooltipController;
  public bindings = LINK_TOOLTIP_BINDINGS;
  public transclude = true;
}
