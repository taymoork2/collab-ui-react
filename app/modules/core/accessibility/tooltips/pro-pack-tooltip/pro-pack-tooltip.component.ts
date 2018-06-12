import { TooltipUtil, IBaseTooltipController } from 'modules/core/accessibility/tooltips/tooltip.util';

const PRO_PACK_TOOLTIP_BINDINGS = TooltipUtil.mkBaseTooltipBindings();

class ProPackTooltipController implements ng.IComponentController, IBaseTooltipController {

  /* @ngInject */
  constructor() {
    _.assignInWith(this, TooltipUtil.mkBaseTooltipController(), TooltipUtil.assignBindings);
  }
}

export class ProPackTooltipComponent implements ng.IComponentOptions {
  public template = require('./pro-pack-tooltip.html');
  public controller = ProPackTooltipController;
  public bindings = PRO_PACK_TOOLTIP_BINDINGS;
}
